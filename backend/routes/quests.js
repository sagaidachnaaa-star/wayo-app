const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// GET all quests
router.get("/", async (req, res) => {
  try {
    const [quests] = await pool.query(`
      SELECT 
        id,
        title,
        location,
        description,
        overview,
        difficulty,
        duration_min,
        distance_km,
        accessibility,
        image_url,
        latitude,
        longitude,
        is_daily
      FROM quests
      ORDER BY created_at DESC
    `);

    res.json(quests);
  } catch (error) {
    console.error("Error fetching quests:", error);
    res.status(500).json({
      message: "Failed to fetch quests",
      error: error.message,
    });
  }
});

// GET one quest by id, including stops, notes, and badge
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [questRows] = await pool.query(
      `
      SELECT 
        id,
        title,
        location,
        description,
        overview,
        difficulty,
        duration_min,
        distance_km,
        accessibility,
        image_url,
        latitude,
        longitude,
        is_daily
      FROM quests
      WHERE id = ?
      `,
      [id]
    );

    if (questRows.length === 0) {
      return res.status(404).json({ message: "Quest not found" });
    }

    const quest = questRows[0];

    const [stops] = await pool.query(
      `
      SELECT 
        id,
        stop_order,
        stop_type,
        label,
        title,
        description,
        latitude,
        longitude
      FROM quest_stops
      WHERE quest_id = ?
      ORDER BY stop_order ASC
      `,
      [id]
    );

    const [accessibilityNotes] = await pool.query(
      `
      SELECT 
        id,
        title,
        text
      FROM quest_accessibility_notes
      WHERE quest_id = ?
      `,
      [id]
    );

    const [badgeRows] = await pool.query(
      `
      SELECT 
        id,
        title,
        description,
        image_url
      FROM badges
      WHERE quest_id = ?
      `,
      [id]
    );

    res.json({
      ...quest,
      stops,
      accessibility_notes: accessibilityNotes,
      badge: badgeRows[0] || null,
    });
  } catch (error) {
    console.error("Error fetching quest:", error);
    res.status(500).json({
      message: "Failed to fetch quest",
      error: error.message,
    });
  }
});

module.exports = router;