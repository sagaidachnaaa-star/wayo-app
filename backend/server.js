require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/connection");
const questsRouter = require("./routes/quests");
const savedRouter = require("./routes/saved");
const completedRouter = require("./routes/completed");
const reportsRouter = require("./routes/reports");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Quick check that the server itself is up.
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "WAYO backend is running" });
});

// Quick check that the server can actually reach MySQL.
app.get("/api/test-db", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "OK", database: "connected" });
  } catch (error) {
    res.status(500).json({
      status: "ERROR",
      database: "not connected",
      error: error.message,
    });
  }
});

// Quest routes
app.use("/api/quests", questsRouter);

// Saved quests (single demo user, no auth yet)
app.use("/api/saved", savedRouter);

// Completed quests / Passport (single demo user, no auth yet)
app.use("/api/completed", completedRouter);

// Report a Problem submissions (single demo user, no auth yet)
app.use("/api/reports", reportsRouter);

app.listen(PORT, () => {
  console.log(`WAYO backend running on http://localhost:${PORT}`);
});