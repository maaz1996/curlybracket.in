const test = require("node:test");
const assert = require("node:assert/strict");
const { validatePost } = require("../src/server");

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

test("accepts a complete story with a supported category and secure image URL", () => {
  assert.equal(validatePost(validPost), null);
});

test("rejects a malformed slug", () => {
  assert.match(validatePost({ ...validPost, slug: "Not a slug" }), /URL slug/);
});

test("rejects unsupported categories and publication states", () => {
  assert.match(validatePost({ ...validPost, category: "Other" }), /Choose Technology/);
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
