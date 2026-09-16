import { useState } from "react";
import { Link } from "react-router-dom";

import PosterGridSkeleton from "../components/PosterGridSkeleton";

import { useSavedItems } from "../context/SavedItemsContext";

// ==========================================
// ICONS
// ==========================================

function BookmarkIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

// ==========================================
// WATCHLIST
// ==========================================

function Watchlist() {
  const {
    status,
    isAuthenticated,
    watchlist,
    savedError,
    removeWatchlist,
  } = useSavedItems();

  const [loggedOut, setLoggedOut] = useState(false);
  const [error, setError] = useState("");

  const loading = status === "loading";

  const displayError = error || savedError;

  // ==========================================
  // REMOVE FROM WATCHLIST
  // ==========================================

  async function handleRemove(item) {
    try {
      await removeWatchlist(item.movie_id, item.media_type);
      setError("");
    } catch (err) {
      if (err.status === 401) {
        setLoggedOut(true);
      } else {
        console.error("Remove watchlist error:", err);
        setError("Couldn't remove that item right now.");
      }
    }
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (loggedOut || (status === "ready" && !isAuthenticated)) {
    return (
      <div className="bg-black text-white px-6 py-10">
        <div className="max-w-7xl mx-auto text-center py-20">

          <h1 className="text-4xl font-bold mb-4">
            My Watchlist
          </h1>

          <p className="text-gray-400 mb-6">
            Please login to view your watchlist.
          </p>

          <Link
            to="/login"
            className="inline-block bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition"
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
    <div className="bg-black text-white px-6 py-10">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-2">
          My Watchlist
        </h1>

        {displayError && (
          <p className="mb-6 text-sm text-red-400/90">
            {displayError}
          </p>
        )}

        {/* LOADING */}

        {loading && <PosterGridSkeleton />}

        {/* EMPTY */}

        {!loading &&
          !displayError &&
          watchlist.length === 0 && (
            <div className="text-center py-20">

              <BookmarkIcon className="w-10 h-10 mx-auto mb-5 text-gray-700" />

              <h2 className="text-white text-xl font-semibold">
                Your watchlist is empty
              </h2>

              <p className="text-gray-400 mt-2 max-w-md mx-auto">
                Add something you want to watch later.
              </p>

              <Link
                to="/"
                className="inline-block mt-7 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold transition"
              >
                Discover Something
              </Link>

            </div>
          )}

        {/* ERROR + EXISTING ITEMS */}

        {!loading &&
          (displayError || watchlist.length > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">

              {watchlist.map((item) => {

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
                      Remove
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

export default Watchlist;