import React, { useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch, useParams } from "react-router-dom";
import "./index.css";

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");
const TOPICS = ["Technology", "Travel", "Business"];
const CATEGORIES = ["All stories", ...TOPICS, "Custom"];
const HEALTH_CHECK_INTERVAL = 30000;
const DEFAULT_COVER_URLS = {
  Technology: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=85",
  Travel: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85",
  Business: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85",
  Custom: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=85",
};
const DEMO_STORIES = [
  {
    id: "demo-1",
    title: "The quiet art of building something that lasts",
    slug: "building-something-that-lasts",
    excerpt: "Good businesses are rarely built in a rush. A few notes on patience, focus, and making useful things.",
    content: "The best work tends to look obvious only after someone has done it. Before that, it is a collection of small decisions made with care.\n\nStart with a problem you understand. Talk to the people living with it. Then make the simplest thing that genuinely helps. Repeat, listen, and keep showing up.",
    category: "Business",
    author: "Maaz",
    cover_url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=85",
    published_at: "2025-03-08T10:00:00.000Z",
  },
  {
    id: "demo-2",
    title: "A slower way to see a new city",
    slug: "a-slower-way-to-see-a-new-city",
    excerpt: "Skip the checklist for a day. The best travel memories often begin when you leave a little room for surprise.",
    content: "A city reveals itself in the spaces between the landmarks. Take the long way to breakfast. Follow a street that looks interesting. Stay long enough to recognize the corner shopkeeper.\n\nTravel is not just about how far you go. Sometimes it is about how closely you pay attention.",
    category: "Travel",
    author: "Maaz",
    cover_url: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1400&q=85",
    published_at: "2025-02-20T10:00:00.000Z",
  },
  {
    id: "demo-3",
    title: "Technology should make the human part easier",
    slug: "technology-and-the-human-part",
    excerpt: "A useful tool does more than move fast. It gives people a little more space to do what matters.",
    content: "We build technology because we want to extend what people can do. That is easy to forget when the tools themselves become the point.\n\nThe best products feel less like software and more like momentum: fewer repetitive tasks, clearer decisions, and more time for the work only a person can do.",
    category: "Technology",
    author: "Maaz",
    cover_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85",
    published_at: "2025-02-02T10:00:00.000Z",
  },
];

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" to="/" aria-label="Curlybracket home">
          curly<span>bracket</span><i>.</i>
        </Link>
        <nav className="main-nav" aria-label="Main navigation">
          <a href="/#stories">Stories</a>
          <a href="/#about">About</a>
          <Link className="admin-link" to="/admin">Write a story <span aria-hidden="true">↗</span></Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="site-footer" id="about">
      <div>
        <Link className="brand footer-brand" to="/">curly<span>bracket</span><i>.</i></Link>
        <p>Ideas for curious minds.<br />Notes on technology, travel &amp; building things.</p>
      </div>
      <div className="footer-note">Made for the long read <span>© {new Date().getFullYear()}</span></div>
    </footer>
  );
}

function AdminHealth() {
  const [health, setHealth] = useState({
    server: "checking",
    database: "checking",
    checkedAt: null,
  });

  useEffect(() => {
    let active = true;
    let controller;

    async function checkHealth() {
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 8000);
      try {
        const response = await fetch(`${API_URL}/health`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (active) {
          setHealth({
            server: data.server === "ok" ? "online" : "offline",
            database: data.database === "ok" ? "online" : "offline",
            checkedAt: data.checked_at || new Date().toISOString(),
          });
        }
      } catch {
        if (active) {
          setHealth({
            server: "offline",
            database: "unknown",
            checkedAt: new Date().toISOString(),
          });
        }
      } finally {
        window.clearTimeout(timeout);
      }
    }

    checkHealth();
    const interval = window.setInterval(checkHealth, HEALTH_CHECK_INTERVAL);
    return () => {
      active = false;
      window.clearInterval(interval);
      if (controller) controller.abort();
    };
  }, []);

  const healthy = health.server === "online" && health.database === "online";
  const checking = health.server === "checking";
  const alertMessage = health.server === "offline"
    ? "The API could not be reached. Check its URL, CORS configuration, or server status."
    : health.database === "offline"
      ? "The API is reachable, but its database check failed. Check the database connection, TLS settings, and posts table."
      : "";

  return (
    <section
      className={`health-panel${healthy ? " healthy" : checking ? " checking" : " unhealthy"}`}
      role={healthy || checking ? "status" : "alert"}
      aria-live="polite"
      aria-label="Admin system health"
    >
      <div className="health-heading">
        <span className="health-icon" aria-hidden="true">{healthy ? "✓" : checking ? "…" : "!"}</span>
        <div>
          <strong>{healthy ? "All systems operational" : checking ? "Checking system health" : "Attention needed"}</strong>
          <p>{alertMessage || (healthy ? "Your blog API and database are responding normally." : "Contacting the API and database health check.")}</p>
        </div>
      </div>
      <div className="health-services">
        <span><i className={`health-dot ${health.server}`} /> API server <b>{health.server}</b></span>
        <span><i className={`health-dot ${health.database}`} /> Database <b>{health.database}</b></span>
        {health.checkedAt && <small>Checked {new Date(health.checkedAt).toLocaleTimeString()}</small>}
      </div>
    </section>
  );
}

function formatDate(value) {
  if (!value) return "Draft";
  return new Date(value).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" });
}

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function StoryCard({ story, featured = false }) {
  return (
    <Link className={`story-card${featured ? " featured-card" : ""}`} to={`/article/${story.slug}`}>
      <div className="story-image-wrap">
        <img className="story-image" src={story.cover_url} alt="" loading="lazy" />
        <span className="category-tag">{story.category}</span>
      </div>
      <div className="story-copy">
        <div className="story-meta"><span>{story.author || "Curlybracket"}</span><span>{formatDate(story.published_at)}</span></div>
        <h3>{story.title}</h3>
        <p>{story.excerpt}</p>
        <span className="read-link">Read story <span aria-hidden="true">↗</span></span>
      </div>
    </Link>
  );
}

function Home() {
  const [stories, setStories] = useState([]);
  const [category, setCategory] = useState("All stories");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiMessage, setApiMessage] = useState("");

  useEffect(() => {
    request("/posts")
      .then(({ posts }) => setStories(posts))
      .catch(() => {
        setStories(DEMO_STORIES);
        setApiMessage("Showing sample stories. Connect the API and database to publish your own.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredStories = stories.filter((story) => {
    const matchesCategory = category === "All stories"
      || (category === "Custom" ? !TOPICS.includes(story.category) : story.category === category);
    const term = search.trim().toLowerCase();
    return matchesCategory && (!term || `${story.title} ${story.excerpt} ${story.category}`.toLowerCase().includes(term));
  });
  const [featured, ...moreStories] = filteredStories;

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-kicker"><span className="kicker-line" /> A journal for curious minds</div>
          <h1>Ideas worth<br /><em>staying</em> for.</h1>
          <div className="hero-bottom">
            <p>Thoughtful stories on technology, the places we go, and the things we build along the way.</p>
            <a className="circle-link" href="#stories" aria-label="Explore stories">↓</a>
          </div>
          <span className="hero-index">EST. 2025&nbsp; — &nbsp;INDEPENDENTLY CURIOUS</span>
        </section>

        <section className="stories-section" id="stories">
          <div className="section-heading">
            <div><span className="eyebrow">THE JOURNAL</span><h2>Recent stories<span>.</span></h2></div>
            <label className="search-box">
              <span className="sr-only">Search stories</span>
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find a story..." />
              <span aria-hidden="true">⌕</span>
            </label>
          </div>
          <div className="filter-row" aria-label="Filter stories">
            {CATEGORIES.map((item) => (
              <button key={item} className={category === item ? "filter-button active" : "filter-button"} onClick={() => setCategory(item)}>{item}</button>
            ))}
            <span className="story-count">{filteredStories.length} {filteredStories.length === 1 ? "STORY" : "STORIES"}</span>
          </div>
          {apiMessage && <p className="notice">{apiMessage}</p>}
          {loading ? <p className="empty-state">Gathering stories...</p> : filteredStories.length ? (
            <div className="story-grid">
              <StoryCard story={featured} featured />
              {moreStories.map((story) => <StoryCard key={story.id || story.slug} story={story} />)}
            </div>
          ) : <p className="empty-state">No stories here yet. Try another topic.</p>}
          <div className="journal-note"><span>01</span><p>A little curiosity goes a long way.</p><span>✳</span></div>
        </section>
        <section className="newsletter">
          <div><span className="eyebrow">A NOTE FROM THE JOURNAL</span><h2>Good ideas travel.<br /><em>Pass one along.</em></h2></div>
          <Link className="newsletter-link" to="/admin">Have a story to share? <span>Write with us ↗</span></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Article() {
  const { slug } = useParams();
  const [story, setStory] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const localStory = DEMO_STORIES.find((item) => item.slug === slug);
    request(`/posts/${encodeURIComponent(slug)}`)
      .then(({ post }) => setStory(post))
      .catch((requestError) => {
        if (localStory) setStory(localStory);
        else setError(requestError.message);
      });
  }, [slug]);

  if (error) return <><Header /><main className="article-empty"><h1>Story not found.</h1><p>{error}</p><Link className="text-button" to="/">Back to the journal ←</Link></main><Footer /></>;
  if (!story) return <><Header /><main className="article-empty">Loading story...</main></>;
  return (
    <>
      <Header />
      <main className="article-page">
        <Link className="back-link" to="/">← Back to stories</Link>
        <div className="article-heading"><span className="category-tag">{story.category}</span><h1>{story.title}</h1><p>{story.excerpt}</p><div className="story-meta"><span>Words by {story.author || "Curlybracket"}</span><span>{formatDate(story.published_at)}</span></div></div>
        <img className="article-cover" src={story.cover_url} alt="" />
        <div className="article-content">{story.content.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <div className="article-end">— &nbsp;Thanks for reading&nbsp; —</div>
      </main>
      <Footer />
    </>
  );
}

const EMPTY_FORM = { title: "", slug: "", category: "Technology", excerpt: "", content: "", cover_url: DEFAULT_COVER_URLS.Technology, author: "Maaz", status: "draft" };

function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem("curlybracket_admin_token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [customCategory, setCustomCategory] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadPosts(authToken = token) {
    const data = await request("/admin/posts", { token: authToken });
    setPosts(data.posts);
  }

  useEffect(() => {
    if (!token) return;
    loadPosts().catch((loadError) => {
      localStorage.removeItem("curlybracket_admin_token");
      setToken("");
      setError(loadError.message);
    });
  // loadPosts uses the current token and should run only when auth changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await request("/admin/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("curlybracket_admin_token", data.token);
      setToken(data.token);
      setPassword("");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  }

  function startEdit(post) {
    setEditingId(post.id);
    const isCustomCategory = !TOPICS.includes(post.category);
    setForm({ title: post.title, slug: post.slug, category: isCustomCategory ? "Custom" : post.category, excerpt: post.excerpt, content: post.content, cover_url: post.cover_url, author: post.author, status: post.status });
    setCustomCategory(isCustomCategory ? post.category : "");
    setMessage("");
    setError("");
    window.scrollTo(0, 0);
  }

  function resetEditor() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setCustomCategory("");
    setError("");
    setMessage("");
  }

  async function savePost(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const story = {
      ...form,
      category: form.category === "Custom" ? customCategory.trim() : form.category,
      cover_url: form.cover_url.trim() || DEFAULT_COVER_URLS[form.category],
    };
    if (!form.cover_url.trim()) setForm({ ...form, cover_url: story.cover_url });
    try {
      const data = await request(editingId ? `/admin/posts/${editingId}` : "/admin/posts", {
        method: editingId ? "PUT" : "POST",
        token,
        body: JSON.stringify(story),
      });
      await loadPosts();
      setMessage(story.status === "published" ? "Story published." : "Draft saved.");
      if (!editingId && data.post) setEditingId(data.post.id);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setBusy(false);
    }
  }

  async function deletePost(post) {
    if (!window.confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    setBusy(true);
    setError("");
    try {
      await request(`/admin/posts/${post.id}`, { method: "DELETE", token });
      setPosts((current) => current.filter((item) => item.id !== post.id));
      if (editingId === post.id) resetEditor();
      setMessage("Story deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("curlybracket_admin_token");
    setToken("");
    setPosts([]);
    resetEditor();
  }

  return (
    <>
      <Header />
      <div className="admin-health-wrap"><AdminHealth /></div>
      {!token ? (
        <main className="login-page">
          <Link className="back-link" to="/">← Back to the journal</Link>
          <div className="login-card">
            <span className="eyebrow">THE EDITOR'S ROOM</span><h1>Welcome back<span>.</span></h1>
            <p>Sign in with the administrator account configured for your blog.</p>
            <form onSubmit={signIn} className="form-stack">
              <label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
              <label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button" disabled={busy}>{busy ? "Signing in..." : "Sign in"} <span>↗</span></button>
            </form>
          </div>
        </main>
      ) : (
        <main className="admin-page">
          <div className="admin-top"><div><span className="eyebrow">THE EDITOR'S ROOM</span><h1>Your stories<span>.</span></h1></div><div className="admin-actions"><Link className="text-button" to="/">View journal ↗</Link><button className="quiet-button" onClick={logout}>Sign out</button></div></div>
          {error && <p className="form-error admin-notice" role="alert">{error}</p>}
          {message && <p className="success-message" role="status">{message}</p>}
          <div className="admin-layout">
            <form className="editor-panel" onSubmit={savePost}>
              <div className="editor-heading"><h2>{editingId ? "Edit story" : "New story"}</h2>{editingId && <button className="quiet-button" type="button" onClick={resetEditor}>New story +</button>}</div>
              <label>Title<input required maxLength="180" value={form.title} onChange={(event) => { const title = event.target.value; setForm({ ...form, title, ...(!editingId && (!form.slug || form.slug === slugify(form.title)) ? { slug: slugify(title) } : {}) }); }} placeholder="A title worth stopping for" /></label>
              <label>URL slug<input required maxLength="180" value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="your-story-title" /><span className="field-hint">This becomes the readable link to your story. It is generated from the title and can be changed.</span></label>
              <div className="form-row">
                <label>Topic<select value={form.category} onChange={(event) => {
                  const category = event.target.value;
                  setForm({ ...form, category, cover_url: DEFAULT_COVER_URLS[category] });
                  if (category === "Custom") setCustomCategory("");
                }}>{[...TOPICS, "Custom"].map((item) => <option key={item}>{item}</option>)}</select></label>
                <label>Byline<input required maxLength="100" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} /></label>
              </div>
              {form.category === "Custom" && <label>Custom topic<input required maxLength="100" value={customCategory} onChange={(event) => setCustomCategory(event.target.value)} placeholder="e.g. Food, culture, or personal essays" /><span className="field-hint">Name the topic for this story. It will appear on the story and in the Custom filter.</span></label>}
              <label>Short introduction<textarea required rows="3" maxLength="320" value={form.excerpt} onChange={(event) => setForm({ ...form, excerpt: event.target.value })} placeholder="What will readers take away?" /></label>
              <div className="cover-field">
                <label>Cover image URL<input type="url" value={form.cover_url} onChange={(event) => setForm({ ...form, cover_url: event.target.value })} onBlur={() => { if (!form.cover_url.trim()) setForm({ ...form, cover_url: DEFAULT_COVER_URLS[form.category] }); }} placeholder="https://..." /><span className="field-hint">A high-resolution photo is selected for this topic. Replace it with your own, or restore the topic default.</span></label>
                <button className="quiet-button cover-default-button" type="button" onClick={() => setForm({ ...form, cover_url: DEFAULT_COVER_URLS[form.category] })}>Use default topic photo</button>
                {form.cover_url && <img className="cover-preview" src={form.cover_url} alt="Cover preview" onError={(event) => { event.currentTarget.style.display = "none"; }} onLoad={(event) => { event.currentTarget.style.display = "block"; }} />}
              </div>
              <label>Story<textarea className="content-input" required rows="14" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Write your story here. Separate paragraphs with a blank line." /></label>
              <div className="publish-row"><label className="status-select">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option value="draft">Draft</option><option value="published">Published</option></select></label><button className="primary-button" disabled={busy}>{busy ? "Saving..." : form.status === "published" ? "Publish story" : "Save draft"} <span>↗</span></button></div>
            </form>
            <aside className="posts-panel">
              <div className="editor-heading"><h2>All stories</h2><span className="post-total">{posts.length}</span></div>
              {posts.length ? posts.map((post) => (
                <div className="post-row" key={post.id}>
                  <button className="post-summary" onClick={() => startEdit(post)}><span className={`status-dot ${post.status}`} /><span><strong>{post.title}</strong><small>{post.category} · {post.status} · {formatDate(post.published_at || post.created_at)}</small></span></button>
                  <button className="delete-button" onClick={() => deletePost(post)} aria-label={`Delete ${post.title}`}>×</button>
                </div>
              )) : <p className="empty-state">Your stories will appear here. Start with a new one.</p>}
            </aside>
          </div>
        </main>
      )}
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route exact path="/admin" component={Admin} />
        <Route exact path="/article/:slug" component={Article} />
        <Route path="/" component={Home} />
      </Switch>
    </BrowserRouter>
  );
}
