import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";

import {
  getTrendingAnime,
  getPopularAnime,
  getUpcomingAnime,
  getTopRatedAnime,
  getImageUrl,
} from "../services/tmdb";

// ==========================================
// ANIME ROW
// ==========================================

function AnimeRow({ title, shows }) {
  if (!shows || shows.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="text-white text-2xl font-bold mb-5">
        {title}
      </h2>

      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {shows.map((show) => (
          <div
            key={show.id}
            className="flex-shrink-0"
          >
            <MovieCard
              id={show.id}
              type="tv"
              title={show.name}
              year={
                show.first_air_date
                  ? show.first_air_date.slice(0, 4)
                  : "N/A"
              }
              rating={
                show.vote_average
                  ? show.vote_average.toFixed(1)
                  : "N/A"
              }
              image={getImageUrl(show.poster_path)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// ANIME PAGE
// ==========================================

function Anime() {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ==========================================
  // FETCH ANIME
  // ==========================================

  useEffect(() => {
    async function fetchAnime() {
      try {
        setLoading(true);
        setError(false);

        const [
          trendingData,
          popularData,
          upcomingData,
          topRatedData,
        ] = await Promise.all([
          getTrendingAnime(),
          getPopularAnime(),
          getUpcomingAnime(),
          getTopRatedAnime(),
        ]);

        setTrending(trendingData || []);
        setPopular(popularData || []);
        setUpcoming(upcomingData || []);
        setTopRated(topRatedData || []);

      } catch (error) {
        console.error(
          "Anime page error:",
          error
        );

        setError(true);

      } finally {
        setLoading(false);
      }
    }

    fetchAnime();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

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
            Loading anime...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        px-6
      ">
        <div className="text-center">

          <h2 className="
            text-2xl
            font-bold
            mb-3
          ">
            Something went wrong
          </h2>

          <p className="text-gray-500">
            We couldn't load anime right now.
            Please refresh the page and try again.
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="
      min-h-screen
      bg-black
      px-6
      py-10
      text-white
    ">

      <div className="
        max-w-7xl
        mx-auto
      ">

        {/* HEADER */}

        <h1 className="
          text-white
          text-4xl
          font-bold
        ">
          Anime
        </h1>

        <p className="
          text-gray-500
          mt-2
        ">
          Discover trending, popular, upcoming
          and highly rated Japanese anime.
        </p>

        {/* TRENDING */}

        <AnimeRow
          title="🔥 Trending Anime"
          shows={trending}
        />

        {/* POPULAR */}

        <AnimeRow
          title="⭐ Popular Anime"
          shows={popular}
        />

        {/* UPCOMING */}

        <AnimeRow
          title="🎬 Upcoming Anime"
          shows={upcoming}
        />

        {/* TOP RATED */}

        <AnimeRow
          title="🏆 Top Rated Anime"
          shows={topRated}
        />

        <div className="h-10" />

      </div>
    </main>
  );
}

export default Anime;