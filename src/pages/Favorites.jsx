import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_URL = "http://127.0.0.1:5001/api";

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = (() => {
    try {
      const savedUser = localStorage.getItem("cineworld_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  })();

  // ==========================================
  // LOAD FAVORITES
  // ==========================================

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/favorites/${user.id}`
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load favorites"
        );
      }

      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Favorites error:", error);
      setError("Unable to load favorites.");
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // REMOVE FAVORITE
  // ==========================================

  async function handleRemove(favoriteId) {
    try {
      const response = await fetch(
        `${API_URL}/favorites/${favoriteId}`,
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

      // Remove immediately from screen
      setFavorites((current) =>
        current.filter((item) => item.id !== favoriteId)
      );
    } catch (error) {
      console.error("Remove favorite error:", error);
      setError("Unable to remove favorite.");
    }
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
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

        {!loading && error && (
          <div className="text-center py-20">

            <p className="text-red-400 text-lg">
              {error}
            </p>

            <button
              onClick={loadFavorites}
              className="mt-4 bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
            >
              Try Again
            </button>

          </div>
        )}

        {/* EMPTY */}

        {!loading &&
          !error &&
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
          !error &&
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
                    key={item.id}
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
                      onClick={() => handleRemove(item.id)}
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