import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5001/api";

function MovieCard({
  id,
  type = "movie",
  title,
  year,
  rating,
  image,
}) {
  const detailsPath =
    type === "tv"
      ? `/tv/${id}`
      : `/movie/${id}`;

  const [isFavorite, setIsFavorite] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);

  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

  // ==========================================
  // GET LOGGED-IN USER
  // ==========================================

  function getUser() {
    try {
      const savedUser = localStorage.getItem("cineworld_user");

      if (!savedUser) {
        return null;
      }

      return JSON.parse(savedUser);
    } catch (error) {
      console.error("User data error:", error);
      return null;
    }
  }

  // ==========================================
  // CHECK FAVORITE + WATCHLIST
  // ==========================================

  useEffect(() => {
    const user = getUser();

    if (!user) {
      setIsFavorite(false);
      setIsWatchlisted(false);
      return;
    }

    async function checkSavedItems() {
      try {
        // ------------------------------
        // CHECK FAVORITES
        // ------------------------------

        const favoriteResponse = await fetch(
          `${API_URL}/favorites/${user.id}`
        );

        if (favoriteResponse.ok) {
          const favoriteData =
            await favoriteResponse.json();

          const exists =
            favoriteData.favorites?.some(
              (item) =>
                Number(item.movie_id) === Number(id) &&
                item.media_type === type
            );

          setIsFavorite(!!exists);
        }

        // ------------------------------
        // CHECK WATCHLIST
        // ------------------------------

        const watchlistResponse = await fetch(
          `${API_URL}/watchlist/${user.id}`
        );

        if (watchlistResponse.ok) {
          const watchlistData =
            await watchlistResponse.json();

          const exists =
            watchlistData.watchlist?.some(
              (item) =>
                Number(item.movie_id) === Number(id) &&
                item.media_type === type
            );

          setIsWatchlisted(!!exists);
        }
      } catch (error) {
        console.error(
          "Error checking saved items:",
          error
        );
      }
    }

    checkSavedItems();
  }, [id, type]);

  // ==========================================
  // GET POSTER PATH
  // ==========================================

  function getPosterPath() {
    if (!image) {
      return null;
    }

    if (image.includes("/t/p/w500")) {
      return image.split("/t/p/w500")[1];
    }

    return image;
  }

  // ==========================================
  // ❤️ ADD / REMOVE FAVORITE
  // ==========================================

  async function handleFavorite(event) {
    event.preventDefault();
    event.stopPropagation();

    const user = getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      setLoadingFavorite(true);

      // =====================================
      // REMOVE FAVORITE
      // =====================================

      if (isFavorite) {
        const response = await fetch(
          `${API_URL}/favorites/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to get favorites"
          );
        }

        const existing =
          data.favorites?.find(
            (item) =>
              Number(item.movie_id) === Number(id) &&
              item.media_type === type
          );

        if (!existing) {
          setIsFavorite(false);
          return;
        }

        const deleteResponse = await fetch(
          `${API_URL}/favorites/${existing.id}`,
          {
            method: "DELETE",
          }
        );

        const deleteData =
          await deleteResponse.json();

        if (!deleteResponse.ok) {
          throw new Error(
            deleteData.message ||
              "Failed to remove favorite"
          );
        }

        setIsFavorite(false);

        console.log(
          "Removed from favorites:",
          title
        );
      }

      // =====================================
      // ADD FAVORITE
      // =====================================

      else {
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
              media_type: type,
              title: title,
              poster_path: getPosterPath(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to add favorite"
          );
        }

        setIsFavorite(true);

        console.log(
          "Added to favorites:",
          data.favorite
        );
      }
    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      alert(error.message);
    } finally {
      setLoadingFavorite(false);
    }
  }

  // ==========================================
  // 🔖 ADD / REMOVE WATCHLIST
  // ==========================================

  async function handleWatchlist(event) {
    event.preventDefault();
    event.stopPropagation();

    const user = getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    try {
      setLoadingWatchlist(true);

      // =====================================
      // REMOVE WATCHLIST
      // =====================================

      if (isWatchlisted) {
        const response = await fetch(
          `${API_URL}/watchlist/${user.id}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to get watchlist"
          );
        }

        const existing =
          data.watchlist?.find(
            (item) =>
              Number(item.movie_id) === Number(id) &&
              item.media_type === type
          );

        if (!existing) {
          setIsWatchlisted(false);
          return;
        }

        const deleteResponse = await fetch(
          `${API_URL}/watchlist/${existing.id}`,
          {
            method: "DELETE",
          }
        );

        const deleteData =
          await deleteResponse.json();

        if (!deleteResponse.ok) {
          throw new Error(
            deleteData.message ||
              "Failed to remove watchlist item"
          );
        }

        setIsWatchlisted(false);

        console.log(
          "Removed from watchlist:",
          title
        );
      }

      // =====================================
      // ADD WATCHLIST
      // =====================================

      else {
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
              media_type: type,
              title: title,
              poster_path: getPosterPath(),
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to add watchlist"
          );
        }

        setIsWatchlisted(true);

        console.log(
          "Added to watchlist:",
          data.watchlist
        );
      }
    } catch (error) {
      console.error(
        "Watchlist error:",
        error
      );

      alert(error.message);
    } finally {
      setLoadingWatchlist(false);
    }
  }

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="block flex-shrink-0 w-32 sm:w-36 md:w-40">

      {/* ================================= */}
      {/* POSTER */}
      {/* ================================= */}

      <Link
        to={detailsPath}
        className="block group"
      >
        <div
          className="
            relative
            overflow-hidden
            rounded-lg
            bg-zinc-900
            h-48
            sm:h-52
            md:h-56
            border
            border-white/10
            shadow-lg
            transition-all
            duration-300
            group-hover:-translate-y-1
          "
        >
          {image ? (
            <img
              src={image}
              alt={title || "Movie"}
              loading="lazy"
              className="
                w-full
                h-full
                object-cover
                transition-transform
                duration-500
                group-hover:scale-105
              "
            />
          ) : (
            <div
              className="
                w-full
                h-full
                flex
                items-center
                justify-center
                text-gray-600
                text-sm
              "
            >
              No Image
            </div>
          )}

          {/* GRADIENT */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/70
              via-transparent
              to-transparent
              pointer-events-none
            "
          />

          {/* RATING */}

          <div
            className="
              absolute
              top-2
              right-2
              bg-black/80
              px-2
              py-1
              rounded-md
              text-yellow-400
              text-[11px]
              font-semibold
            "
          >
            ⭐ {rating || "N/A"}
          </div>

          {/* PLAY */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              bg-black/20
              opacity-0
              group-hover:opacity-100
              transition-opacity
              duration-300
              pointer-events-none
            "
          >
            <span
              className="
                w-9
                h-9
                rounded-full
                bg-white
                text-black
                flex
                items-center
                justify-center
                text-sm
                shadow-xl
              "
            >
              ▶
            </span>
          </div>
        </div>
      </Link>

      {/* ================================= */}
      {/* MOVIE INFO */}
      {/* ================================= */}

      <div className="mt-2 px-0.5">

        <h3
          className="
            text-white
            text-sm
            font-medium
            truncate
          "
          title={title}
        >
          {title || "Untitled"}
        </h3>

        <div className="flex items-center justify-between mt-1">

          <p className="text-gray-500 text-xs">
            {year || "N/A"}
          </p>

          <span className="text-gray-600 text-[10px]">
            {type === "tv"
              ? "Series"
              : "Movie"}
          </span>

        </div>
      </div>

      {/* ================================= */}
      {/* FAVORITE + WATCHLIST */}
      {/* ================================= */}

      <div className="flex gap-1.5 mt-2">

        {/* ❤️ FAVORITE */}

        <button
          type="button"
          onClick={handleFavorite}
          disabled={loadingFavorite}
          title={
            isFavorite
              ? "Remove from Favorites"
              : "Add to Favorites"
          }
          className={`
            flex-1
            h-8
            rounded-md
            text-xs
            border
            transition
            ${
              isFavorite
                ? "bg-red-600/20 border-red-500/40 text-red-400"
                : "bg-zinc-950 border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30"
            }
            ${
              loadingFavorite
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
        >
          {loadingFavorite
            ? "..."
            : isFavorite
            ? "♥"
            : "♡"}
        </button>

        {/* 🔖 WATCHLIST */}

        <button
          type="button"
          onClick={handleWatchlist}
          disabled={loadingWatchlist}
          title={
            isWatchlisted
              ? "Remove from Watchlist"
              : "Add to Watchlist"
          }
          className={`
            flex-1
            h-8
            rounded-md
            text-xs
            border
            transition
            ${
              isWatchlisted
                ? "bg-white/10 border-white/20 text-white"
                : "bg-zinc-950 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
            }
            ${
              loadingWatchlist
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
        >
          {loadingWatchlist
            ? "..."
            : isWatchlisted
            ? "✓"
            : "+"}
        </button>

      </div>
    </div>
  );
}

export default MovieCard;