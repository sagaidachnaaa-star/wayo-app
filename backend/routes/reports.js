const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// MVP has a single demo user — no login/auth yet.
const DEMO_USER_ID = 1;

// POST /api/reports — submit a Report a Problem entry for the demo user
router.post("/", async (req, res) => {
  const { issue_type, details, quest_id } = req.body ?? {};

  if (!issue_type || !details) {
    return res.status(400).json({ message: "issue_type and details are required" });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO reported_issues (user_id, quest_id, issue_type, details) VALUES (?, ?, ?, ?)",
      [DEMO_USER_ID, quest_id ?? null, issue_type, details]
    );
    res.json({ status: "OK", id: result.insertId });
  } catch (error) {
    console.error("Error submitting report:", error);
    res.status(500).json({ message: "Failed to submit report", error: error.message });
  }
});

// GET /api/reports — for testing in browser/Postman only, newest first
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM reported_issues ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ message: "Failed to fetch reports", error: error.message });
  }
});

module.exports = router;
