import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";

import {
  getTrendingMovies,
  getMoviesByLanguage,
  getTopRatedMovies,
  getUpcomingMovies,
  getUpcomingMoviesByLanguage,
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
          <div
            key={movie.id}
            className="flex-shrink-0"
          >
            <MovieCard
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
          </div>
        ))}

      </div>

    </section>
  );
}


// ==========================================
// MOVIES
// ==========================================

function Movies() {

  const [trending, setTrending] = useState([]);

  const [english, setEnglish] = useState([]);
  const [tamil, setTamil] = useState([]);
  const [hindi, setHindi] = useState([]);
  const [telugu, setTelugu] = useState([]);
  const [korean, setKorean] = useState([]);

  const [upcoming, setUpcoming] = useState([]);
  const [upcomingEnglish, setUpcomingEnglish] = useState([]);
  const [upcomingTamil, setUpcomingTamil] = useState([]);
  const [upcomingHindi, setUpcomingHindi] = useState([]);
  const [upcomingTelugu, setUpcomingTelugu] = useState([]);
  const [upcomingKorean, setUpcomingKorean] = useState([]);

  const [topRated, setTopRated] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);


  // ==========================================
  // FETCH
  // ==========================================

  useEffect(() => {

    async function fetchMovies() {

      try {

        setLoading(true);
        setError(false);

        const [
          trendingData,

          englishData,
          tamilData,
          hindiData,
          teluguData,
          koreanData,

          upcomingData,

          upcomingEnglishData,
          upcomingTamilData,
          upcomingHindiData,
          upcomingTeluguData,
          upcomingKoreanData,

          topRatedData,
        ] = await Promise.all([

          getTrendingMovies(),

          getMoviesByLanguage("en"),
          getMoviesByLanguage("ta"),
          getMoviesByLanguage("hi"),
          getMoviesByLanguage("te"),
          getMoviesByLanguage("ko"),

          getUpcomingMovies(),

          getUpcomingMoviesByLanguage("en"),
          getUpcomingMoviesByLanguage("ta"),
          getUpcomingMoviesByLanguage("hi"),
          getUpcomingMoviesByLanguage("te"),
          getUpcomingMoviesByLanguage("ko"),

          getTopRatedMovies(),

        ]);


        setTrending(trendingData || []);

        setEnglish(englishData || []);
        setTamil(tamilData || []);
        setHindi(hindiData || []);
        setTelugu(teluguData || []);
        setKorean(koreanData || []);

        setUpcoming(upcomingData || []);

        setUpcomingEnglish(upcomingEnglishData || []);
        setUpcomingTamil(upcomingTamilData || []);
        setUpcomingHindi(upcomingHindiData || []);
        setUpcomingTelugu(upcomingTeluguData || []);
        setUpcomingKorean(upcomingKoreanData || []);

        setTopRated(topRatedData || []);

      } catch (error) {

        console.error(
          "Movies page error:",
          error
        );

        setError(true);

      } finally {

        setLoading(false);

      }

    }

    fetchMovies();

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
            Loading movies...
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

          <h2 className="text-2xl font-bold mb-3">
            Something went wrong
          </h2>

          <p className="text-gray-500">
            We couldn't load the movies.
            Please refresh the page.
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
      text-white
      px-6
      py-10
    ">

      <div className="
        max-w-7xl
        mx-auto
      ">

        <h1 className="
          text-white
          text-4xl
          font-bold
          mb-10
        ">
          Explore Movies
        </h1>


        {/* TRENDING */}

        <MovieRow
          title="🔥 Trending Movies"
          movies={trending}
        />


        {/* ALL UPCOMING */}

        <MovieRow
          title="🎬 Upcoming Movies"
          movies={upcoming}
        />


        {/* UPCOMING ENGLISH */}

        <MovieRow
          title="🎬 Upcoming English Movies"
          movies={upcomingEnglish}
        />


        {/* UPCOMING TAMIL */}

        <MovieRow
          title="🎬 Upcoming Tamil Movies"
          movies={upcomingTamil}
        />


        {/* UPCOMING HINDI */}

        <MovieRow
          title="🎬 Upcoming Hindi Movies"
          movies={upcomingHindi}
        />


        {/* UPCOMING TELUGU */}

        <MovieRow
          title="🎬 Upcoming Telugu Movies"
          movies={upcomingTelugu}
        />


        {/* UPCOMING KOREAN */}

        <MovieRow
          title="🎬 Upcoming Korean Movies"
          movies={upcomingKorean}
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


        <div className="h-10" />

      </div>

    </main>
  );
}

export default Movies;