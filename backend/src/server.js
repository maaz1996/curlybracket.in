require("dotenv").config();

const bcrypt = require("bcryptjs");
const cors = require("cors");
const express = require("express");
const { rateLimit } = require("express-rate-limit");
const helmet = require("helmet");
const jwt = require("jsonwebtoken");
const { initializeDatabase, pool } = require("./db");

const app = express();
const port = Number(process.env.PORT || 4000);
const categories = new Set(["Technology", "Travel", "Business"]);
const allowedOrigins = (process.env.FRONTEND_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("This website is not allowed to access the API."));
  },
}));
app.use(express.json({ limit: "1mb" }));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many sign-in attempts. Please wait a little and try again." },
});

function requireConfiguration() {
  const required = ["DB_HOST", "DB_NAME", "DB_USER", "ADMIN_EMAIL", "ADMIN_PASSWORD_HASH", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
  if (process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be at least 32 characters long.");
  }
}

function authorizeAdmin(req, res, next) {
  const authorization = req.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Sign in to manage stories." });
  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET);
    if (claims.email !== process.env.ADMIN_EMAIL.toLowerCase()) {
      return res.status(401).json({ error: "Your session is not valid. Please sign in again." });
    }
    return next();
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
}

function validatePost(body) {
  const fields = ["title", "slug", "category", "excerpt", "content", "cover_url", "author", "status"];
  if (!body || typeof body !== "object" || Array.isArray(body)) return "A story is required.";
  for (const field of fields) {
    if (typeof body[field] !== "string" || !body[field].trim()) return `${field.replace("_", " ")} is required.`;
  }
  if (body.title.length > 180 || body.slug.length > 180 || body.excerpt.length > 320 || body.author.length > 100) {
    return "One or more fields exceed the allowed length.";
  }
  if (body.cover_url.length > 2048) return "The cover image URL is too long.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug)) {
    return "The URL slug may only contain lowercase letters, numbers, and single hyphens.";
  }
  if (!categories.has(body.category)) return "Choose Technology, Travel, or Business as the topic.";
  if (body.status !== "draft" && body.status !== "published") return "Choose draft or published as the status.";
  if (body.content.length > 50000) return "The story must be shorter than 50,000 characters.";
  try {
    const coverUrl = new URL(body.cover_url);
    if (!["http:", "https:"].includes(coverUrl.protocol)) return "The cover image must use an http or https URL.";
  } catch {
    return "Enter a valid cover image URL.";
  }
  return null;
}

function serializePost(row) {
  return {
    ...row,
    published_at: row.published_at ? new Date(row.published_at).toISOString() : null,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString(),
  };
}

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.get("/api/posts", async (req, res, next) => {
  try {
    const category = req.query.category;
    if (category && !categories.has(category)) return res.status(400).json({ error: "Unknown story topic." });
    const [rows] = await pool.query(
      `SELECT id, title, slug, category, excerpt, cover_url, author, status, published_at, created_at, updated_at
       FROM posts WHERE status = 'published' ${category ? "AND category = ?" : ""}
       ORDER BY published_at DESC, id DESC`,
      category ? [category] : []
    );
    return res.json({ posts: rows.map(serializePost) });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/posts/:slug", async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT id, title, slug, category, excerpt, content, cover_url, author, status, published_at, created_at, updated_at
       FROM posts WHERE slug = ? AND status = 'published' LIMIT 1`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: "Story not found." });
    return res.json({ post: serializePost(rows[0]) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/admin/login", loginLimiter, async (req, res, next) => {
  const { email, password } = req.body || {};
  if (typeof email !== "string" || typeof password !== "string") {
    return res.status(400).json({ error: "Enter your administrator email and password." });
  }
  try {
    const emailMatches = email.trim().toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const passwordMatches = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
    if (!emailMatches || !passwordMatches) return res.status(401).json({ error: "Email or password is incorrect." });
    const token = jwt.sign({ email: process.env.ADMIN_EMAIL.toLowerCase() }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

app.get("/api/admin/posts", authorizeAdmin, async (_req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, slug, category, excerpt, content, cover_url, author, status, published_at, created_at, updated_at
       FROM posts ORDER BY updated_at DESC, id DESC`
    );
    return res.json({ posts: rows.map(serializePost) });
  } catch (error) {
    return next(error);
  }
});

app.post("/api/admin/posts", authorizeAdmin, async (req, res, next) => {
  const invalid = validatePost(req.body);
  if (invalid) return res.status(400).json({ error: invalid });
  try {
    const post = req.body;
    const [result] = await pool.execute(
      `INSERT INTO posts (title, slug, category, excerpt, content, cover_url, author, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, IF(? = 'published', CURRENT_TIMESTAMP, NULL))`,
      [post.title.trim(), post.slug, post.category, post.excerpt.trim(), post.content.trim(), post.cover_url.trim(), post.author.trim(), post.status, post.status]
    );
    const [rows] = await pool.execute("SELECT * FROM posts WHERE id = ?", [result.insertId]);
    return res.status(201).json({ post: serializePost(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "That URL slug is already in use. Choose another one." });
    return next(error);
  }
});

app.put("/api/admin/posts/:id", authorizeAdmin, async (req, res, next) => {
  const invalid = validatePost(req.body);
  if (invalid) return res.status(400).json({ error: invalid });
  try {
    const post = req.body;
    const [result] = await pool.execute(
      `UPDATE posts SET title = ?, slug = ?, category = ?, excerpt = ?, content = ?, cover_url = ?, author = ?, status = ?,
       published_at = IF(? = 'published', COALESCE(published_at, CURRENT_TIMESTAMP), NULL)
       WHERE id = ?`,
      [post.title.trim(), post.slug, post.category, post.excerpt.trim(), post.content.trim(), post.cover_url.trim(), post.author.trim(), post.status, post.status, req.params.id]
    );
    const [rows] = await pool.execute("SELECT * FROM posts WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Story not found." });
    return res.json({ post: serializePost(rows[0]) });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") return res.status(409).json({ error: "That URL slug is already in use. Choose another one." });
    return next(error);
  }
});

app.delete("/api/admin/posts/:id", authorizeAdmin, async (req, res, next) => {
  try {
    const [result] = await pool.execute("DELETE FROM posts WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Story not found." });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  if (res.headersSent) return;
  if (error.message === "This website is not allowed to access the API.") {
    return res.status(403).json({ error: error.message });
  }
  return res.status(500).json({ error: "The server could not complete that request." });
});

async function start() {
  requireConfiguration();
  await initializeDatabase();
  app.listen(port, () => console.log(`Curlybracket API listening on port ${port}`));
}

if (require.main === module) {
  start().catch((error) => {
    console.error("Could not start the Curlybracket API:", error.message);
    process.exitCode = 1;
  });
}

module.exports = { app, validatePost };
