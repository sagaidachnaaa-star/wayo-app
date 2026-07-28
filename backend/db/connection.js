const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Belt-and-braces alongside the `charset` option above: guarantee every
// pooled connection's session explicitly matches the tables' actual
// charset/collation, regardless of what a given MySQL server negotiates
// by default for a bare connection.
pool.on("connection", (connection) => {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci");
});

module.exports = pool; 