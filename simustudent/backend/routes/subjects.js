// routes/subjects.js
const express = require("express");
const router  = express.Router();
const db      = require("../db");

// GET /api/subjects/available?semester=HK1
router.get("/available", async (req, res) => {
  const { semester } = req.query;
  try {
    let query = "SELECT * FROM subjects";
    const params = [];
    if (semester) {
      query += " WHERE FIND_IN_SET(?, semester_avail) > 0";
      params.push(semester);
    }
    const [rows] = await db.execute(query, params);
    res.json({ subjects: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/subjects — all
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT * FROM subjects ORDER BY category, credits");
    res.json({ subjects: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;