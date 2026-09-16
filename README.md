# 🎬 CINEWorld

**CINEWorld** is a full-stack entertainment platform for discovering movies, web series, anime, and dramas in one place.

Browse trending titles, search across different categories, explore detailed movie and TV pages, save favorites, build a watchlist, and manage your account through a clean streaming-style interface.

**Live Demo:** https://cineworld-eta.vercel.app/

---

## 🌟 Project Overview

CINEWorld was built to bring different kinds of entertainment into one place.

Instead of switching between separate platforms for movies, anime, dramas, and web series, users can browse and search everything through a single interface.

Movie and TV data comes from TMDB, authentication is handled by Supabase, the backend runs on Flask, and user favorites and watchlists are stored in Neon PostgreSQL.

---

## ✨ Key Features

- **Movies:** Browse trending, popular, top-rated, and upcoming movies.
- **Web Series:** Discover popular TV shows and streaming series.
- **Anime:** Dedicated section for anime content.
- **Korean Dramas:** Browse Korean drama titles.
- **Trending Now:** See currently trending movies and shows.
- **Search:** Search movies, anime, dramas, and web series directly from the navbar.
- **Live Search Suggestions:** Suggestions with poster, title, year, rating, and media type.
- **Movie & TV Details:** Dedicated pages for individual titles.
- **Favorites:** Save movies and shows you like.
- **Watchlist:** Save titles you want to watch later.
- **User Accounts:** Register, login, logout, and email verification.
- **Forgot Password:** Request a password reset through email.
- **Reset Password:** Secure password recovery using Supabase.
- **Persistent Data:** Favorites and watchlists stay saved across sessions.
- **Responsive Design:** Works across desktop, tablet, and mobile.
- **Smooth Scrolling:** Lenis-powered smooth scrolling.
- **Cinematic Hero:** Featured content with changing artwork and blended backgrounds.
- **Content Rows:** Horizontal movie and show sections with navigation arrows and edge fades.
- **Global Footer:** Shared responsive footer across the main application.

---

## 🛠️ Tech Stack

- **React 19:** Frontend UI
- **Vite:** Development server and production build
- **React Router:** Client-side routing
- **Tailwind CSS:** Styling
- **Lenis:** Smooth scrolling
- **TMDB API:** Movie and TV data
- **Python:** Backend language
- **Flask:** REST API
- **SQLAlchemy:** Database ORM
- **Flask-CORS:** CORS handling
- **Supabase Auth:** Authentication and sessions
- **Neon PostgreSQL:** Production database
- **SQLite:** Local development database
- **Vercel:** Frontend and backend deployment

---

## 📂 Project Structure

```text
cineworld/
├── api/
│   └── index.py
│
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── migrate.py
│   ├── models.py
│   └── requirements.txt
│
├── src/
│   ├── components/
│   ├── context/
│   ├── lib/
│   ├── pages/
│   ├── services/
│   ├── App.jsx
│   └── index.css
│
├── public/
├── android/
├── ios/
├── .env.example
├── package.json
├── requirements.txt
├── vercel.json
├── vite.config.js
└── README.md
```

---

## 🚀 Getting Started

Clone the repository:

```bash
git clone https://github.com/saiganesh-007/cineworld.git
cd cineworld
```

Install frontend dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_publishable_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

---

## ⚙️ Backend Setup

Create a virtual environment:

```powershell
python -m venv backend/venv
```

Activate it:

```powershell
.\backend\venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r backend/requirements.txt
```

Create `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

---

## ▶️ Run Locally

CINEWorld uses two terminals during development.

### Frontend

```powershell
npm run dev
```

Usually runs at:

```text
http://localhost:5173
```

### Backend

Open another terminal:

```powershell
.\backend\venv\Scripts\Activate.ps1
$env:PYTHONPATH = (Get-Location).Path
python -m backend.app
```

Backend runs at:

```text
http://127.0.0.1:5001
```

Vite automatically proxies `/api` requests to Flask during local development.

---

## 🔐 Authentication

Authentication is handled using Supabase.

CINEWorld currently supports:

- Registration
- Email verification
- Login
- Logout
- Forgot password
- Reset password
- Persistent user sessions

Favorites and watchlists are linked to the authenticated user.

---

## ❤️ Favorites & Watchlist

Users can save movies and shows to personal collections.

```text
GET    /api/me/favorites
POST   /api/me/favorites
DELETE /api/me/favorites/:tmdb_id

GET    /api/me/watchlist
POST   /api/me/watchlist
DELETE /api/me/watchlist/:tmdb_id
```

Saved items are stored in PostgreSQL and remain available across sessions.

---

## 🗄️ Database

Local development uses SQLite:

```text
backend/instance/cineworld.db
```

Production uses Neon PostgreSQL.

Main tables:

```text
user
favorite
watchlist
```

---

## ☁️ Deployment

CINEWorld is deployed on Vercel.

**Live:** https://cineworld-eta.vercel.app/

The Vite frontend and Flask backend are deployed together, with the backend exposed through:

```text
api/index.py
```

Production database is hosted on Neon PostgreSQL and authentication is handled by Supabase.

---

## 🗺️ Roadmap

- Movie trailers
- Continue Watching
- Recently Viewed
- User ratings
- Reviews
- Genre filters
- Better recommendations
- User profile page
- Personalized homepage
- PWA support
- Performance improvements

---

## 🙏 Acknowledgements

- [TMDB](https://www.themoviedb.org/) — Movie and TV data
- [Supabase](https://supabase.com/) — Authentication
- [Neon](https://neon.tech/) — PostgreSQL database
- [Vercel](https://vercel.com/) — Hosting and deployment
- [React](https://react.dev/) — Frontend
- [Vite](https://vite.dev/) — Build tooling
- [Flask](https://flask.palletsprojects.com/) — Backend

---

## 📄 Disclaimer

CINEWorld uses movie and television data provided by TMDB.

This product uses the TMDB API but is not endorsed or certified by TMDB.

---

## 👥 Owners

**Sai Ganesh**
- **GitHub:** [@saiganesh-007](https://github.com/saiganesh-007)
- **LinkedIn:** [Sai Ganesh](https://www.linkedin.com/in/saiganesh00007/)

**Shahid**
- **GitHub:** [@shahidyellow22-codehub](https://github.com/shahidyellow22-codehub)

---

Built by **Sai Ganesh & Shahid**

*Movies. Anime. Dramas. Web Series. One place.*
