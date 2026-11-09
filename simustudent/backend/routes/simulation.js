// routes/simulation.js
const express = require("express");
const router  = express.Router();
const db      = require("../db");

// Middleware: require login
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Chưa đăng nhập" });
  next();
}

// POST /api/sim/start — Bắt đầu simulation mới
router.post("/start", requireLogin, async (req, res) => {
  try {
    const userId = req.session.userId;
    const [existing] = await db.execute(
      "SELECT id FROM simulations WHERE user_id=? AND status='active'", [userId]
    );
    if (existing.length) return res.json({ simId: existing[0].id, resumed: true });

    const [result] = await db.execute(
      "INSERT INTO simulations (user_id) VALUES (?)", [userId]
    );
    res.json({ simId: result.insertId, resumed: false });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/sim/state — Lấy trạng thái hiện tại
router.get("/state", requireLogin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      "SELECT * FROM simulations WHERE user_id=? AND status='active' LIMIT 1",
      [req.session.userId]
    );
    if (!rows.length) return res.status(404).json({ error: "Chưa có simulation" });
    res.json({ sim: rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/sim/register-courses — Đăng ký môn học cho kỳ
router.post("/register-courses", requireLogin, async (req, res) => {
  const { simId, semester, year, subjectIds } = req.body;
  if (!subjectIds || !subjectIds.length) return res.status(400).json({ error: "Không có môn học được chọn" });

  try {
    const placeholders = subjectIds.map(() => "?").join(",");
    const [subjects] = await db.execute(
      `SELECT * FROM subjects WHERE id IN (${placeholders})`, subjectIds
    );
    const totalCredits = subjects.reduce((sum, s) => sum + s.credits, 0);
    const maxTC = semester === "He" ? 10 : 25;
    const minTC = semester === "He" ? 6  : 12;

    if (totalCredits < minTC) return res.status(400).json({ error: "Quá ít tín chỉ (tối thiểu " + minTC + " TC)" });
    if (totalCredits > maxTC) return res.status(400).json({ error: "Vượt quá giới hạn (tối đa " + maxTC + " TC)" });

    const [semResult] = await db.execute(
      "INSERT INTO simulation_semesters (simulation_id, year, term, registered_credits) VALUES (?,?,?,?)",
      [simId, year, semester, totalCredits]
    );
    const semId = semResult.insertId;

    for (const s of subjects) {
      await db.execute(
        "INSERT INTO semester_courses (semester_id, subject_id, study_hours_alloc) VALUES (?,?,?)",
        [semId, s.id, s.credits * 2]
      );
    }

    res.json({ success: true, semesterId: semId, totalCredits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/sim/process-week — Tính toán và cập nhật chỉ số theo tuần
router.post("/process-week", requireLogin, async (req, res) => {
  const { week, studyHours, restHours, funHours, totalCredits } = req.body;
  try {
    const classHours = Math.round((totalCredits || 15) * 1.5);
    const totalUsed = classHours + (studyHours || 0) + (restHours || 56) + (funHours || 0);

    if (totalUsed > 168) {
      return res.status(400).json({ error: "Vượt quá ngân sách 168 giờ/tuần!" });
    }

    const studyEff = Math.min(1, (studyHours || 0) / ((totalCredits || 15) * 2));
    const knowledgeGain = Math.round(studyEff * 8 + (classHours / (totalCredits || 15)) * 2);
    const restScore = (restHours || 56) >= 56 ? 1 : (restHours || 56) / 56;
    const healthDelta = Math.round(restScore * 3 + ((funHours || 0) >= 7 ? 2 : 0) - 2);
    const stressDelta = Math.round(
      ((totalCredits || 15) > 20 ? 8 : (totalCredits || 15) > 15 ? 5 : 3) -
      ((funHours || 0) >= 10 ? 3 : 0) -
      ((restHours || 56) >= 63 ? 2 : 0)
    );

    res.json({
      success: true,
      week,
      deltas: { knowledge: knowledgeGain, health: healthDelta, stress: stressDelta }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/sim/finish-term — Kết thúc kỳ, tính điểm và xếp loại
router.post("/finish-term", requireLogin, async (req, res) => {
  const { semesterId, courseScores } = req.body;
  try {
    let weightedGpaSum = 0, totalCredits = 0, passedCredits = 0;
    const gradePoints = { "A+": 4.0, "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0 };

    for (const cs of courseScores) {
      const total = +(cs.midterm * 0.4 + cs.final * 0.6).toFixed(2);
      let grade;
      if (total >= 9.0) grade = "A+"; else if (total >= 8.5) grade = "A";
      else if (total >= 8.0) grade = "B+"; else if (total >= 7.0) grade = "B";
      else if (total >= 6.5) grade = "C+"; else if (total >= 5.5) grade = "C";
      else if (total >= 5.0) grade = "D+"; else if (total >= 4.0) grade = "D";
      else grade = "F";
      const passed = total >= 4.0;

      const [courseRow] = await db.execute(
        "SELECT sc.id, s.credits FROM semester_courses sc JOIN subjects s ON sc.subject_id=s.id WHERE sc.id=?",
        [cs.courseId]
      );
      if (!courseRow.length) continue;
      const credits = courseRow[0].credits;

      await db.execute(
        "UPDATE semester_courses SET midterm_score=?, final_score=?, course_gpa=?, letter_grade=?, is_passed=? WHERE id=?",
        [cs.midterm, cs.final, gradePoints[grade], grade, passed, cs.courseId]
      );

      weightedGpaSum += gradePoints[grade] * credits;
      totalCredits   += credits;
      if (passed) passedCredits += credits;
    }

    const termGPA = totalCredits ? +(weightedGpaSum / totalCredits).toFixed(2) : 0;
    await db.execute(
      "UPDATE simulation_semesters SET term_gpa=?, passed_credits=? WHERE id=?",
      [termGPA, passedCredits, semesterId]
    );

    const [simRow] = await db.execute(
      "SELECT simulation_id FROM simulation_semesters WHERE id=?", [semesterId]
    );
    if (simRow.length) {
      const simId = simRow[0].simulation_id;
      const [allSems] = await db.execute(
        "SELECT term_gpa, passed_credits FROM simulation_semesters WHERE simulation_id=?", [simId]
      );
      const totalTC  = allSems.reduce((s, r) => s + (r.passed_credits||0), 0);
      const cumGPA   = +(allSems.reduce((s, r) => s + (r.term_gpa||0), 0) / allSems.length).toFixed(2);
      await db.execute(
        "UPDATE simulations SET gpa=?, total_credits_earned=? WHERE id=?",
        [cumGPA, totalTC, simId]
      );
    }

    res.json({ success: true, termGPA, passedCredits });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/sim/history — Lịch sử các kỳ đã học
router.get("/history", requireLogin, async (req, res) => {
  try {
    const [sims] = await db.execute(
      "SELECT * FROM simulations WHERE user_id=? ORDER BY created_at DESC", [req.session.userId]
    );
    res.json({ simulations: sims });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;