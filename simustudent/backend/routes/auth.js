// routes/auth.js
const express  = require("express");
const bcrypt   = require("bcryptjs");
const router   = express.Router();
const db       = require("../db");

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, password, full_name, mssv } = req.body;
  if (!username || !password) return res.status(400).json({ error: "Thieu thong tin" });
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      "INSERT INTO users (username, password, full_name, mssv) VALUES (?,?,?,?)",
      [username, hash, full_name || "", mssv || ""]
    );
    res.json({ success: true, userId: result.insertId });
  } catch (e) {
    if (e.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "Ten dang nhap da ton tai" });
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE username=?", [username]);
    if (!rows.length) return res.status(401).json({ error: "Sai ten dang nhap hoac mat khau" });
    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Sai ten dang nhap hoac mat khau" });
    req.session.userId = user.id;
    req.session.userName = user.full_name;
    res.json({ success: true, user: { id: user.id, full_name: user.full_name, mssv: user.mssv } });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Chua dang nhap" });
  const [rows] = await db.execute("SELECT id, username, full_name, mssv FROM users WHERE id=?", [req.session.userId]);
  if (!rows.length) return res.status(404).json({ error: "Khong tim thay user" });
  res.json({ user: rows[0] });
});

module.exports = router;