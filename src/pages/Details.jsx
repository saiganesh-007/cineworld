import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getMovieDetails,
  getMovieCredits,
  getMovieVideos,
  getTVDetails,
  getTVCredits,
  getTVVideos,
  getImageUrl,
} from "../services/tmdb";

import Reviews from "../components/Reviews";

const API_URL = "http://127.0.0.1:5001/api";

function Details() {
  const { id } = useParams();

  // Detect movie or TV from URL
  const isMovie = window.location.pathname.startsWith("/movie");

  const mediaType = isMovie ? "movie" : "tv";

  const [details, setDetails] = useState(null);

  const [credits, setCredits] = useState({
    cast: [],
    crew: [],
    creators: [],
  });

  const [trailer, setTrailer] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const [isFavorite, setIsFavorite] = useState(false);

  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const [favoriteId, setFavoriteId] = useState(null);

  const [watchlistId, setWatchlistId] = useState(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [message, setMessage] = useState("");

  const user = JSON.parse(
    localStorage.getItem("cineworld_user")
  );

  // ==========================================
  // FETCH DETAILS
  // ==========================================

  useEffect(() => {
    async function fetchDetails() {
      try {
        setLoading(true);
        setError(false);

        let detailData;
        let creditData;
        let videoData;

        if (isMovie) {
          detailData = await getMovieDetails(id);
          creditData = await getMovieCredits(id);
          videoData = await getMovieVideos(id);
        } else {
          detailData = await getTVDetails(id);
          creditData = await getTVCredits(id);
          videoData = await getTVVideos(id);
        }

        setDetails(detailData);

        setCredits(
          creditData || {
            cast: [],
            crew: [],
            creators: [],
          }
        );

        // ==========================================
        // FIND TRAILER
        // ==========================================

        const officialTrailer = (videoData || []).find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official === true
        );

        const anyTrailer = (videoData || []).find(
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
        console.error(
          "Details error:",
          error
        );

        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id, isMovie]);

  // ==========================================
  // CHECK FAVORITES + WATCHLIST
  // ==========================================

  useEffect(() => {
    if (!user) return;

    async function checkSavedItems() {
      try {
        const [
          favoritesResponse,
          watchlistResponse,
        ] = await Promise.all([
          fetch(
            `${API_URL}/favorites/${user.id}`
          ),
          fetch(
            `${API_URL}/watchlist/${user.id}`
          ),
        ]);

        if (!favoritesResponse.ok) {
          throw new Error(
            "Failed to load favorites"
          );
        }

        if (!watchlistResponse.ok) {
          throw new Error(
            "Failed to load watchlist"
          );
        }

        const favoritesData =
          await favoritesResponse.json();

        const watchlistData =
          await watchlistResponse.json();

        // ==========================================
        // FIND FAVORITE
        // ==========================================

        const favoriteItem =
          (favoritesData.favorites || []).find(
            (item) =>
              String(item.movie_id) ===
                String(id) &&
              item.media_type === mediaType
          );

        // ==========================================
        // FIND WATCHLIST
        // ==========================================

        const watchlistItem =
          (watchlistData.watchlist || []).find(
            (item) =>
              String(item.movie_id) ===
                String(id) &&
              item.media_type === mediaType
          );

        if (favoriteItem) {
          setIsFavorite(true);

          setFavoriteId(
            favoriteItem.id
          );
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }

        if (watchlistItem) {
          setIsWatchlisted(true);

          setWatchlistId(
            watchlistItem.id
          );
        } else {
          setIsWatchlisted(false);
          setWatchlistId(null);
        }

      } catch (error) {
        console.error(
          "Saved items error:",
          error
        );
      }
    }

    checkSavedItems();
  }, [id, mediaType, user]);

  // ==========================================
  // FAVORITE
  // ==========================================

  async function handleFavorite() {
    if (!user) {
      setMessage(
        "Please login first."
      );

      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      // ==========================================
      // REMOVE FAVORITE
      // ==========================================

      if (isFavorite) {
        if (!favoriteId) {
          throw new Error(
            "Favorite ID not found"
          );
        }

        const response = await fetch(
          `${API_URL}/favorites/${favoriteId}`,
          {
            method: "DELETE",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to remove favorite"
          );
        }

        setIsFavorite(false);
        setFavoriteId(null);

        setMessage(
          "Removed from Favorites ❤️"
        );

        return;
      }

      // ==========================================
      // ADD FAVORITE
      // ==========================================

      const title = isMovie
        ? details.title
        : details.name;

      const response = await fetch(
        `${API_URL}/favorites`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            user_id: user.id,

            movie_id: Number(id),

            media_type: mediaType,

            title: title,

            poster_path:
              details.poster_path,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add favorite"
        );
      }

      setIsFavorite(true);

      if (data.id) {
        setFavoriteId(data.id);
      }

      setMessage(
        "Added to Favorites ❤️"
      );

    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to update Favorites."
      );

    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================
  // WATCHLIST
  // ==========================================

  async function handleWatchlist() {
    if (!user) {
      setMessage(
        "Please login first."
      );

      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      // ==========================================
      // REMOVE WATCHLIST
      // ==========================================

      if (isWatchlisted) {
        if (!watchlistId) {
          throw new Error(
            "Watchlist ID not found"
          );
        }

        const response = await fetch(
          `${API_URL}/watchlist/${watchlistId}`,
          {
            method: "DELETE",
          }
        );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to remove watchlist"
          );
        }

        setIsWatchlisted(false);
        setWatchlistId(null);

        setMessage(
          "Removed from Watchlist 🔖"
        );

        return;
      }

      // ==========================================
      // ADD WATCHLIST
      // ==========================================

      const title = isMovie
        ? details.title
        : details.name;

      const response = await fetch(
        `${API_URL}/watchlist`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            user_id: user.id,

            movie_id: Number(id),

            media_type: mediaType,

            title: title,

            poster_path:
              details.poster_path,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to add watchlist"
        );
      }

      setIsWatchlisted(true);

      if (data.id) {
        setWatchlistId(data.id);
      }

      setMessage(
        "Added to Watchlist 🔖"
      );

    } catch (error) {
      console.error(
        "Watchlist error:",
        error
      );

      setMessage(
        error.message ||
          "Unable to update Watchlist."
      );

    } finally {
      setActionLoading(false);
    }
  }

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
        <p className="text-gray-400">
          Loading...
        </p>
      </div>
    );
  }

  // ==========================================
  // ERROR / NOT FOUND
  // ==========================================

  if (
    error ||
    !details ||
    details.success === false
  ) {
    return (
      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        flex-col
        items-center
        justify-center
        px-6
      ">

        <h1 className="
          text-3xl
          font-bold
          mb-4
        ">
          {isMovie
            ? "Movie not found"
            : "Show not found"}
        </h1>

        <p className="
          text-gray-500
          mb-6
          text-center
        ">
          We couldn't load this title.
        </p>

        <Link
          to={
            isMovie
              ? "/movies"
              : "/webseries"
          }
          className="
            text-red-500
            hover:text-red-400
          "
        >
          ← Back
        </Link>

      </div>
    );
  }

  // ==========================================
  // TITLE / DATE
  // ==========================================

  const title = isMovie
    ? details.title
    : details.name;

  const releaseDate = isMovie
    ? details.release_date
    : details.first_air_date;

  // ==========================================
  // DIRECTOR / CREATOR
  // ==========================================

  const creators =
    isMovie
      ? credits.crew
          ?.filter(
            (person) =>
              person.job === "Director"
          )
          .slice(0, 5)
      : credits.creators || [];

  return (
    <main className="
      min-h-screen
      bg-black
      text-white
    ">

      {/* ==========================================
          BACKDROP
      ========================================== */}

      {details.backdrop_path && (
        <div className="
          relative
          w-full
          h-[420px]
          overflow-hidden
        ">

          <img
            src={getImageUrl(
              details.backdrop_path,
              "original"
            )}
            alt={title}
            className="
              w-full
              h-full
              object-cover
            "
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
          MAIN CONTENT
      ========================================== */}

      <div
        className={`
          max-w-7xl
          mx-auto
          px-6
          ${
            details.backdrop_path
              ? "-mt-32 relative z-10"
              : "pt-10"
          }
        `}
      >

        {/* ==========================================
            POSTER + DETAILS
        ========================================== */}

        <div className="
          flex
          flex-col
          md:flex-row
          gap-8
        ">

          {/* POSTER */}

          <div className="
            flex-shrink-0
          ">

            {details.poster_path ? (
              <img
                src={getImageUrl(
                  details.poster_path
                )}
                alt={title}
                className="
                  w-56
                  md:w-64
                  rounded-xl
                  shadow-2xl
                  border
                  border-white/10
                "
              />
            ) : (
              <div className="
                w-56
                md:w-64
                h-80
                bg-zinc-900
                rounded-xl
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

          <div className="
            flex-1
            pt-2
          ">

            {/* TITLE */}

            <h1 className="
              text-3xl
              md:text-5xl
              font-bold
              mb-4
            ">
              {title}
            </h1>

            {/* META */}

            <div className="
              flex
              flex-wrap
              items-center
              gap-4
              text-gray-400
              mb-5
            ">

              <span>
                {releaseDate?.slice(
                  0,
                  4
                ) || "N/A"}
              </span>

              <span>
                ⭐{" "}
                {details.vote_average
                  ? details.vote_average.toFixed(
                      1
                    )
                  : "N/A"}
              </span>

              {!isMovie && (
                <>
                  <span>
                    {details.number_of_seasons ||
                      0}{" "}
                    Seasons
                  </span>

                  <span>
                    {details.number_of_episodes ||
                      0}{" "}
                    Episodes
                  </span>
                </>
              )}

              {isMovie &&
                details.runtime && (
                  <span>
                    {Math.floor(
                      details.runtime / 60
                    )}h{" "}
                    {details.runtime % 60}m
                  </span>
                )}

            </div>

            {/* GENRES */}

            {details.genres?.length > 0 && (
              <div className="
                flex
                flex-wrap
                gap-2
                mb-6
              ">

                {details.genres.map(
                  (genre) => (
                    <span
                      key={genre.id}
                      className="
                        bg-white/10
                        border
                        border-white/10
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        text-gray-300
                      "
                    >
                      {genre.name}
                    </span>
                  )
                )}

              </div>
            )}

            {/* OVERVIEW */}

            <h2 className="
              text-xl
              font-bold
              mb-3
            ">
              Overview
            </h2>

            <p className="
              text-gray-300
              leading-7
              max-w-4xl
            ">
              {details.overview ||
                "No description available."}
            </p>

            {/* ==========================================
                FAVORITE + WATCHLIST
            ========================================== */}

            <div className="
              flex
              flex-wrap
              gap-3
              mt-7
            ">

              <button
                onClick={handleFavorite}
                disabled={actionLoading}
                className={`
                  px-5
                  py-2.5
                  rounded-lg
                  font-semibold
                  text-sm
                  transition
                  ${
                    isFavorite
                      ? "bg-zinc-700 hover:bg-zinc-600"
                      : "bg-red-600 hover:bg-red-700"
                  }
                  disabled:opacity-50
                `}
              >
                {isFavorite
                  ? "❤️ Remove Favorite"
                  : "❤️ Add to Favorites"}
              </button>

              <button
                onClick={handleWatchlist}
                disabled={actionLoading}
                className={`
                  px-5
                  py-2.5
                  rounded-lg
                  font-semibold
                  text-sm
                  transition
                  ${
                    isWatchlisted
                      ? "bg-zinc-700 hover:bg-zinc-600"
                      : "bg-white/10 hover:bg-white/20"
                  }
                  disabled:opacity-50
                `}
              >
                {isWatchlisted
                  ? "🔖 Remove Watchlist"
                  : "🔖 Add to Watchlist"}
              </button>

            </div>

            {/* MESSAGE */}

            {message && (
              <p className="
                mt-3
                text-sm
                text-gray-400
              ">
                {message}
              </p>
            )}

            {/* ==========================================
                TRAILER
            ========================================== */}

            {trailer ? (
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  inline-flex
                  items-center
                  gap-2
                  mt-6
                  bg-red-600
                  hover:bg-red-700
                  text-white
                  px-5
                  py-2.5
                  rounded-lg
                  font-semibold
                  text-sm
                  transition
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
                  mt-6
                  bg-zinc-800
                  text-gray-500
                  px-5
                  py-2.5
                  rounded-lg
                  font-semibold
                  text-sm
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

            <h2 className="
              text-2xl
              font-bold
              mb-5
            ">
              Cast
            </h2>

            <div className="
              flex
              gap-4
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
                      w-28
                    "
                  >

                    {person.profile_path ? (
                      <img
                        src={getImageUrl(
                          person.profile_path
                        )}
                        alt={person.name}
                        className="
                          w-28
                          h-40
                          object-cover
                          rounded-lg
                        "
                      />
                    ) : (
                      <div className="
                        w-28
                        h-40
                        bg-zinc-900
                        rounded-lg
                        flex
                        items-center
                        justify-center
                        text-gray-600
                        text-xs
                      ">
                        No Image
                      </div>
                    )}

                    <p className="
                      text-white
                      text-sm
                      font-semibold
                      mt-2
                      truncate
                    ">
                      {person.name}
                    </p>

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
            CREATOR / DIRECTOR
        ========================================== */}

        {creators?.length > 0 && (
          <section className="
            mt-10
            border-t
            border-white/10
            pt-8
          ">

            <h2 className="
              text-xl
              font-bold
              mb-4
            ">
              {isMovie
                ? "Director"
                : "Creators"}
            </h2>

            <div className="
              flex
              flex-wrap
              gap-3
            ">

              {creators.map(
                (person) => (
                  <span
                    key={
                      person.id ||
                      person.credit_id
                    }
                    className="
                      bg-zinc-900
                      border
                      border-white/10
                      px-4
                      py-2
                      rounded-lg
                      text-gray-300
                      text-sm
                    "
                  >
                    {person.name}
                  </span>
                )
              )}

            </div>

          </section>
        )}

        {/* ==========================================
            INFORMATION
        ========================================== */}

        <section className="
          mt-10
          border-t
          border-white/10
          pt-8
        ">

          <h2 className="
            text-xl
            font-bold
            mb-5
          ">
            Information
          </h2>

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-5
          ">

            {details.status && (
              <div>
                <p className="
                  text-gray-500
                  text-sm
                  mb-1
                ">
                  Status
                </p>

                <p>
                  {details.status}
                </p>
              </div>
            )}

            {details.original_language && (
              <div>
                <p className="
                  text-gray-500
                  text-sm
                  mb-1
                ">
                  Original Language
                </p>

                <p className="uppercase">
                  {details.original_language}
                </p>
              </div>
            )}

            {releaseDate && (
              <div>
                <p className="
                  text-gray-500
                  text-sm
                  mb-1
                ">
                  {isMovie
                    ? "Release Date"
                    : "First Air Date"}
                </p>

                <p>
                  {releaseDate}
                </p>
              </div>
            )}

            {isMovie &&
              details.production_companies
                ?.length > 0 && (
                <div>
                  <p className="
                    text-gray-500
                    text-sm
                    mb-1
                  ">
                    Production
                  </p>

                  <p>
                    {
                      details
                        .production_companies[0]
                        ?.name
                    }
                  </p>
                </div>
              )}

            {!isMovie &&
              details.networks
                ?.length > 0 && (
                <div>
                  <p className="
                    text-gray-500
                    text-sm
                    mb-1
                  ">
                    Network
                  </p>

                  <p>
                    {
                      details.networks[0]
                        ?.name
                    }
                  </p>
                </div>
              )}

            {isMovie &&
              details.budget > 0 && (
                <div>
                  <p className="
                    text-gray-500
                    text-sm
                    mb-1
                  ">
                    Budget
                  </p>

                  <p>
                    $
                    {details.budget.toLocaleString()}
                  </p>
                </div>
              )}

          </div>

        </section>

        {/* ==========================================
            REVIEWS
        ========================================== */}

        <Reviews
          id={id}
          type={mediaType}
        />

        <div className="h-16" />

      </div>

    </main>
  );
}

export default Details;