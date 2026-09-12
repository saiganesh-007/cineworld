import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getImageUrl,
} from "../services/tmdb";

import Reviews from "../components/Reviews";

function Movie() {
  const { id } = useParams();

  const [movie, setMovie] = useState(null);

  const [credits, setCredits] = useState({
    director: null,
    cast: [],
  });

  const [trailer, setTrailer] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true);

        const [movieData, creditData, videoData] =
          await Promise.all([
            getMovieDetails(id),
            getMovieCredits(id),
            getMovieVideos(id),
          ]);

        setMovie(movieData);
        setCredits(creditData);

        // Find official YouTube trailer
        const officialTrailer = videoData.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official === true
        );

        // If official trailer doesn't exist,
        // find any YouTube trailer
        const anyTrailer = videoData.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer"
        );

        setTrailer(
          officialTrailer ||
            anyTrailer ||
            null
        );
      } catch (error) {
        console.error("Movie details error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMovie();
  }, [id]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">
          Loading movie...
        </p>
      </div>
    );
  }

  // ==========================================
  // MOVIE NOT FOUND
  // ==========================================

  if (!movie || movie.success === false) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

        <h1 className="text-3xl font-bold mb-4">
          Movie not found
        </h1>

        <Link
          to="/movies"
          className="text-red-500 hover:text-red-400"
        >
          ← Back to Movies
        </Link>

      </div>
    );
  }

  // ==========================================
  // RUNTIME
  // ==========================================

  function formatRuntime(minutes) {
    if (!minutes) return "N/A";

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) {
      return `${mins}m`;
    }

    return `${hours}h ${mins}m`;
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ==========================================
          BACKDROP
      ========================================== */}

      {movie.backdrop_path && (
        <div className="relative w-full h-[420px] overflow-hidden">

          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />

          <div className="
            absolute
            inset-0
            bg-gradient-to-t
            from-black
            via-black/60
            to-transparent
          " />

        </div>
      )}

      {/* ==========================================
          MAIN
      ========================================== */}

      <div
        className={`max-w-7xl mx-auto px-6 ${
          movie.backdrop_path
            ? "-mt-32 relative z-10"
            : "pt-10"
        }`}
      >

        {/* ==========================================
            POSTER + MOVIE DETAILS
        ========================================== */}

        <div className="flex flex-col md:flex-row gap-8">

          {/* POSTER */}

          <div className="flex-shrink-0">

            {movie.poster_path ? (
              <img
                src={getImageUrl(movie.poster_path)}
                alt={movie.title}
                className="
                  w-64
                  md:w-72
                  rounded-2xl
                  shadow-2xl
                  border
                  border-white/10
                "
              />
            ) : (
              <div className="
                w-64
                md:w-72
                h-96
                bg-zinc-900
                rounded-2xl
                flex
                items-center
                justify-center
                text-gray-500
              ">
                No Image
              </div>
            )}

          </div>


          {/* DETAILS */}

          <div className="flex-1 pt-4">

            {/* TITLE */}

            <h1 className="
              text-4xl
              md:text-6xl
              font-bold
              mb-5
            ">
              {movie.title}
            </h1>


            {/* BASIC INFO */}

            <div className="
              flex
              flex-wrap
              items-center
              gap-4
              text-gray-400
              mb-6
            ">

              <span>
                {movie.release_date?.slice(0, 4) ||
                  "N/A"}
              </span>

              <span>
                ⭐{" "}
                {movie.vote_average
                  ? movie.vote_average.toFixed(1)
                  : "N/A"}
              </span>

              <span>
                {formatRuntime(movie.runtime)}
              </span>

            </div>


            {/* GENRES */}

            {movie.genres?.length > 0 && (
              <div className="
                flex
                flex-wrap
                gap-2
                mb-7
              ">

                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="
                      bg-white/10
                      border
                      border-white/10
                      px-4
                      py-1.5
                      rounded-full
                      text-sm
                      text-gray-300
                    "
                  >
                    {genre.name}
                  </span>
                ))}

              </div>
            )}


            {/* OVERVIEW */}

            <h2 className="text-2xl font-bold mb-3">
              Overview
            </h2>

            <p className="
              text-gray-300
              leading-8
              max-w-4xl
            ">
              {movie.overview ||
                "No description available."}
            </p>


            {/* DIRECTOR */}

            {credits.director && (
              <div className="mt-7">

                <h2 className="text-xl font-bold mb-3">
                  Director
                </h2>

                <div className="
                  inline-flex
                  items-center
                  gap-3
                  bg-zinc-900
                  border
                  border-white/10
                  px-4
                  py-3
                  rounded-xl
                ">

                  {credits.director.profile_path ? (
                    <img
                      src={getImageUrl(
                        credits.director.profile_path
                      )}
                      alt={credits.director.name}
                      className="
                        w-10
                        h-10
                        rounded-full
                        object-cover
                      "
                    />
                  ) : (
                    <div className="
                      w-10
                      h-10
                      rounded-full
                      bg-zinc-800
                      flex
                      items-center
                      justify-center
                      text-xs
                      text-gray-500
                    ">
                      ?
                    </div>
                  )}

                  <span className="text-gray-300">
                    {credits.director.name}
                  </span>

                </div>

              </div>
            )}


            {/* ======================================
                TRAILER
            ====================================== */}

            {trailer ? (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  items-center
                  gap-2
                  mt-7
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  px-6
                  py-3
                  rounded-lg
                  font-semibold
                  transition
                  shadow-lg
                  shadow-red-600/20
                "
              >
                ▶ Watch Trailer
              </a>
            ) : (
              <button
                disabled
                className="
                  inline-flex
                  items-center
                  gap-2
                  mt-7
                  bg-zinc-800
                  text-gray-500
                  px-6
                  py-3
                  rounded-lg
                  font-semibold
                  cursor-not-allowed
                "
              >
                🎬 Trailer Unavailable
              </button>
            )}

          </div>

        </div>


        {/* ==========================================
            CAST
        ========================================== */}

        {credits.cast?.length > 0 && (
          <section className="mt-14">

            <h2 className="text-2xl font-bold mb-6">
              Cast
            </h2>

            <div className="
              flex
              gap-5
              overflow-x-auto
              pb-5
            ">

              {credits.cast
                .slice(0, 20)
                .map((person) => (
                  <div
                    key={person.id}
                    className="
                      flex-shrink-0
                      w-32
                      group
                    "
                  >

                    {/* CAST IMAGE */}

                    {person.profile_path ? (
                      <img
                        src={getImageUrl(
                          person.profile_path
                        )}
                        alt={person.name}
                        className="
                          w-32
                          h-44
                          object-cover
                          rounded-xl
                          transition
                          duration-300
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div className="
                        w-32
                        h-44
                        bg-zinc-900
                        rounded-xl
                        flex
                        items-center
                        justify-center
                        text-gray-600
                        text-xs
                        text-center
                      ">
                        No Image
                      </div>
                    )}

                    {/* ACTOR NAME */}

                    <p className="
                      text-white
                      text-sm
                      font-semibold
                      mt-3
                      truncate
                    ">
                      {person.name}
                    </p>

                    {/* CHARACTER */}

                    <p className="
                      text-gray-500
                      text-xs
                      mt-1
                      truncate
                    ">
                      {person.character ||
                        "Cast"}
                    </p>

                  </div>
                ))}

            </div>

          </section>
        )}


        {/* ==========================================
            MOVIE INFORMATION
        ========================================== */}

        <section className="
          mt-12
          border-t
          border-white/10
          pt-8
        ">

          <h2 className="text-2xl font-bold mb-6">
            Movie Information
          </h2>

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-6
          ">

            {/* STATUS */}

            {movie.status && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Status
                </p>

                <p className="text-white">
                  {movie.status}
                </p>
              </div>
            )}


            {/* RELEASE DATE */}

            {movie.release_date && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Release Date
                </p>

                <p className="text-white">
                  {movie.release_date}
                </p>
              </div>
            )}


            {/* LANGUAGE */}

            {movie.original_language && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Original Language
                </p>

                <p className="text-white uppercase">
                  {movie.original_language}
                </p>
              </div>
            )}


            {/* RUNTIME */}

            <div>
              <p className="text-gray-500 text-sm mb-1">
                Runtime
              </p>

              <p className="text-white">
                {formatRuntime(movie.runtime)}
              </p>
            </div>


            {/* BUDGET */}

            {movie.budget > 0 && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Budget
                </p>

                <p className="text-white">
                  $
                  {movie.budget.toLocaleString()}
                </p>
              </div>
            )}


            {/* REVENUE */}

            {movie.revenue > 0 && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Revenue
                </p>

                <p className="text-white">
                  $
                  {movie.revenue.toLocaleString()}
                </p>
              </div>
            )}

          </div>


          {/* PRODUCTION COMPANIES */}

          {movie.production_companies?.length > 0 && (
            <div className="mt-10">

              <h3 className="text-xl font-bold mb-4">
                Production Companies
              </h3>

              <div className="flex flex-wrap gap-3">

                {movie.production_companies.map(
                  (company) => (
                    <span
                      key={company.id}
                      className="
                        bg-zinc-900
                        border
                        border-white/10
                        px-4
                        py-2
                        rounded-lg
                        text-gray-400
                        text-sm
                      "
                    >
                      {company.name}
                    </span>
                  )
                )}

              </div>

            </div>
          )}

        </section>


        {/* ==========================================
            RATINGS & REVIEWS
        ========================================== */}

        <Reviews
          id={id}
          type="movie"
        />

      </div>

    </div>
  );
}

export default Movie;