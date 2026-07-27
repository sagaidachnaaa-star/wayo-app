const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// MVP has a single demo user — no login/auth yet.
const DEMO_USER_ID = 1;

function normalizeLang(lang) {
  return lang === "uk" ? "uk" : "en";
}

// GET /api/saved — all quests the demo user has saved, newest first
router.get("/", async (req, res) => {
  const lang = normalizeLang(req.query.lang);

  try {
    const [rows] = await pool.query(
      `
      SELECT
        q.id,
        COALESCE(qt.title, q.title) AS title,
        COALESCE(qt.location, q.location) AS location,
        COALESCE(qt.short_description, q.description) AS description,
        COALESCE(qt.full_description, q.overview) AS overview,
        q.difficulty,
        q.duration_min,
        q.distance_km,
        q.accessibility,
        q.image_url,
        q.latitude,
        q.longitude,
        q.is_daily,
        sq.saved_at
      FROM saved_quests sq
      JOIN quests q ON q.id = sq.quest_id
      LEFT JOIN quest_translations qt ON qt.quest_id = q.id AND qt.language_code = ?
      WHERE sq.user_id = ?
      ORDER BY sq.saved_at DESC
      `,
      [lang, DEMO_USER_ID]
    );

    res.json(rows);
  } catch (error) {
    console.error("Error fetching saved quests:", error);
    res.status(500).json({ message: "Failed to fetch saved quests", error: error.message });
  }
});

// POST /api/saved/:questId — save a quest for the demo user
router.post("/:questId", async (req, res) => {
  const { questId } = req.params;

  try {
    // The saved_quests table has a UNIQUE(user_id, quest_id) constraint —
    // INSERT IGNORE just silently no-ops if it's already saved.
    await pool.query("INSERT IGNORE INTO saved_quests (user_id, quest_id) VALUES (?, ?)", [
      DEMO_USER_ID,
      questId,
    ]);
    res.json({ status: "OK", saved: true, questId });
  } catch (error) {
    console.error("Error saving quest:", error);
    res.status(500).json({ message: "Failed to save quest", error: error.message });
  }
});

// DELETE /api/saved/:questId — remove a saved quest for the demo user
router.delete("/:questId", async (req, res) => {
  const { questId } = req.params;

  try {
    await pool.query("DELETE FROM saved_quests WHERE user_id = ? AND quest_id = ?", [
      DEMO_USER_ID,
      questId,
    ]);
    res.json({ status: "OK", saved: false, questId });
  } catch (error) {
    console.error("Error removing saved quest:", error);
    res.status(500).json({ message: "Failed to remove saved quest", error: error.message });
  }
});

module.exports = router;
