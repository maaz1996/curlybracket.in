# Curlybracket

An editorial blog about technology, travel, and entrepreneurship. The frontend is a React single-page app; the API is Express and MySQL. Readers can browse, filter, search, and read published stories. The `/admin` page supports writing, editing, publishing, saving drafts, and deleting stories.

## Run locally

Requirements: Node.js 22.12+, npm, and a MySQL 8-compatible database.

1. Create a database named `curlybracket` (or choose another name).
2. Copy `backend/.env.example` to `backend/.env` and set your database details.
3. Generate an admin password hash and a JWT secret:

   ```sh
   cd backend
   node -e "require('bcryptjs').hash(process.argv[1], 12).then(console.log)" 'your-long-password'
   ```

   Put the resulting hash in `ADMIN_PASSWORD_HASH`. Set `ADMIN_EMAIL` to your email and generate a random `JWT_SECRET` of at least 32 characters. Keep `.env` private.
4. Install and start the API:

   ```sh
   npm install
   npm start
   ```

5. In another terminal, set up and start the frontend:

   ```sh
   cd frontend
   npm install
   npm start
   ```

The site runs at `http://localhost:5173`, the API at `http://localhost:4000`, and the admin page at `http://localhost:5173/admin`. The API creates the posts table on startup. If the API is not connected, the homepage displays clearly labeled sample stories; replace them by publishing from the admin page once the database is configured.

## Deploy on free tiers

The simplest split setup is **Netlify (React frontend) + Render (Node API) + TiDB Serverless (MySQL-compatible database)**. Free-tier limits and availability can change, and free application services may sleep when idle.

### 1. Create the database

Create a TiDB Serverless cluster and copy its connection settings. Enable TLS for the connection. Create the database if the provider does not create one for you. This API initializes the `posts` table automatically.

### 2. Deploy the API on Render

Create a new **Web Service** from this repository:

- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health check path: `/api/health`

Add these environment variables in Render:

- `NODE_ENV` = `production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` = the TiDB connection values
- `DB_SSL` = `true`
- `ADMIN_EMAIL` = your admin email
- `ADMIN_PASSWORD_HASH` = the bcrypt hash from the local setup instructions
- `JWT_SECRET` = a new random secret of at least 32 characters
- `FRONTEND_ORIGIN` = your Netlify site URL (for example `https://your-site.netlify.app`)

After deploy, note the API URL, for example `https://your-api.onrender.com`.

### 3. Deploy the frontend on Netlify

Import the same Git repository as a new Netlify site:

- Base directory: `frontend`
- Build command: `npm run build`
- Publish directory: `dist`
- Environment variable: `VITE_API_URL` = `https://your-api.onrender.com/api`

The included `frontend/netlify.toml` enables React Router routes such as `/admin` on Netlify. Once the Netlify URL is known, set it as `FRONTEND_ORIGIN` on Render and redeploy the API.

Visit `https://your-site.netlify.app/admin` to sign in and publish your first story. Never commit `.env` files or put the admin password or JWT secret in frontend environment variables.

## API

- `GET /api/health`
- `GET /api/posts` and `GET /api/posts/:slug` (published stories only)
- `POST /api/admin/login`
- `GET /api/admin/posts`
- `POST /api/admin/posts`
- `PUT /api/admin/posts/:id`
- `DELETE /api/admin/posts/:id`

Admin requests use a bearer token. Tokens expire after eight hours. Story content is plain text; separate paragraphs with a blank line.
