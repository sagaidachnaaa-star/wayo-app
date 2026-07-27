const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// GET /api/languages — active languages available in the app
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT code, name, native_name, font_family
      FROM languages
      WHERE is_active = TRUE
      ORDER BY id ASC
      `
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching languages:", error);
    res.status(500).json({ message: "Failed to fetch languages", error: error.message });
  }
});

module.exports = router;
