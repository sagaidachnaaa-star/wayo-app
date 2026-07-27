const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// Only English and Ukrainian are seeded — anything else falls back to the
// base (English) table content untouched, same as if lang were omitted.
function normalizeLang(lang) {
  return lang === "uk" ? "uk" : "en";
}

// GET all quests
router.get("/", async (req, res) => {
  const lang = normalizeLang(req.query.lang);

  try {
    // COALESCE falls back to the base (English) column whenever no
    // translation row exists for this language — including English itself,
    // since English content only ever lives in the base tables.
    const [quests] = await pool.query(
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
        q.is_daily
      FROM quests q
      LEFT JOIN quest_translations qt ON qt.quest_id = q.id AND qt.language_code = ?
      ORDER BY q.created_at DESC
      `,
      [lang]
    );

    // Tags are fetched separately (one query for every quest) and attached
    // in JS below, rather than GROUP_CONCAT — simpler to read and avoids
    // any string-splitting edge cases if a tag name ever contains a comma.
    const [tagRows] = await pool.query(`
      SELECT qt.quest_id, t.name
      FROM quest_tags qt
      JOIN tags t ON t.id = qt.tag_id
      ORDER BY qt.quest_id, qt.tag_id
    `);

    const tagsByQuestId = {};
    tagRows.forEach((row) => {
      if (!tagsByQuestId[row.quest_id]) tagsByQuestId[row.quest_id] = [];
      tagsByQuestId[row.quest_id].push(row.name);
    });

    const questsWithTags = quests.map((quest) => ({
      ...quest,
      tags: tagsByQuestId[quest.id] ?? [],
    }));

    res.json(questsWithTags);
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
  const lang = normalizeLang(req.query.lang);

  try {
    const [questRows] = await pool.query(
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
        q.is_daily
      FROM quests q
      LEFT JOIN quest_translations qt ON qt.quest_id = q.id AND qt.language_code = ?
      WHERE q.id = ?
      `,
      [lang, id]
    );

    if (questRows.length === 0) {
      return res.status(404).json({ message: "Quest not found" });
    }

    const quest = questRows[0];

    const [stops] = await pool.query(
      `
      SELECT
        qs.id,
        qs.stop_order,
        qs.stop_type,
        qs.label,
        COALESCE(qst.title, qs.title) AS title,
        COALESCE(qst.description, qs.description) AS description,
        qs.latitude,
        qs.longitude
      FROM quest_stops qs
      LEFT JOIN quest_stop_translations qst ON qst.quest_stop_id = qs.id AND qst.language_code = ?
      WHERE qs.quest_id = ?
      ORDER BY qs.stop_order ASC
      `,
      [lang, id]
    );

    const [accessibilityNotes] = await pool.query(
      `
      SELECT
        qan.id,
        COALESCE(ant.title, qan.title) AS title,
        COALESCE(ant.content, qan.text) AS text
      FROM quest_accessibility_notes qan
      LEFT JOIN accessibility_note_translations ant
        ON ant.accessibility_note_id = qan.id AND ant.language_code = ?
      WHERE qan.quest_id = ?
      `,
      [lang, id]
    );

    const [badgeRows] = await pool.query(
      `
      SELECT
        b.id,
        COALESCE(bt.title, b.title) AS title,
        COALESCE(bt.description, b.description) AS description,
        b.image_url
      FROM badges b
      LEFT JOIN badge_translations bt ON bt.badge_id = b.id AND bt.language_code = ?
      WHERE b.quest_id = ?
      `,
      [lang, id]
    );

    const [tagRows] = await pool.query(
      `
      SELECT t.name
      FROM quest_tags qt
      JOIN tags t ON t.id = qt.tag_id
      WHERE qt.quest_id = ?
      ORDER BY qt.tag_id
      `,
      [id]
    );

    res.json({
      ...quest,
      tags: tagRows.map((row) => row.name),
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
