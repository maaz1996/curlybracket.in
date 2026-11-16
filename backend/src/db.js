const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === "true" ? {} : undefined,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: "utf8mb4",
});

async function initializeDatabase() {
  try {
    await pool.query("SELECT id FROM posts LIMIT 0");
  } catch (error) {
    if (error.code === "ER_NO_SUCH_TABLE") {
      throw new Error("The posts table is missing. Run backend/sql/schema.sql in your database console, then restart the API.");
    }
    throw error;
  }
}

module.exports = { pool, initializeDatabase };
