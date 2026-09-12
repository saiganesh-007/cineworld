import { useEffect, useState } from "react";

import Hero from "../components/Hero";
import MovieCard from "../components/MovieCard";

import {
  getTrendingMovies,
  getPopularMovies,
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
    <section className="px-6 mt-10">

      {/* TITLE */}

      <div className="flex items-center justify-between mb-5">

        <h2 className="text-white text-2xl font-bold">
          {title}
        </h2>

        <span className="text-gray-600 text-sm">
          {movies.length} titles
        </span>

      </div>


      {/* MOVIES */}

      <div className="
        flex
        gap-5
        overflow-x-auto
        pb-5
        scrollbar-hide
      ">

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
// HOME
// ==========================================

function Home() {

  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);

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
          popularData,
          topRatedData,
        ] = await Promise.all([
          getTrendingMovies(),
          getPopularMovies(),
          getTopRatedMovies(),
        ]);

        setTrending(trendingData || []);
        setPopular(popularData || []);
        setTopRated(topRatedData || []);

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

      <div className="
        max-w-[1500px]
        mx-auto
      ">

        <MovieRow
          title="Trending Now"
          movies={trending}
        />

        <MovieRow
          title="Popular Movies"
          movies={popular}
        />

        <MovieRow
          title="Top Rated"
          movies={topRated}
        />

      </div>


      <div className="h-16" />

    </main>
  );
}

export default Home;