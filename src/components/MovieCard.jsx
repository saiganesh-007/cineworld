import { Link } from "react-router-dom";
import { useState } from "react";

import { useSavedItems } from "../context/SavedItemsContext";

// ==========================================
// ICONS
// ==========================================

function PlayIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="m8 5 11 7-11 7V5z" />
    </svg>
  );
}

function StarIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l2.9 6.26 6.6.72-4.9 4.57 1.3 6.6L12 16.9 6.1 20.15l1.3-6.6L2.5 8.98l6.6-.72L12 2z" />
    </svg>
  );
}

function HeartIcon({ filled = false, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function BookmarkIcon({ filled = false, className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}

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

  const {
    status,
    isFavorite,
    isWatchlisted,
    addFavorite,
    removeFavorite,
    addWatchlist,
    removeWatchlist,
  } = useSavedItems();

  const ready = status === "ready";

  const favorited = ready && isFavorite(id, type);
  const watchlisted = ready && isWatchlisted(id, type);

  const [loadingFavorite, setLoadingFavorite] = useState(false);
  const [loadingWatchlist, setLoadingWatchlist] = useState(false);

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

    try {
      setLoadingFavorite(true);

      if (favorited) {
        await removeFavorite(id, type);
      } else {
        await addFavorite({
          tmdb_id: Number(id),
          media_type: type,
          title,
          poster_path: getPosterPath(),
        });
      }
    } catch (error) {
      if (error.status === 401) {
        alert("Please login first.");
      } else {
        console.error(
          "Favorite error:",
          error
        );

        alert(error.message);
      }
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

    try {
      setLoadingWatchlist(true);

      if (watchlisted) {
        await removeWatchlist(id, type);
      } else {
        await addWatchlist({
          tmdb_id: Number(id),
          media_type: type,
          title,
          poster_path: getPosterPath(),
        });
      }
    } catch (error) {
      if (error.status === 401) {
        alert("Please login first.");
      } else {
        console.error(
          "Watchlist error:",
          error
        );

        alert(error.message);
      }
    } finally {
      setLoadingWatchlist(false);
    }
  }

  const isDisabled = !ready;

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
        className="
          block
          group
          rounded-lg
          focus-visible:outline-2
          focus-visible:outline-offset-2
          focus-visible:outline-red-500
        "
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
            shadow-black/40
            transition-all
            duration-300
            ease-out
            group-hover:-translate-y-1
            group-hover:border-red-500/20
            group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.65),0_0_22px_rgba(239,68,68,0.14)]
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
                duration-300
                ease-out
                group-hover:scale-[1.03]
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

          {/* HOVER OVERLAY GRADIENT */}

          <div
            className="
              absolute
              inset-0
              bg-gradient-to-t
              from-black/70
              via-black/10
              to-transparent
              opacity-0
              group-hover:opacity-100
              group-focus-visible:opacity-100
              transition-opacity
              duration-300
              pointer-events-none
            "
            aria-hidden="true"
          />

          {/* PLAY / DETAILS (center, hover/focus) */}

          <div
            className="
              absolute
              inset-0
              flex
              items-center
              justify-center
              opacity-0
              group-hover:opacity-100
              group-focus-visible:opacity-100
              transition-opacity
              duration-300
              pointer-events-none
            "
            aria-hidden="true"
          >
            <span
              className="
                flex
                items-center
                justify-center
                w-9
                h-9
                rounded-full
                bg-black/60
                backdrop-blur-sm
                border
                border-white/15
                text-white
                shadow-xl
                shadow-black/50
                transition-colors
                duration-300
                group-hover:bg-red-600/90
              "
            >
              <PlayIcon className="w-3.5 h-3.5 ml-0.5" />
            </span>
          </div>

          {/* RATING BADGE */}

          <div
            className="
              absolute
              top-2
              right-2
              flex
              items-center
              gap-1
              bg-black/50
              backdrop-blur-sm
              border
              border-white/10
              px-1.5
              py-0.5
              rounded-full
              text-yellow-300/90
              text-[10px]
              font-semibold
            "
          >
            <StarIcon className="w-3 h-3" />

            <span>{rating || "N/A"}</span>
          </div>
        </div>

        {/* ================================= */}
        {/* MOVIE INFO */}
        {/* ================================= */}

        <div className="mt-2 px-0.5">

          <h3
            className="
              text-white
              text-sm
              font-semibold
              leading-snug
              truncate
            "
            title={title}
          >
            {title || "Untitled"}
          </h3>

          <p className="text-gray-500 text-[11px] mt-0.5 truncate">
            {type === "tv" ? "TV" : "Movie"}

            {" • "}

            {year || "N/A"}
          </p>
        </div>
      </Link>

      {/* ================================= */}
      {/* FAVORITE + WATCHLIST */}
      {/* ================================= */}

      <div className="flex gap-1.5 mt-2">

        {/* ❤️ FAVORITE */}

        <button
          type="button"
          onClick={handleFavorite}
          disabled={isDisabled || loadingFavorite}
          title={
            favorited
              ? "Remove from Favorites"
              : "Add to Favorites"
          }
          aria-label={
            favorited
              ? "Remove from Favorites"
              : "Add to Favorites"
          }
          className={`
            flex-1
            h-8
            rounded-md
            flex
            items-center
            justify-center
            border
            transition-all
            duration-200
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-red-500
            ${
              favorited
                ? "bg-red-600/15 border-red-500/40 text-red-500 hover:bg-red-600/25"
                : "bg-zinc-900/60 border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-zinc-800"
            }
            ${
              isDisabled || loadingFavorite
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
          `}
        >
          {loadingFavorite ? (
            <span
              className="
                w-3.5
                h-3.5
                border-2
                border-white/20
                border-t-transparent
                rounded-full
                animate-spin
              "
              style={{ opacity: 0.6 }}
            />
          ) : (
            <HeartIcon
              filled={favorited}
              className="w-3.5 h-3.5"
            />
          )}
        </button>

        {/* 🔖 WATCHLIST */}

        <button
          type="button"
          onClick={handleWatchlist}
          disabled={isDisabled || loadingWatchlist}
          title={
            watchlisted
              ? "Remove from Watchlist"
              : "Add to Watchlist"
          }
          aria-label={
            watchlisted
              ? "Remove from Watchlist"
              : "Add to Watchlist"
          }
          className={`
            flex-1
            h-8
            rounded-md
            flex
            items-center
            justify-center
            border
            transition-all
            duration-200
            focus-visible:outline-2
            focus-visible:outline-offset-2
            focus-visible:outline-red-500
            ${
              watchlisted
                ? "bg-red-600/15 border-red-500/40 text-red-500 hover:bg-red-600/25"
                : "bg-zinc-900/60 border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-zinc-800"
            }
            ${
              isDisabled || loadingWatchlist
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
          `}
        >
          {loadingWatchlist ? (
            <span
              className="
                w-3.5
                h-3.5
                border-2
                border-white/20
                border-t-transparent
                rounded-full
                animate-spin
              "
              style={{ opacity: 0.6 }}
            />
          ) : (
            <BookmarkIcon
              filled={watchlisted}
              className="w-3.5 h-3.5"
            />
          )}
        </button>

      </div>
    </div>
  );
}

export default MovieCard;