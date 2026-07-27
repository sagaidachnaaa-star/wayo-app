require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./db/connection");
const questsRouter = require("./routes/quests");
const savedRouter = require("./routes/saved");
const completedRouter = require("./routes/completed");
const reportsRouter = require("./routes/reports");
const usersRouter = require("./routes/users");
const languagesRouter = require("./routes/languages");
const translationsRouter = require("./routes/translations");

const app = express();
const PORT = process.env.PORT || 5050;

// Local development: allow the Vite dev server whether it's opened via
// localhost or the Mac's LAN IP, so the app also works from a phone on the
// same Wi-Fi network. In production (Railway), FRONTEND_URL is also allowed
// so the deployed frontend can reach this backend.
const allowedOriginPattern =
  /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOriginPattern.test(origin) || origin === process.env.FRONTEND_URL) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
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

// Demo user profile (single demo user, no auth yet)
app.use("/api/users", usersRouter);

// Language switcher (available languages + interface translations)
app.use("/api/languages", languagesRouter);
app.use("/api/translations", translationsRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`WAYO backend running on http://localhost:${PORT}`);
  console.log(`Also reachable from other devices on the same network at http://<your-mac-ip>:${PORT}`);
});
