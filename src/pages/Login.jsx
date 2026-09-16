import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { isSupabaseConfigured } from "../lib/supabaseClient";
import { signInWithEmail } from "../lib/auth";

import {
  getPopularMovies,
  getPopularTVShows,
  getPopularAnime,
  getTVShowsByLanguage,
} from "../services/tmdb";

// ==========================================
// POSTER COLLAGE BACKGROUND
// CINEWorld = Movies · Anime · Dramas · Web Series
// ==========================================

function getPosterUrl(path) {
  return path
    ? `https://image.tmdb.org/t/p/w342${path}`
    : null;
}

function pickPosters(list, count) {
  return (list || [])
    .filter((item) => item.poster_path)
    .slice(0, count);
}

function LoginBackdrop() {
  const [posters, setPosters] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadPosters() {
      const results = await Promise.allSettled([
        getPopularMovies(),
        getPopularTVShows(),
        getPopularAnime(),
        getTVShowsByLanguage("ko"),
      ]);

      if (!active) {
        return;
      }

      const groups = [
        results[0].status === "fulfilled" ? results[0].value : null,
        results[1].status === "fulfilled" ? results[1].value : null,
        results[2].status === "fulfilled" ? results[2].value : null,
        results[3].status === "fulfilled" ? results[3].value : null,
      ];

      const flat = groups
        .flatMap((items) => pickPosters(items, 4))
        .map((item) => getPosterUrl(item.poster_path))
        .filter(Boolean);

      setPosters(flat);
    }

    loadPosters();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      role="presentation"
      className="absolute inset-0 overflow-hidden"
    >
      {/* COLLAGE */}
      <div
        className="
          animate-drift
          motion-reduce:animate-none
          grid
          grid-cols-3
          sm:grid-cols-4
          md:grid-cols-6
          gap-2
          sm:gap-3
          absolute
          inset-0
          scale-[1.02]
          p-4
          sm:p-5
        "
      >
        {posters.length > 0
          ? posters.map((src, index) => {
              const rotate =
                index % 2 === 0 ? -0.7 : 0.8;
              const offset =
                [1, 2].includes(index % 4) ? 7 : -7;

              return (
                <div
                  key={`${src}-${index}`}
                  className="
                    relative
                    aspect-[2/3]
                    rounded-xl
                    border
                    border-white/10
                    overflow-hidden
                    shadow-xl
                    shadow-black/50
                  "
                  style={{
                    transform: `rotate(${rotate}deg) translateY(${offset}px)`,
                  }}
                >
                  <img
                    src={src}
                    alt=""
                    draggable={false}
                    loading="eager"
                    className="
                      w-full
                      h-full
                      object-cover
                      opacity-65
                      saturate-[0.85]
                      brightness-[0.7]
                      select-none
                      pointer-events-none
                    "
                  />
                </div>
              );
            })
          : Array.from({ length: 16 }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="
                  relative
                  aspect-[2/3]
                  rounded-xl
                  border
                  border-white/5
                  bg-zinc-900
                "
              />
            ))}
      </div>

      {/* DARK OVERLAY */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.62) 32%, rgba(0,0,0,0.68) 62%, rgba(0,0,0,0.94) 100%)",
        }}
      />

      {/* VIGNETTE */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 32%, rgba(0,0,0,0.6) 100%)",
        }}
      />

      {/* PREMIUM RED HALO */}
      <div
        className="
          absolute
          left-1/2
          top-1/2
          -translate-x-1/2
          -translate-y-1/2
          h-[420px]
          sm:h-[500px]
          aspect-square
          rounded-full
          bg-red-600/15
          blur-[120px]
        "
      />
    </div>
  );
}

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError(
        "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local."
      );
      return;
    }

    try {
      setLoading(true);

      const { data, error: signInError } = await signInWithEmail({
        email,
        password,
      });

      if (signInError) {
        setError(
          signInError.message || "Login failed. Please try again."
        );
        return;
      }

      if (!data?.session) {
        setError("Login failed. Please try again.");
        return;
      }

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen bg-black text-white flex items-center justify-center px-6 py-14 overflow-hidden">
      <LoginBackdrop />

      <div className="relative z-20 w-full max-w-sm">

        {/* ==========================================
            CARD SIDE GLOWS (cinematic bloom)
        ========================================== */}

        <div
          aria-hidden="true"
          className="absolute -left-12 sm:-left-16 top-1/2 -translate-y-1/2 w-20 sm:w-24 h-2/3 rounded-full bg-red-600/25 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -right-12 sm:-right-16 top-1/2 -translate-y-1/2 w-20 sm:w-24 h-2/3 rounded-full bg-red-600/25 blur-3xl pointer-events-none"
        />

        <div className="text-center mb-6">
          <Link
            to="/"
            className="text-2xl font-bold"
          >
            CINE
            <span className="text-red-500">
              World
            </span>
          </Link>

          <h1 className="text-xl font-semibold mt-5">
            Welcome back
          </h1>

          <p className="text-sm text-gray-500 mt-1.5">
            Login to your CINEWorld account
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="
            bg-zinc-950/90
            backdrop-blur
            border
            border-white/10
            rounded-2xl
            p-5
            shadow-2xl
            shadow-black/70
            ring-1
            ring-black/40
          "
        >

          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              className="
                w-full
                bg-black
                border
                border-white/10
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-red-500
              "
            />
          </div>

          <div className="mb-2.5">
            <label className="block text-sm text-gray-400 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              className="
                w-full
                bg-black
                border
                border-white/10
                rounded-lg
                px-4
                py-3
                text-white
                outline-none
                focus:border-red-500
              "
            />
          </div>

          <div className="text-right mb-4">
            <Link
              to="/forgot-password"
              className="
                text-sm
                text-red-500
                hover:text-red-400
              "
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <div className="text-red-400 text-sm mb-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              bg-red-600
              hover:bg-red-700
              disabled:opacity-50
              text-white
              font-semibold
              py-3
              rounded-lg
              transition
            "
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-gray-500 text-sm mt-5">
            Don't have an account?{" "}

            <Link
              to="/register"
              className="text-red-500 hover:text-red-400"
            >
              Create one
            </Link>
          </p>

        </form>

        {/* CATALOG STRIP */}

        <p className="text-center mt-8 text-[11px] uppercase tracking-[0.3em] text-gray-400">
          Movies <span className="text-red-500/80">·</span>{" "}
          Anime <span className="text-red-500/80">·</span>{" "}
          Dramas <span className="text-red-500/80">·</span>{" "}
          Web Series
        </p>
      </div>
    </main>
  );
}

export default Login;