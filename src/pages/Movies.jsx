import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";

import {
  getTrendingMovies,
  getMoviesByLanguage,
  getTopRatedMovies,
  getImageUrl,
} from "../services/tmdb";

// ==========================================
// MOVIE ROW
// ==========================================

function MovieRow({ title, movies }) {
  if (!movies || movies.length === 0) {
    return null;
  }

  return (
    <section className="mb-10">

      <h2 className="text-white text-2xl font-bold mb-4">
        {title}
      </h2>

      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            type="movie"
            title={movie.title}
            year={
              movie.release_date
                ? movie.release_date.slice(0, 4)
                : "N/A"
            }
            rating={
              movie.vote_average
                ? movie.vote_average.toFixed(1)
                : "N/A"
            }
            image={getImageUrl(movie.poster_path)}
          />
        ))}
      </div>

    </section>
  );
}


// ==========================================
// MOVIES PAGE
// ==========================================

function Movies() {
  const [trending, setTrending] = useState([]);
  const [english, setEnglish] = useState([]);
  const [tamil, setTamil] = useState([]);
  const [hindi, setHindi] = useState([]);
  const [telugu, setTelugu] = useState([]);
  const [korean, setKorean] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loading, setLoading] = useState(true);

  // ========================================
  // FETCH MOVIES
  // ========================================

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);

        const [
          trendingData,
          englishData,
          tamilData,
          hindiData,
          teluguData,
          koreanData,
          topRatedData,
        ] = await Promise.all([
          getTrendingMovies(),
          getMoviesByLanguage("en"),
          getMoviesByLanguage("ta"),
          getMoviesByLanguage("hi"),
          getMoviesByLanguage("te"),
          getMoviesByLanguage("ko"),
          getTopRatedMovies(),
        ]);

        setTrending(trendingData || []);
        setEnglish(englishData || []);
        setTamil(tamilData || []);
        setHindi(hindiData || []);
        setTelugu(teluguData || []);
        setKorean(koreanData || []);
        setTopRated(topRatedData || []);

      } catch (error) {
        console.error("Movies error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  // ========================================
  // LOADING
  // ========================================

  if (loading) {
    return (
      <main className="min-h-screen w-full bg-black text-white flex items-center justify-center">
        <p className="text-gray-400 text-base">
          Loading movies...
        </p>
      </main>
    );
  }

  // ========================================
  // PAGE
  // ========================================

  return (
    <main className="min-h-screen w-full bg-black text-white">

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* PAGE TITLE */}

        <h1 className="text-white text-3xl font-bold mb-10">
          Explore Movies
        </h1>

        {/* TRENDING */}

        <MovieRow
          title="🔥 Trending Movies"
          movies={trending}
        />

        {/* ENGLISH */}

        <MovieRow
          title="🇺🇸 English Movies"
          movies={english}
        />

        {/* TAMIL */}

        <MovieRow
          title="🇮🇳 Tamil Movies"
          movies={tamil}
        />

        {/* HINDI */}

        <MovieRow
          title="🇮🇳 Hindi Movies"
          movies={hindi}
        />

        {/* TELUGU */}

        <MovieRow
          title="🇮🇳 Telugu Movies"
          movies={telugu}
        />

        {/* KOREAN */}

        <MovieRow
          title="🇰🇷 Korean Movies"
          movies={korean}
        />

        {/* TOP RATED */}

        <MovieRow
          title="⭐ Top Rated Movies"
          movies={topRated}
        />

      </div>

    </main>
  );
}

export default Movies;