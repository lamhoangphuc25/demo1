// result.js — SimuStudent Result Screen

document.addEventListener("DOMContentLoaded", () => {
  const gs = JSON.parse(localStorage.getItem("simState") || "{}");
  const reg = JSON.parse(localStorage.getItem("currentSemesterRegistration") || "{}");

  if (!reg.subjects) {
    alert("Không có dữ liệu học kỳ!");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nav-student-name").textContent = gs.studentName || "Lâm Hoàng Phúc";
  updateSoundIcon();

  // ---- Tính điểm từng môn học ----
  const courseResults = reg.subjects.map(s => {
    const knowledge = Math.min(100, gs.courseKnowledge?.[s.id] || 0);
    const healthMod  = gs.health < 50 ? 0.85 : 1.0;
    const stressMod  = gs.stress > 70 ? 0.90 : 1.0;
    const diffPenalty = s.difficulty >= 4 ? 0.92 : 1.0;

    const baseMidterm = knowledge * 0.75 * healthMod * stressMod * diffPenalty;
    const baseFinal   = knowledge * 0.88 * healthMod * stressMod * diffPenalty;

    const midterm = Math.min(10, Math.max(0, (baseMidterm / 10) + (Math.random() - 0.5) * 1.2));
    const final_  = Math.min(10, Math.max(0, (baseFinal  / 10) + (Math.random() - 0.5) * 1.2));
    const total   = +(midterm * 0.4 + final_ * 0.6).toFixed(1);

    let grade, gradeClass;
    if (total >= 9.0)      { grade = "A+"; gradeClass = "grade-A"; }
    else if (total >= 8.5) { grade = "A";  gradeClass = "grade-A"; }
    else if (total >= 8.0) { grade = "B+"; gradeClass = "grade-B"; }
    else if (total >= 7.0) { grade = "B";  gradeClass = "grade-B"; }
    else if (total >= 6.5) { grade = "C+"; gradeClass = "grade-C"; }
    else if (total >= 5.5) { grade = "C";  gradeClass = "grade-C"; }
    else if (total >= 5.0) { grade = "D+"; gradeClass = "grade-D"; }
    else if (total >= 4.0) { grade = "D";  gradeClass = "grade-D"; }
    else                   { grade = "F";  gradeClass = "grade-F"; }

    const passed = total >= 4.0;
    return { ...s, midterm: +midterm.toFixed(1), final: +final_.toFixed(1), total, grade, gradeClass, passed };
  });

  // ---- Tính GPA kỳ này ----
  const passedSubjects = courseResults.filter(c => c.passed);
  const totalPassedCredits = passedSubjects.reduce((acc, c) => acc + c.credits, 0);

  const gradePoints = { "A+": 4.0, "A": 4.0, "B+": 3.5, "B": 3.0, "C+": 2.5, "C": 2.0, "D+": 1.5, "D": 1.0, "F": 0 };
  let weightedSum = 0;
  courseResults.forEach(c => { weightedSum += gradePoints[c.grade] * c.credits; });
  const termGPA = +(weightedSum / reg.totalCredits).toFixed(2);

  const prevAccumTC  = gs.accumulatedCredits || 0;
  const newAccumTC   = prevAccumTC + totalPassedCredits;

  const prevTerms = JSON.parse(localStorage.getItem("termHistory") || "[]");
  const allTermGPAs = [...prevTerms.map(t => t.gpa), termGPA];
  const cumGPA = +(allTermGPAs.reduce((a, b) => a + b, 0) / allTermGPAs.length).toFixed(2);

  gs.gpa = cumGPA;
  gs.accumulatedCredits = newAccumTC;
  gs.week = 1;
  gs.knowledge = Math.max(0, gs.knowledge - 15);
  localStorage.setItem("simState", JSON.stringify(gs));

  const termRecord = { semester: reg.semester, year: reg.year, gpa: termGPA, credits: totalPassedCredits };
  prevTerms.push(termRecord);
  localStorage.setItem("termHistory", JSON.stringify(prevTerms));

  // Phát âm thanh
  if (window.sound) {
    if (termGPA >= 2.5) window.sound.fanfare();
    else window.sound.warning();
  }

  // ---- RENDER GIAO DIỆN ----
  document.getElementById("result-gpa").textContent  = termGPA.toFixed(2);
  document.getElementById("hero-tc-term").textContent = totalPassedCredits;
  document.getElementById("hero-tc-accum").textContent = newAccumTC;
  document.getElementById("hero-health").textContent = gs.health;

  const gpaCircle = document.getElementById("gpa-circle");
  if (termGPA >= 3.6)       gpaCircle.style.borderColor = "#4ade80";
  else if (termGPA >= 2.5)  gpaCircle.style.borderColor = "#60a5fa";
  else if (termGPA >= 2.0)  gpaCircle.style.borderColor = "#fbbf24";
  else                      gpaCircle.style.borderColor = "#f87171";

  document.getElementById("result-title").textContent =
    termGPA >= 3.6 ? "Xuất sắc! Học kỳ đạt thành tích đỉnh cao! 🌟" :
    termGPA >= 3.0 ? "Giỏi lắm! Bạn đã hoàn thành kỳ học rất tốt! 👏" :
    termGPA >= 2.0 ? "Đã hoàn thành học kỳ! Cần cố gắng hơn kỳ tới." :
    "Học kỳ nhiều khó khăn – Đừng nản lòng, hãy làm lại!";

  const failedCount = courseResults.filter(c => !c.passed).length;
  const cards = [
    { num: termGPA.toFixed(2), label: "GPA kỳ này", icon: "fa-star", color: "var(--primary)" },
    { num: cumGPA.toFixed(2), label: "GPA tích lũy", icon: "fa-chart-line", color: "var(--success)" },
    { num: totalPassedCredits, label: "Tín chỉ qua môn", icon: "fa-circle-check", color: "var(--success)" },
    { num: failedCount, label: "Môn nợ / rớt", icon: "fa-triangle-exclamation", color: failedCount > 0 ? "var(--danger)" : "var(--gray-500)" }
  ];
  document.getElementById("summary-cards").innerHTML = cards.map(c => `
    <div class="col-6 col-md-3">
      <div class="summary-card">
        <div style="font-size:1.6rem;color:${c.color};margin-bottom:4px"><i class="fa-solid ${c.icon}"></i></div>
        <div class="summary-num" style="color:${c.color}">${c.num}</div>
        <div class="summary-label">${c.label}</div>
      </div>
    </div>`).join("");

  document.getElementById("grade-table-body").innerHTML = courseResults.map(c => `
    <tr>
      <td><strong>${c.name}</strong><br><small class="text-muted">${c.code} • ${c.credits} TC</small></td>
      <td class="text-center">${c.midterm}</td>
      <td class="text-center">${c.final}</td>
      <td class="text-center"><strong>${c.total}</strong></td>
      <td class="text-center"><span class="grade-badge ${c.gradeClass}">${c.grade}</span></td>
      <td class="text-center">
        ${c.passed
          ? '<span class="pass-badge"><i class="fa-solid fa-check me-1"></i>Đạt</span>'
          : '<span class="fail-badge"><i class="fa-solid fa-xmark me-1"></i>Rớt môn</span>'}
      </td>
    </tr>`).join("");

  const pct = Math.min(100, Math.round((newAccumTC / 120) * 100));
  document.getElementById("grad-bar").style.width = pct + "%";
  document.getElementById("grad-label").textContent = newAccumTC + " / 120 TC";
  document.getElementById("grad-pct").textContent   = pct + "%";

  const remainingTC = Math.max(0, 120 - newAccumTC);
  const semestersLeft = Math.ceil(remainingTC / (reg.totalCredits || 15));
  const yearsLeft = (semestersLeft / 2).toFixed(1);
  const predBox = document.getElementById("prediction-box");
  if (newAccumTC >= 120) {
    predBox.style.background = "var(--success-light)";
    predBox.style.borderLeftColor = "var(--success)";
    predBox.innerHTML = '<i class="fa-solid fa-graduation-cap me-2 text-success"></i><strong>Chúc mừng! Bạn đã hoàn thành 120 tín chỉ và đủ điều kiện nhận bằng tốt nghiệp! 🎓</strong>';
  } else {
    predBox.innerHTML = `
      <i class="fa-solid fa-clock me-2" style="color:var(--primary)"></i>
      Còn cần <strong>${remainingTC} tín chỉ</strong> nữa. Dự kiến khoảng <strong>${semestersLeft} học kỳ</strong> (~${yearsLeft} năm) nếu bạn duy trì tốc độ hiện tại.`;
  }

  const analyses = [];
  if (termGPA >= 3.6) analyses.push({ icon: "fa-trophy", color: "var(--warning)", text: "Học lực Xuất Sắc! Cơ hội rất cao nhận học bổng sinh viên giỏi." });
  if (gs.health < 50) analyses.push({ icon: "fa-heart-crack", color: "var(--danger)", text: "Cảnh báo sức khỏe suy giảm! Kỳ tới hãy ngủ nhiều hơn và bớt thức khuya." });
  if (gs.stress > 65) analyses.push({ icon: "fa-fire", color: "var(--danger)", text: "Mức độ căng thẳng cao! Nên dành ít nhất 10 giờ/tuần giải trí." });
  if (reg.totalCredits > 20) analyses.push({ icon: "fa-bolt", color: "var(--primary)", text: "Đăng ký tải nặng (>20 TC) giúp rút ngắn đáng kể thời gian ra trường!" });
  if (failedCount > 0) analyses.push({ icon: "fa-rotate-right", color: "var(--warning)", text: `Bạn còn nợ ${failedCount} môn. Đừng quên đăng ký học lại ở học kỳ hè!` });
  if (analyses.length === 0) analyses.push({ icon: "fa-thumbs-up", color: "var(--success)", text: "Học kỳ diễn ra ổn định, phong độ cân bằng rất tốt!" });

  document.getElementById("analysis-list").innerHTML = analyses.map(a => `
    <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px;font-size:.85rem">
      <i class="fa-solid ${a.icon}" style="color:${a.color};margin-top:2px;flex-shrink:0"></i>
      <span>${a.text}</span>
    </div>`).join("");

  const history = gs.weekHistory || [];
  if (history.length > 0) {
    const ctx = document.getElementById("weekChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: history.map(h => "T" + h.week),
        datasets: [
          { label: "Kiến thức", data: history.map(h => h.knowledge), borderColor: "#2563eb", backgroundColor: "rgba(37,99,235,.08)", tension: .3, fill: true },
          { label: "Sức khỏe", data: history.map(h => h.health), borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,.05)", tension: .3, fill: false },
          { label: "Stress", data: history.map(h => h.stress), borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,.05)", tension: .3, fill: false }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "top" } },
        scales: { y: { min: 0, max: 100, ticks: { stepSize: 20 } } }
      }
    });
  }
});

function toggleSound() {
  if (window.sound) {
    const isMuted = window.sound.toggleMute();
    updateSoundIcon();
    showToast(isMuted ? "Đã tắt âm thanh" : "Đã bật âm thanh", "secondary");
  }
}

function updateSoundIcon() {
  const icon = document.getElementById("sound-icon");
  if (!icon || !window.sound) return;
  if (window.sound.muted) {
    icon.className = "fa-solid fa-volume-xmark text-danger";
  } else {
    icon.className = "fa-solid fa-volume-high text-primary";
  }
}

function nextSemester() {
  const reg = JSON.parse(localStorage.getItem("currentSemesterRegistration") || "{}");
  const gs  = JSON.parse(localStorage.getItem("simState") || "{}");

  let nextSem = "HK2", nextYear = reg.year || 1;
  if (reg.semester === "HK1") {
    nextSem = "HK2";
  } else if (reg.semester === "HK2") {
    nextSem = "He";
  } else {
    nextSem = "HK1";
    nextYear++;
  }

  gs.currentTerm = nextSem;
  gs.currentYear = nextYear;
  gs.week = 1;
  gs.weekHistory = [];
  gs.courseKnowledge = {};
  localStorage.setItem("simState", JSON.stringify(gs));
  localStorage.removeItem("currentSemesterRegistration");

  window.location.href = "register-course.html";
}

function resetGame() {
  if (!confirm("Bạn có chắc muốn bắt đầu lại từ đầu? Toàn bộ tiến trình sẽ được thiết lập lại!")) return;
  localStorage.removeItem("simState");
  localStorage.removeItem("currentSemesterRegistration");
  localStorage.removeItem("termHistory");
  window.location.href = "index.html";
}

function showToast(msg, type) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className   = "toast-custom " + (type || "");
  setTimeout(() => toast.classList.add("show"), 10);
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2800);
}