import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import Hero from "../components/Hero";
import MovieCard from "../components/MovieCard";

import {
  getTrendingMovies,
  getPopularMovies,
  getTopRatedMovies,
  getPopularTVShows,
  getPopularAnime,
  getTVShowsByLanguage,
  getUpcomingMovies,
  getTopRatedTVShows,
  getImageUrl,
} from "../services/tmdb";

function usePrefersReducedMotion() {
  return useRef(
    typeof window !== "undefined" &&
      window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
  ).current;
}

// ==========================================
// CARD NORMALIZATION + DEDUPE
// Normalizes raw TMDB results into the shape
// MovieRow/MovieCard expect. `seen` carries the
// `${media_type}:${id}` identities across rows so
// the same title never repeats on the homepage.
// ==========================================

function toCardItem(item, type) {
  const date =
    item.release_date ||
    item.first_air_date ||
    "";

  return {
    id: item.id,
    type,
    title:
      item.title ||
      item.name ||
      "Untitled",
    year: date.slice(0, 4) || "N/A",
    rating: item.vote_average
      ? item.vote_average.toFixed(1)
      : "N/A",
    image: getImageUrl(item.poster_path),
  };
}

function dedupeItems(items, type, seen) {
  const result = [];

  for (const item of items) {
    if (!item?.id) continue;

    const key = `${type}:${item.id}`;

    if (seen.has(key)) continue;

    seen.add(key);
    result.push(toCardItem(item, type));
  }

  return result;
}

// ==========================================
// ICON
// ==========================================

function ChevronIcon({ direction }) {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {direction === "left" ? (
        <path d="m15 18-6-6 6-6" />
      ) : (
        <path d="m9 18 6-6-6-6" />
      )}
    </svg>
  );
}

// ==========================================
// MOVIE ROW
// ==========================================

function MovieRow({ title, items, seeAllPath }) {
  const sectionRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollTicking = useRef(false);

  const [inView, setInView] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const node = sectionRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -48px 0px",
      }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [reducedMotion]);

  if (!items || items.length === 0) {
    return null;
  }

  // ==============================
  // SCROLL STATE
  // ==============================

  function updateScrollState() {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const maxLeft = el.scrollWidth - el.clientWidth - 4;

    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < maxLeft);
  }

  function handleRowScroll() {
    if (scrollTicking.current) {
      return;
    }

    scrollTicking.current = true;

    requestAnimationFrame(() => {
      updateScrollState();
      scrollTicking.current = false;
    });
  }

  function scrollByCards(direction) {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    const child = el.firstElementChild;

    const cardWidth = child
      ? child.getBoundingClientRect().width
      : 220;

    const gap = 20;
    const step = (cardWidth + gap) * 4;

    el.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  }

  // Refresh can-scroll state as images load / size changes.
  useEffect(() => {
    const el = scrollRef.current;

    if (!el) {
      return;
    }

    updateScrollState();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(el);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <section
      ref={sectionRef}
      className="mt-10"
    >
      <div className="group/row">

        {/* ==============================
            ROW HEADER
        ============================== */}

        <div
          className="flex items-end justify-between gap-4 mb-5"
          style={
            reducedMotion
              ? undefined
              : {
                  opacity: inView ? 1 : 0,
                  transform: inView
                    ? "translateY(0)"
                    : "translateY(22px)",
                  transition:
                    "opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)",
                }
          }
        >

          <div className="min-w-0">
            <h2 className="text-white text-2xl font-bold leading-tight">
              {title}
            </h2>

            <p className="text-gray-500 text-xs mt-1 tracking-wide">
              {items.length} titles
            </p>
          </div>

          {seeAllPath && (
            <Link
              to={seeAllPath}
              className="
                group/link
                flex-shrink-0
                flex
                items-center
                gap-1.5
                text-sm
                font-medium
                text-red-400
                hover:text-red-300
                transition-colors
                duration-200
              "
            >
              See all
              <span
                className="
                  transition-transform
                  duration-200
                  group-hover/link:translate-x-0.5
                "
              >
                →
              </span>
            </Link>
          )}

        </div>

        {/* ==============================
            ROW
        ============================== */}

        <div className="relative">

          {/* LEFT EDGE FADE (shown once scrolled) */}

          <div
            aria-hidden="true"
            className={`
              pointer-events-none
              absolute
              inset-y-0
              left-0
              w-10
              z-10
              bg-gradient-to-r
              from-black
              via-black/80
              to-transparent
              transition-opacity
              duration-300
              ${canScrollLeft ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* RIGHT EDGE FADE (hints more content) */}

          <div
            aria-hidden="true"
            className={`
              pointer-events-none
              absolute
              inset-y-0
              right-0
              w-10
              z-10
              bg-gradient-to-l
              from-black
              via-black/80
              to-transparent
              transition-opacity
              duration-300
              ${canScrollRight ? "opacity-100" : "opacity-0"}
            `}
          />

          {/* SCROLL CONTAINER */}

          <div
            ref={scrollRef}
            onScroll={handleRowScroll}
            role="region"
            aria-label={`${title} — horizontally scrollable`}
            tabIndex={0}
            className="
              flex
              gap-5
              overflow-x-auto
              pb-5
              scrollbar-hide
              overscroll-x-contain
              focus:outline-none
            "
          >
            {items.map((item, index) => {

              const delay = reducedMotion
                ? 0
                : Math.min(index * 45, 360);

              return (
                <div
                  key={`${item.type}:${item.id}`}
                  className="flex-shrink-0"
                  style={
                    reducedMotion
                      ? undefined
                      : {
                          opacity: inView ? 1 : 0,
                          transform: inView
                            ? "translateY(0)"
                            : "translateY(28px)",
                          transition:
                            `opacity 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms, ` +
                            `transform 0.55s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
                        }
                  }
                >
                  <MovieCard
                    id={item.id}
                    type={item.type}
                    title={item.title}
                    year={item.year}
                    rating={item.rating}
                    image={item.image}
                  />
                </div>
              );
            })}
          </div>

          {/* LEFT ARROW (desktop/tablet only) */}

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByCards(-1)}
              aria-label={`Scroll ${title} left`}
              title="Scroll left"
              className="
                hidden
                md:flex
                absolute
                left-1
                top-1/2
                -translate-y-1/2
                z-20
                items-center
                justify-center
                w-9
                h-9
                rounded-full
                bg-black/70
                border
                border-white/10
                text-white
                backdrop-blur-sm
                opacity-0
                group-hover/row:opacity-100
                focus-visible:opacity-100
                transition-opacity
                duration-200
                hover:bg-black/90
                hover:text-red-400
                hover:border-red-500/40
                focus-visible:outline-2
                focus-visible:outline-red-500
              "
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          {/* RIGHT ARROW (desktop/tablet only) */}

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByCards(1)}
              aria-label={`Scroll ${title} right`}
              title="Scroll right"
              className="
                hidden
                md:flex
                absolute
                right-1
                top-1/2
                -translate-y-1/2
                z-20
                items-center
                justify-center
                w-9
                h-9
                rounded-full
                bg-black/70
                border
                border-white/10
                text-white
                backdrop-blur-sm
                opacity-0
                group-hover/row:opacity-100
                focus-visible:opacity-100
                transition-opacity
                duration-200
                hover:bg-black/90
                hover:text-red-400
                hover:border-red-500/40
                focus-visible:outline-2
                focus-visible:outline-red-500
              "
            >
              <ChevronIcon direction="right" />
            </button>
          )}

        </div>

      </div>
    </section>
  );
}


// ==========================================
// HOME
// ==========================================

function Home() {

  const [trending, setTrending] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [animeSpotlight, setAnimeSpotlight] = useState([]);
  const [dramas, setDramas] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [newUpcoming, setNewUpcoming] = useState([]);
  const [hiddenGems, setHiddenGems] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);


  // ========================================
  // FETCH DATA
  // ========================================

  useEffect(() => {

    async function fetchData() {

      try {

        setLoading(true);
        setError(false);

        const [
          trendingData,
          popularMoviesData,
          topRatedMoviesData,
          webSeriesData,
          animeData,
          dramaData,
          upcomingData,
          topRatedTvData,
          topRatedTvDataExtra,
        ] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
          getPopularTVShows(),
          getPopularAnime(),
          getTVShowsByLanguage("ko"),
          getUpcomingMovies(),
          getTopRatedTVShows(1),
          getTopRatedTVShows(2),
        ]);

        // Deduplicate left-to-right: once a title is used,
        // it cannot appear in any later homepage row.
        const seen = new Set();

        // 1. Trending Now (movie)
        setTrending(
          dedupeItems(trendingData || [], "movie", seen)
        );

        // 2. Popular Movies (movie)
        setPopularMovies(
          dedupeItems(popularMoviesData || [], "movie", seen)
        );

        // 3. Popular Web Series (tv)
        setWebSeries(
          dedupeItems(webSeriesData || [], "tv", seen)
        );

        // 4. Anime Spotlight (tv)
        setAnimeSpotlight(
          dedupeItems(animeData || [], "tv", seen)
        );

        // 5. Korean Dramas (tv)
        setDramas(
          dedupeItems(dramaData || [], "tv", seen)
        );

        // 6. Top Rated (movie)
        setTopRated(
          dedupeItems(topRatedMoviesData || [], "movie", seen)
        );

        // 7. New & Upcoming (movie)
        setNewUpcoming(
          dedupeItems(upcomingData || [], "movie", seen)
        );

        // 8. Hidden Gems (tv) — well-rated series not yet
        // used above; a deeper page keeps it fresh and safe.
        setHiddenGems(
          dedupeItems(
            [...(topRatedTvData || []), ...(topRatedTvDataExtra || [])],
            "tv",
            seen
          )
        );

      } catch (error) {

        console.error(
          "Home page error:",
          error
        );

        setError(true);

      } finally {

        setLoading(false);

      }

    }

    fetchData();

  }, []);


  // ========================================
  // LOADING
  // ========================================

  if (loading) {

    return (
      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
      ">

        <div className="text-center">

          <div className="
            w-10
            h-10
            border-2
            border-white/20
            border-t-red-500
            rounded-full
            animate-spin
            mx-auto
            mb-4
          " />

          <p className="text-gray-500">
            Loading CINEWorld...
          </p>

        </div>

      </div>
    );
  }


  // ========================================
  // ERROR
  // ========================================

  if (error) {

    return (
      <div className="
        min-h-screen
        bg-black
        text-white
      ">

        <Hero />

        <div className="
          flex
          flex-col
          items-center
          justify-center
          py-20
          px-6
        ">

          <h2 className="
            text-2xl
            font-bold
            mb-3
          ">
            Something went wrong
          </h2>

          <p className="
            text-gray-500
            text-center
          ">
            We couldn't load the movies right now.
            Please refresh the page and try again.
          </p>

        </div>

      </div>
    );
  }


  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="
      min-h-screen
      bg-black
      text-white
      overflow-hidden
    ">

      {/* HERO */}

      <Hero />


      {/* MOVIE COLLECTIONS */}

      <div className="container-cw">

        <MovieRow
          title="Trending Now"
          items={trending}
          seeAllPath="/movies"
        />

        <MovieRow
          title="Popular Movies"
          items={popularMovies}
          seeAllPath="/movies"
        />

        <MovieRow
          title="Popular Web Series"
          items={webSeries}
          seeAllPath="/webseries"
        />

        <MovieRow
          title="Anime Spotlight"
          items={animeSpotlight}
          seeAllPath="/anime"
        />

        <MovieRow
          title="Korean Dramas"
          items={dramas}
        />

        <MovieRow
          title="Top Rated"
          items={topRated}
          seeAllPath="/movies"
        />

        <MovieRow
          title="New & Upcoming"
          items={newUpcoming}
        />

        <MovieRow
          title="Hidden Gems"
          items={hiddenGems}
        />

      </div>


      <div className="h-16" />

    </main>
  );
}

export default Home;