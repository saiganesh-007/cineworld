import { useState } from "react";
import { Link } from "react-router-dom";

import { useSavedItems } from "../context/SavedItemsContext";

function Favorites() {
  const {
    status,
    isAuthenticated,
    favorites,
    savedError,
    removeFavorite,
    refreshSavedItems,
  } = useSavedItems();

  const [loggedOut, setLoggedOut] = useState(false);
  const [error, setError] = useState("");

  const loading = status === "loading";

  const displayError = error || savedError;

  // ==========================================
  // REMOVE FAVORITE
  // ==========================================

  async function handleRemove(item) {
    try {
      await removeFavorite(item.movie_id, item.media_type);
      setError("");
    } catch (error) {
      if (error.status === 401) {
        setLoggedOut(true);
      } else {
        console.error("Remove favorite error:", error);
        setError("Unable to remove favorite.");
      }
    }
  }

  // ==========================================
  // RETRY
  // ==========================================

  async function handleRetry() {
    setError("");
    try {
      await refreshSavedItems();
    } catch (err) {
      setError("Unable to load favorites.");
    }
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (loggedOut || (status === "ready" && !isAuthenticated)) {
    return (
      <div className="min-h-screen bg-black text-white px-6 py-10">
        <div className="max-w-7xl mx-auto text-center py-20">

          <h1 className="text-4xl font-bold mb-4">
            ❤️ My Favorites
          </h1>

          <p className="text-gray-400 mb-6">
            Please login to view your favorites.
          </p>

          <Link
            to="/login"
            className="inline-block bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold"
          >
            Login
          </Link>

        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          ❤️ My Favorites
        </h1>

        {/* LOADING */}

        {loading && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">
              Loading favorites...
            </p>
          </div>
        )}

        {/* ERROR */}

        {!loading && displayError && (
          <div className="text-center py-20">

            <p className="text-red-400 text-lg">
              {displayError}
            </p>

            <button
              onClick={handleRetry}
              className="mt-4 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !displayError &&
          favorites.length === 0 && (
            <div className="text-center py-20">

              <p className="text-gray-400 text-lg">
                You haven't added anything to Favorites yet.
              </p>

              <p className="text-gray-600 mt-2">
                Add movies or web series using ❤️
              </p>

            </div>
          )}

        {/* FAVORITES */}

        {!loading &&
          !displayError &&
          favorites.length > 0 && (

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

              {favorites.map((item) => {

                const detailsPath =
                  item.media_type === "tv"
                    ? `/tv/${item.movie_id}`
                    : `/movie/${item.movie_id}`;

                const imageUrl = item.poster_path
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : null;

                return (
                  <div
                    key={`${item.media_type}-${item.movie_id}`}
                    className="group"
                  >

                    {/* POSTER */}

                    <Link
                      to={detailsPath}
                      className="block"
                    >

                      <div className="relative overflow-hidden rounded-xl bg-zinc-900 h-72 border border-white/10">

                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.title}
                            loading="lazy"
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-600">
                            No Image
                          </div>
                        )}

                      </div>

                    </Link>

                    {/* TITLE */}

                    <h3
                      className="text-white font-semibold mt-3 truncate"
                      title={item.title}
                    >
                      {item.title || "Untitled"}
                    </h3>

                    {/* TYPE */}

                    <p className="text-gray-500 text-xs mt-1">
                      {item.media_type === "tv"
                        ? "TV / Web Series"
                        : "Movie"}
                    </p>

                    {/* REMOVE */}

                    <button
                      onClick={() => handleRemove(item)}
                      className="w-full mt-3 bg-red-600/20 border border-red-500/30 hover:bg-red-600 hover:text-white text-red-400 py-2 rounded-lg font-semibold transition"
                    >
                      Remove ❤️
                    </button>

                  </div>
                );
              })}

            </div>
          )}

      </div>

    </div>
  );
}

export default Favorites;