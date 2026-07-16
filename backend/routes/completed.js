const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// MVP has a single demo user — no login/auth yet.
const DEMO_USER_ID = 1;

// GET /api/completed — all quests the demo user has completed, with badge info
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        q.id,
        q.title,
        q.location,
        q.description,
        q.overview,
        q.difficulty,
        q.duration_min,
        q.distance_km,
        q.accessibility,
        q.image_url,
        q.latitude,
        q.longitude,
        q.is_daily,
        cq.completed_at,
        b.title AS badge_title,
        b.description AS badge_description,
        b.image_url AS badge_image_url
      FROM completed_quests cq
      JOIN quests q ON q.id = cq.quest_id
      LEFT JOIN badges b ON b.quest_id = q.id
      WHERE cq.user_id = ?
      ORDER BY cq.completed_at DESC
      `,
      [DEMO_USER_ID]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching completed quests:", error);
    res.status(500).json({ message: "Failed to fetch completed quests", error: error.message });
  }
});

// GET /api/completed/:questId — has the demo user completed this one quest?
// Optional/for future use (e.g. Quest Detail's Start/Repeat button) — not
// wired into the frontend yet, added since it's cheap and was requested.
router.get("/:questId", async (req, res) => {
  const { questId } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT completed_at FROM completed_quests WHERE user_id = ? AND quest_id = ?",
      [DEMO_USER_ID, questId]
    );
    res.json({ completed: rows.length > 0, completedAt: rows[0]?.completed_at ?? null });
  } catch (error) {
    console.error("Error checking completed quest:", error);
    res.status(500).json({ message: "Failed to check completed quest", error: error.message });
  }
});

// POST /api/completed/:questId — mark a quest as completed for the demo user
router.post("/:questId", async (req, res) => {
  const { questId } = req.params;

  try {
    // completed_quests has a UNIQUE(user_id, quest_id) constraint —
    // INSERT IGNORE just silently no-ops if it's already marked complete.
    await pool.query("INSERT IGNORE INTO completed_quests (user_id, quest_id) VALUES (?, ?)", [
      DEMO_USER_ID,
      questId,
    ]);
    res.json({ status: "OK", completed: true, questId });
  } catch (error) {
    console.error("Error marking quest completed:", error);
    res.status(500).json({ message: "Failed to mark quest completed", error: error.message });
  }
});

module.exports = router;
