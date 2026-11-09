// server.js — SimuStudent Backend (Express + MySQL)
const express = require("express");
const cors    = require("cors");
const session = require("express-session");
const path    = require("path");
require("dotenv").config();

const app  = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors({ origin: "http://localhost:5500", credentials: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "simustudent_secret_key_2024",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Serve static frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// ---- Routes ----
const authRoutes       = require("./routes/auth");
const subjectRoutes    = require("./routes/subjects");
const simulationRoutes = require("./routes/simulation");

app.use("/api/auth",    authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/sim",     simulationRoutes);

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SimuStudent API is running!", timestamp: new Date() });
});

// ---- Catch-all: serve index.html ----
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, () => {
  console.log("SimuStudent server running at http://localhost:" + PORT);
});