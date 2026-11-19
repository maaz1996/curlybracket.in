const test = require("node:test");
const assert = require("node:assert/strict");
const { app, validatePost } = require("../src/server");
const { pool } = require("../src/db");

const validPost = {
  title: "A thoughtful story",
  slug: "a-thoughtful-story",
  category: "Technology",
  excerpt: "A short introduction to the story.",
  content: "A story in plain text.",
  cover_url: "https://images.example.com/cover.jpg",
  author: "Maaz",
  status: "draft",
};

test("accepts a complete story with a topic and secure image URL", () => {
  assert.equal(validatePost(validPost), null);
  assert.equal(validatePost({ ...validPost, category: "Food and culture" }), null);
});

test("rejects a malformed slug", () => {
  assert.match(validatePost({ ...validPost, slug: "Not a slug" }), /URL slug/);
});

test("rejects invalid topics and publication states", () => {
  assert.match(validatePost({ ...validPost, category: " " }), /category is required/);
  assert.match(validatePost({ ...validPost, category: "x".repeat(101) }), /exceed the allowed length/);
  assert.match(validatePost({ ...validPost, status: "scheduled" }), /Choose draft or published/);
});

test("rejects non-http cover URLs and oversized story content", () => {
  assert.match(validatePost({ ...validPost, cover_url: "javascript:alert(1)" }), /http or https/);
  assert.match(validatePost({ ...validPost, content: "x".repeat(50001) }), /50,000 characters/);
});

test("rejects absent and incomplete story data", () => {
  assert.equal(validatePost(null), "A story is required.");
  assert.match(validatePost({ ...validPost, excerpt: " " }), /excerpt is required/);
});

test("filters stories by custom or named topics", async (t) => {
  const originalQuery = pool.query;
  const server = app.listen(0, "127.0.0.1");
  t.after(async () => {
    pool.query = originalQuery;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once("listening", resolve));
  const apiUrl = `http://127.0.0.1:${server.address().port}/api/posts`;

  pool.query = async (query, parameters) => {
    if (query.includes("NOT IN")) {
      assert.match(query, /AND category NOT IN \(\?, \?, \?\)/);
      assert.deepEqual(parameters, ["Technology", "Travel", "Business"]);
    } else {
      assert.match(query, /AND category = \?/);
      assert.deepEqual(parameters, ["Technology"]);
    }
    return [[], []];
  };

  assert.equal((await fetch(`${apiUrl}?category=Custom`)).status, 200);
  assert.equal((await fetch(`${apiUrl}?category=Technology`)).status, 200);
});

test("health endpoint reports server and database availability", async (t) => {
  const originalQuery = pool.query;
  const originalConsoleError = console.error;
  const server = app.listen(0, "127.0.0.1");
  t.after(async () => {
    pool.query = originalQuery;
    console.error = originalConsoleError;
    await new Promise((resolve) => server.close(resolve));
  });
  await new Promise((resolve) => server.once("listening", resolve));
  const address = server.address();
  const healthUrl = `http://127.0.0.1:${address.port}/api/health`;

  pool.query = async (query) => {
    assert.equal(query, "SELECT id FROM posts LIMIT 0");
    return [[], []];
  };
  const healthyResponse = await fetch(healthUrl);
  assert.equal(healthyResponse.status, 200);
  assert.deepEqual(
    (({ status, server: api, database }) => ({ status, server: api, database }))(await healthyResponse.json()),
    { status: "ok", server: "ok", database: "ok" }
  );

  console.error = () => {};
  pool.query = async () => {
    throw new Error("database unavailable");
  };
  const unhealthyResponse = await fetch(healthUrl);
  assert.equal(unhealthyResponse.status, 503);
  assert.deepEqual(
    (({ status, server: api, database }) => ({ status, server: api, database }))(await unhealthyResponse.json()),
    { status: "degraded", server: "ok", database: "error" }
  );
});
