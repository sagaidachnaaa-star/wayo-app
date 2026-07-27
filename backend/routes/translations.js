const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// GET /api/translations/:languageCode — all interface text for one language
router.get("/:languageCode", async (req, res) => {
  const { languageCode } = req.params;

  try {
    const [languageRows] = await pool.query(
      "SELECT code, font_family FROM languages WHERE code = ? AND is_active = TRUE",
      [languageCode]
    );

    if (languageRows.length === 0) {
      return res.status(404).json({ message: `Unsupported language code: ${languageCode}` });
    }

    const [translationRows] = await pool.query(
      "SELECT translation_key, content FROM translations WHERE language_code = ?",
      [languageCode]
    );

    const translations = {};
    translationRows.forEach((row) => {
      translations[row.translation_key] = row.content;
    });

    res.json({
      language: languageRows[0].code,
      fontFamily: languageRows[0].font_family,
      translations,
    });
  } catch (error) {
    console.error("Error fetching translations:", error);
    res.status(500).json({ message: "Failed to fetch translations", error: error.message });
  }
});

module.exports = router;
