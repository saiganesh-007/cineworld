import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import {
  getTVDetails,
  getTVCredits,
  getTVVideos,
  getImageUrl,
} from "../services/tmdb";

const API_URL = "http://127.0.0.1:5001/api";

function Details() {
  const { id } = useParams();

  const [show, setShow] = useState(null);

  const [credits, setCredits] = useState({
    creators: [],
    cast: [],
  });

  const [trailer, setTrailer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

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

        const [showData, creditData, videoData] =
          await Promise.all([
            getTVDetails(id),
            getTVCredits(id),
            getTVVideos(id),
          ]);

        setShow(showData);
        setCredits(creditData);

        // Official trailer
        const officialTrailer = videoData.find(
          (video) =>
            video.site === "YouTube" &&
            video.type === "Trailer" &&
            video.official === true
        );

        // Any trailer
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
        console.error(
          "TV / Anime details error:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDetails();
  }, [id]);

  // ==========================================
  // CHECK FAVORITES + WATCHLIST
  // ==========================================

  useEffect(() => {
    if (!user) return;

    async function checkSavedItems() {
      try {
        const [favoritesResponse, watchlistResponse] =
          await Promise.all([
            fetch(
              `${API_URL}/favorites/${user.id}`
            ),
            fetch(
              `${API_URL}/watchlist/${user.id}`
            ),
          ]);

        if (!favoritesResponse.ok) {
          throw new Error("Failed to load favorites");
        }

        if (!watchlistResponse.ok) {
          throw new Error("Failed to load watchlist");
        }

        const favoritesData =
          await favoritesResponse.json();

        const watchlistData =
          await watchlistResponse.json();

        const favoriteExists =
          (favoritesData.favorites || []).some(
            (item) =>
              String(item.movie_id) === String(id) &&
              item.media_type === "tv"
          );

        const watchlistExists =
          (watchlistData.watchlist || []).some(
            (item) =>
              String(item.movie_id) === String(id) &&
              item.media_type === "tv"
          );

        setIsFavorite(favoriteExists);
        setIsWatchlisted(watchlistExists);
      } catch (error) {
        console.error(
          "Check saved items error:",
          error
        );
      }
    }

    checkSavedItems();
  }, [id]);

  // ==========================================
  // ADD / REMOVE FAVORITE
  // ==========================================

  async function handleFavorite() {
    if (!user) {
      setMessage("Please login first.");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      // REMOVE
      if (isFavorite) {
        const response = await fetch(
          `${API_URL}/favorites/${getFavoriteId()}`,
          {
            method: "DELETE",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to remove favorite"
          );
        }

        setIsFavorite(false);
        setMessage("Removed from Favorites ❤️");
        return;
      }

      // ADD
      const response = await fetch(
        `${API_URL}/favorites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            movie_id: Number(id),
            media_type: "tv",
            title: show.name,
            poster_path: show.poster_path,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add favorite"
        );
      }

      setIsFavorite(true);
      setMessage("Added to Favorites ❤️");
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      setMessage(
        error.message || "Unable to update Favorites."
      );
    } finally {
      setActionLoading(false);
    }
  }

  // ==========================================
  // GET FAVORITE ID
  // ==========================================

  function getFavoriteId() {
    return window.__cineworldFavoriteId;
  }

  // ==========================================
  // ADD / REMOVE WATCHLIST
  // ==========================================

  async function handleWatchlist() {
    if (!user) {
      setMessage("Please login first.");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      // ADD
      const response = await fetch(
        `${API_URL}/watchlist`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.id,
            movie_id: Number(id),
            media_type: "tv",
            title: show.name,
            poster_path: show.poster_path,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add watchlist"
        );
      }

      setIsWatchlisted(true);
      setMessage("Added to Watchlist 🔖");
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
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-gray-400 text-lg">
          Loading...
        </p>
      </div>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================

  if (!show || show.success === false) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
        <h1 className="text-3xl font-bold mb-4">
          Not found
        </h1>

        <Link
          to="/"
          className="text-red-500 hover:text-red-400"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* BACKDROP */}

      {show.backdrop_path && (
        <div className="relative w-full h-[420px] overflow-hidden">

          <img
            src={`https://image.tmdb.org/t/p/original${show.backdrop_path}`}
            alt={show.name}
            className="w-full h-full object-cover"
          />

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black
              via-black/60
              to-transparent
            "
          />

        </div>
      )}

      {/* MAIN */}

      <div
        className={`max-w-7xl mx-auto px-6 ${
          show.backdrop_path
            ? "-mt-32 relative z-10"
            : "pt-10"
        }`}
      >

        {/* POSTER + DETAILS */}

        <div className="flex flex-col md:flex-row gap-8">

          {/* POSTER */}

          <div className="flex-shrink-0">

            {show.poster_path ? (
              <img
                src={getImageUrl(show.poster_path)}
                alt={show.name}
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
              <div
                className="
                  w-64
                  md:w-72
                  h-96
                  bg-zinc-900
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  text-gray-500
                "
              >
                No Image
              </div>
            )}

          </div>

          {/* DETAILS */}

          <div className="flex-1 pt-4">

            <h1
              className="
                text-4xl
                md:text-6xl
                font-bold
                mb-5
              "
            >
              {show.name}
            </h1>

            {/* YEAR / RATING / SEASONS */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-4
                text-gray-400
                mb-6
              "
            >
              <span>
                {show.first_air_date?.slice(0, 4) ||
                  "N/A"}
              </span>

              <span>
                ⭐{" "}
                {show.vote_average
                  ? show.vote_average.toFixed(1)
                  : "N/A"}
              </span>

              <span>
                {show.number_of_seasons || 0} Seasons
              </span>

              <span>
                {show.number_of_episodes || 0} Episodes
              </span>
            </div>

            {/* GENRES */}

            {show.genres?.length > 0 && (
              <div
                className="
                  flex
                  flex-wrap
                  gap-2
                  mb-7
                "
              >
                {show.genres.map((genre) => (
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

            <p
              className="
                text-gray-300
                leading-8
                max-w-4xl
              "
            >
              {show.overview ||
                "No description available."}
            </p>

            {/* SAVE BUTTONS */}

            <div className="flex flex-wrap gap-4 mt-8">

              <button
                onClick={handleFavorite}
                disabled={actionLoading}
                className={`
                  px-6
                  py-3
                  rounded-lg
                  font-semibold
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
                disabled={
                  actionLoading || isWatchlisted
                }
                className={`
                  px-6
                  py-3
                  rounded-lg
                  font-semibold
                  transition
                  ${
                    isWatchlisted
                      ? "bg-zinc-700"
                      : "bg-white/10 hover:bg-white/20"
                  }
                  disabled:opacity-50
                `}
              >
                {isWatchlisted
                  ? "🔖 In Watchlist"
                  : "🔖 Add to Watchlist"}
              </button>

            </div>

            {/* MESSAGE */}

            {message && (
              <p className="mt-4 text-sm text-gray-400">
                {message}
              </p>
            )}

            {/* TRAILER */}

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
                "
              >
                🎬 Trailer Unavailable
              </button>
            )}

          </div>
        </div>

        {/* CAST */}

        {credits.cast?.length > 0 && (
          <section className="mt-14">

            <h2 className="text-2xl font-bold mb-6">
              Cast
            </h2>

            <div
              className="
                flex
                gap-5
                overflow-x-auto
                pb-5
              "
            >
              {credits.cast
                .slice(0, 20)
                .map((person) => (
                  <div
                    key={person.id}
                    className="flex-shrink-0 w-32"
                  >

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
                        "
                      />
                    ) : (
                      <div
                        className="
                          w-32
                          h-44
                          bg-zinc-900
                          rounded-xl
                          flex
                          items-center
                          justify-center
                          text-gray-600
                          text-xs
                        "
                      >
                        No Image
                      </div>
                    )}

                    <p
                      className="
                        text-white
                        text-sm
                        font-semibold
                        mt-3
                        truncate
                      "
                    >
                      {person.name}
                    </p>

                    <p
                      className="
                        text-gray-500
                        text-xs
                        mt-1
                        truncate
                      "
                    >
                      {person.character || "Cast"}
                    </p>

                  </div>
                ))}
            </div>

          </section>
        )}

        {/* INFORMATION */}

        <section
          className="
            mt-12
            border-t
            border-white/10
            pt-8
            pb-16
          "
        >

          <h2 className="text-2xl font-bold mb-6">
            Information
          </h2>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-6
            "
          >

            {show.status && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Status
                </p>
                <p>{show.status}</p>
              </div>
            )}

            {show.original_language && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Original Language
                </p>
                <p className="uppercase">
                  {show.original_language}
                </p>
              </div>
            )}

            {show.first_air_date && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  First Air Date
                </p>
                <p>{show.first_air_date}</p>
              </div>
            )}

            {show.last_air_date && (
              <div>
                <p className="text-gray-500 text-sm mb-1">
                  Last Air Date
                </p>
                <p>{show.last_air_date}</p>
              </div>
            )}

            <div>
              <p className="text-gray-500 text-sm mb-1">
                Seasons
              </p>
              <p>
                {show.number_of_seasons || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm mb-1">
                Episodes
              </p>
              <p>
                {show.number_of_episodes || "N/A"}
              </p>
            </div>

          </div>

          {show.networks?.length > 0 && (
            <div className="mt-10">

              <h3 className="text-xl font-bold mb-4">
                Networks
              </h3>

              <div className="flex flex-wrap gap-3">
                {show.networks.map((network) => (
                  <span
                    key={network.id}
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
                    {network.name}
                  </span>
                ))}
              </div>

            </div>
          )}

        </section>

      </div>
    </div>
  );
}

export default Details;