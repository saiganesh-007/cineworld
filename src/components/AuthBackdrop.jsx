import { useEffect, useState } from "react";

import {
  getPopularMovies,
  getPopularTVShows,
  getPopularAnime,
  getTVShowsByLanguage,
} from "../services/tmdb";

// ==========================================
// POSTER COLLAGE BACKDROP
// CINEWorld = Movies · Anime · Dramas · Web Series
// Shared by the auth pages.
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

function AuthBackdrop() {
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

export default AuthBackdrop;