import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  getTrendingMovies,
  getPopularTVShows,
  getPopularAnime,
  getTVShowsByLanguage,
} from "../services/tmdb";

const FEATURE_DURATION = 9000;
const CROSSFADE_MS = 1200;

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function getBackdropUrl(path) {
  return path
    ? `https://image.tmdb.org/t/p/w1280${path}`
    : null;
}

function getFallbackPosterUrl(path) {
  return path
    ? `https://image.tmdb.org/t/p/w780${path}`
    : null;
}

// Fisher–Yates shuffle. When a full cycle completes we
// reshuffle and guarantee the new first item is not the
// same as the last item shown in the previous cycle.
function buildOrder(list, previousLast) {
  const order = [...list];

  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  if (
    previousLast &&
    order.length > 1 &&
    order[0]?.key === previousLast.key
  ) {
    const swapAt =
      1 + Math.floor(Math.random() * (order.length - 1));
    [order[0], order[swapAt]] = [order[swapAt], order[0]];
  }

  return order;
}

function FeatureInfo({ item }) {
  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 lg:left-auto lg:right-6 lg:-translate-x-0 lg:text-right text-center w-[calc(100%-40px)] max-w-[260px] z-10">
      <p className="text-red-400 uppercase tracking-[0.18em] text-[10px] font-semibold">
        {item.label}
      </p>

      <p className="text-white text-lg font-semibold leading-snug mt-1 truncate">
        {item.title}
      </p>

      <p className="text-gray-400 text-xs mt-1">
        {item.year}
        {item.rating && item.rating !== "N/A"
          ? `  ·  ⭐ ${item.rating}`
          : ""}
      </p>
    </div>
  );
}

function Hero() {
  const heroRef = useRef(null);
  const bgRef = useRef(null);
  const glowRef = useRef(null);
  const contentRef = useRef(null);
  const visualRef = useRef(null);

  const activeIndexRef = useRef(0);
  const loadedKeysRef = useRef(new Set());
  const mountSeqRef = useRef(0);

  const reducedMotion = prefersReducedMotion();

  // `order` is the rotation sequence (shuffled once).
  // `layers` keeps the currently shown item plus the
  // previous one while it fades out (true crossfade).
  const [order, setOrder] = useState([]);
  const [layers, setLayers] = useState([]);

  // ==========================================
  // BUILD THE FEATURE POOL
  // ~3 unique items per CINEWorld family
  // (Movies, Anime, Korean Dramas, Web Series),
  // deduplicated by `${media_type}:${id}`.
  // ==========================================

  useEffect(() => {
    let active = true;

    async function loadPool() {
      const results = await Promise.allSettled([
        getTrendingMovies(),
        getPopularTVShows(),
        getPopularAnime(),
        getTVShowsByLanguage("ko"),
      ]);

      if (!active) {
        return;
      }

      const categories = [
        {
          label: "Movie",
          media: "movie",
          result: results[0],
          limit: 3,
        },
        {
          label: "Web Series",
          media: "tv",
          result: results[1],
          limit: 3,
        },
        {
          label: "Anime",
          media: "tv",
          result: results[2],
          limit: 3,
        },
        {
          label: "Drama",
          media: "tv",
          result: results[3],
          limit: 3,
        },
      ];

      const unique = new Map();

      for (const category of categories) {
        const list =
          category.result?.status === "fulfilled"
            ? category.result.value
            : [];

        let taken = 0;

        for (const item of list) {
          if (taken >= category.limit) {
            break;
          }

          const image =
            getBackdropUrl(item.backdrop_path) ||
            getFallbackPosterUrl(item.poster_path);

          if (!image) {
            continue;
          }

          const key = `${category.media}:${item.id}`;

          if (unique.has(key)) {
            continue;
          }

          unique.set(key, {
            key,
            label: category.label,
            title:
              item.title ||
              item.name ||
              "Untitled",
            year:
              (item.release_date ||
                item.first_air_date ||
                "").slice(0, 4) || "N/A",
            rating: item.vote_average
              ? item.vote_average.toFixed(1)
              : "N/A",
            image,
          });

          taken++;
        }
      }

      const pool = [...unique.values()];
      const firstOrder = buildOrder(pool, null);

      activeIndexRef.current = 0;
      loadedKeysRef.current = new Set();

      setOrder(firstOrder);
      setLayers([
        {
          key: `${firstOrder[0].key}-${mountSeqRef.current++}`,
          item: firstOrder[0],
          current: true,
        },
      ]);
    }

    loadPool();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================
  // PRELOAD THE NEXT BACKDROP
  // Loads the upcoming image before it is shown
  // so the crossfade never stutters or flashes.
  // ==========================================

  useEffect(() => {
    if (order.length < 2 || reducedMotion) {
      return;
    }

    const nextIndex =
      (activeIndexRef.current + 1) % order.length;
    const nextItem = order[nextIndex];

    if (
      !nextItem?.image ||
      loadedKeysRef.current.has(nextItem.key)
    ) {
      return;
    }

    const img = new Image();
    img.onload = () =>
      loadedKeysRef.current.add(nextItem.key);
    img.src = nextItem.image;
  }, [order, layers, reducedMotion]);

  // ==========================================
  // SEQUENTIAL ROTATION (9s per title)
  // Moves through a shuffled list index by index.
  // At the end of a cycle it reshuffles (guaranteeing
  // the next first item differs from the previous last).
  // Pauses while the hero is off-screen.
  // ==========================================

  useEffect(() => {
    if (order.length < 2 || reducedMotion) {
      return;
    }

    let visible = true;

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.15 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    const timer = setInterval(() => {
      if (!visible || order.length < 2) {
        return;
      }

      const nextIndex =
        (activeIndexRef.current + 1) % order.length;
      const nextItem = order[nextIndex];

      // Never begin a crossfade until the image is ready.
      if (!loadedKeysRef.current.has(nextItem.key)) {
        return;
      }

      activeIndexRef.current = nextIndex;

      setLayers((prev) => [
        ...prev.map((layer) => ({
          ...layer,
          current: false,
        })),
        {
          key: `${nextItem.key}-${mountSeqRef.current++}`,
          item: nextItem,
          current: true,
        },
      ]);

      // Let the previous layer finish fading out, then drop it.
      window.setTimeout(() => {
        setLayers((prev) =>
          prev.filter((layer) => layer.current)
        );
      }, CROSSFADE_MS + 150);

      // Full cycle completed: reshuffle, keeping the first
      // item of the new cycle different from the last shown.
      if (nextIndex === 0) {
        setOrder((prevOrder) =>
          buildOrder(prevOrder, prevOrder[prevOrder.length - 1])
        );
      }
    }, FEATURE_DURATION);

    return () => {
      clearInterval(timer);
      observer.disconnect();
    };
  }, [order.length, reducedMotion]);

  // ==========================================
  // SCROLL MOTION
  // Hero content drifts upward + fades while the
  // background and featured visual parallax.
  // ==========================================

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    let ticking = false;

    function update() {
      ticking = false;

      const scrollY = window.scrollY;
      const progress = Math.min(scrollY / 520, 1);

      if (contentRef.current) {
        contentRef.current.style.transform =
          `translateY(${-progress * 56}px)`;
        contentRef.current.style.opacity =
          String(1 - progress * 0.92);
      }

      if (bgRef.current) {
        bgRef.current.style.transform =
          `translateY(${progress * 48}px) ` +
          `scale(${1 + progress * 0.02})`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform =
          `translate3d(${-scrollY * 0.06}px, ${progress * 40}px, 0)`;
      }

      if (visualRef.current) {
        visualRef.current.style.transform =
          `translate3d(0, ${progress * 22}px, 0)`;
        visualRef.current.style.opacity =
          String(1 - progress);
      }
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    update();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [reducedMotion]);

  return (
    <section
      ref={heroRef}
      className="relative hero-section min-h-[460px] lg:min-h-[560px] flex items-center overflow-hidden"
    >
      {/* Background */}
      <div
        ref={bgRef}
        className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-red-950/20"
        style={{ willChange: "transform" }}
      />

      {/* ==========================================
          FEATURED VISUAL
          Full-bleed layer. A CSS mask dissolves the
          image into the black hero (horizontal fade on
          desktop, top/bottom fade on mobile) so there
          is no visible rectangular edge.
      ========================================== */}

      <div
        ref={visualRef}
        className="absolute inset-0 feature-mask bg-black overflow-hidden"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Slides (true cinematic crossfade) */}
        {layers.map((layer) => (
          <div
            key={layer.key}
            className="absolute inset-0 will-change-[opacity,transform]"
            style={{
              opacity: layer.current ? 1 : 0,
              transform: layer.current
                ? "scale(1)"
                : "scale(1.02)",
              transition: reducedMotion
                ? "none"
                : `opacity ${CROSSFADE_MS}ms ease-in-out, transform ${CROSSFADE_MS}ms ease-in-out`,
            }}
          >
            <img
              src={layer.item.image}
              alt={`${layer.item.title} — ${layer.item.label}`}
              loading="eager"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
            />
            <FeatureInfo item={layer.item} />
          </div>
        ))}

        {/* Dark overlay over the whole image */}
        <div className="absolute inset-0 bg-black/55 lg:bg-black/25" />

        {/* Left-to-right dissolve into black (image clear ~60%+) */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/55 to-transparent lg:from-black lg:via-black/45 lg:to-transparent" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-black/70 to-transparent" />

        {/* Subtle top fade */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black via-black/40 to-transparent" />

        {/* Right-edge vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0) 42%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        {/* Soft red ambient glow behind the featured area */}
        <div className="absolute -bottom-12 -left-10 w-80 h-80 rounded-full bg-red-600/15 blur-[130px]" />
      </div>

      {/* Content (left side — unchanged) */}
      <div
        ref={contentRef}
        className="relative z-20 container-cw py-16"
        style={{ willChange: "transform, opacity" }}
      >
        {/* Small heading */}
        <p className="text-red-500 uppercase tracking-[0.2em] text-sm font-semibold mb-4">
          Welcome to CINEWorld
        </p>

        {/* Main heading */}
        <h1 className="text-white text-[clamp(2.25rem,3vw+1rem,3.5rem)] font-bold leading-tight max-w-3xl">
          Everything you
          <br />
          <span className="text-red-500">
            want to watch.
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-base max-w-2xl mt-5 leading-7">
          Explore movies, web series and anime.
          Discover what's trending, save your favourites,
          and build your personal watchlist.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-7">
          {/* Explore Movies */}
          <Link
            to="/movies"
            className="
              bg-red-600
              text-white
              px-5
              py-2.5
              rounded-lg
              font-semibold
              text-sm
              hover:bg-red-700
              transition
            "
          >
            Explore Movies
          </Link>

          {/* Web Series */}
          <Link
            to="/webseries"
            className="
              border
              border-white/20
              text-white
              px-5
              py-2.5
              rounded-lg
              font-semibold
              text-sm
              hover:bg-white/10
              transition
            "
          >
            Web Series
          </Link>

          {/* Anime */}
          <Link
            to="/anime"
            className="
              border
              border-white/20
              text-white
              px-5
              py-2.5
              rounded-lg
              font-semibold
              text-sm
              hover:bg-white/10
              transition
            "
          >
            Anime
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;