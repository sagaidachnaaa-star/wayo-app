const express = require("express");
const router = express.Router();
const pool = require("../db/connection");

// MVP has a single demo user — no login/auth yet.

// GET /api/users/:id — basic profile info, including preferred_language
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, preferred_language FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user", error: error.message });
  }
});

// PUT /api/users/:id/language — update the demo user's preferred language
router.put("/:id/language", async (req, res) => {
  const { id } = req.params;
  const { languageCode } = req.body;

  if (!languageCode || typeof languageCode !== "string") {
    return res.status(400).json({ message: "languageCode is required" });
  }

  try {
    const [languageRows] = await pool.query(
      "SELECT code FROM languages WHERE code = ? AND is_active = TRUE",
      [languageCode]
    );

    if (languageRows.length === 0) {
      return res.status(400).json({ message: `Unsupported language code: ${languageCode}` });
    }

    const [result] = await pool.query("UPDATE users SET preferred_language = ? WHERE id = ?", [
      languageCode,
      id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ status: "OK", userId: Number(id), preferredLanguage: languageCode });
  } catch (error) {
    console.error("Error updating preferred language:", error);
    res.status(500).json({ message: "Failed to update preferred language", error: error.message });
  }
});

module.exports = router;
