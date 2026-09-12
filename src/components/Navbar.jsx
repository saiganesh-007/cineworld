import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  searchMulti,
  getImageUrl,
} from "../services/tmdb";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchRef = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // ==============================
  // LOGGED-IN USER
  // ==============================

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("cineworld_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Update user when localStorage changes
  useEffect(() => {
    function updateUser() {
      try {
        const savedUser = localStorage.getItem("cineworld_user");
        setUser(savedUser ? JSON.parse(savedUser) : null);
      } catch {
        setUser(null);
      }
    }

    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  // ==============================
  // NAVIGATION LINKS
  // ==============================

  const links = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "Web Series", path: "/webseries" },
    { name: "Anime", path: "/anime" },
    { name: "Favorites", path: "/favorites" },
    { name: "Watchlist", path: "/watchlist" },
  ];

  // ==============================
  // SEARCH
  // ==============================

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const data = await searchMulti(trimmedQuery);

        setResults(data.slice(0, 6));
      } catch (error) {
        console.error("Navbar search error:", error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // ==============================
  // CLOSE SEARCH OUTSIDE
  // ==============================

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // ==============================
  // OPEN SEARCH RESULT
  // ==============================

  function openResult(item) {
    if (item.media_type === "movie") {
      navigate(`/movie/${item.id}`);
    } else {
      navigate(`/tv/${item.id}`);
    }

    setQuery("");
    setResults([]);
    setSearchOpen(false);
  }

  // ==============================
  // FULL SEARCH PAGE
  // ==============================

  function handleSearchSubmit(event) {
    event.preventDefault();

    if (!query.trim()) return;

    navigate(
      `/search?query=${encodeURIComponent(
        query.trim()
      )}`
    );

    setSearchOpen(false);
  }

  // ==============================
  // LOGOUT
  // ==============================

  function handleLogout() {
    localStorage.removeItem("cineworld_user");

    setUser(null);

    navigate("/");
  }

  return (
    <nav
      className="
        bg-black
        border-b
        border-white/10
        sticky
        top-0
        z-50
      "
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-6
        "
      >
        <div
          className="
            min-h-16
            flex
            items-center
            justify-between
            gap-6
          "
        >

          {/* ==============================
              LOGO
          ============================== */}

          <Link
            to="/"
            className="
              text-2xl
              font-bold
              text-white
              flex-shrink-0
            "
          >
            CINE
            <span className="text-red-500">
              World
            </span>
          </Link>

          {/* ==============================
              DESKTOP NAVIGATION
          ============================== */}

          <div
            className="
              hidden
              md:flex
              items-center
              gap-6
            "
          >
            {links.map((link) => {
              const active =
                location.pathname === link.path;

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`
                    text-sm
                    font-medium
                    transition
                    ${
                      active
                        ? "text-white"
                        : "text-gray-400 hover:text-white"
                    }
                  `}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* ==============================
              RIGHT SIDE
          ============================== */}

          <div className="flex items-center gap-3">

            {/* ==========================
                SEARCH
            ========================== */}

            <div
              ref={searchRef}
              className="
                relative
                flex
                items-center
              "
            >
              {!searchOpen && (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="
                    text-gray-400
                    hover:text-white
                    text-xl
                    transition
                    p-2
                  "
                  title="Search"
                >
                  🔍
                </button>
              )}

              {searchOpen && (
                <form
                  onSubmit={handleSearchSubmit}
                  className="
                    relative
                    w-64
                    md:w-80
                  "
                >
                  <input
                    autoFocus
                    type="text"
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Search movies, series, anime..."
                    className="
                      w-full
                      bg-zinc-900
                      border
                      border-white/10
                      focus:border-red-500
                      outline-none
                      rounded-lg
                      px-4
                      py-2.5
                      pr-10
                      text-white
                      text-sm
                      placeholder-gray-600
                    "
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setSearchOpen(false);
                    }}
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                      hover:text-white
                    "
                  >
                    ✕
                  </button>

                  {/* SEARCH RESULTS */}

                  {query.trim() && (
                    <div
                      className="
                        absolute
                        top-14
                        right-0
                        w-full
                        bg-zinc-950
                        border
                        border-white/10
                        rounded-xl
                        shadow-2xl
                        overflow-hidden
                      "
                    >
                      {searching && (
                        <div
                          className="
                            px-4
                            py-5
                            text-gray-500
                            text-sm
                          "
                        >
                          Searching...
                        </div>
                      )}

                      {!searching &&
                        results.length === 0 && (
                          <div
                            className="
                              px-4
                              py-5
                              text-gray-500
                              text-sm
                            "
                          >
                            No results found.
                          </div>
                        )}

                      {!searching &&
                        results.length > 0 && (
                          <div>
                            {results.map((item) => {
                              const title =
                                item.media_type === "movie"
                                  ? item.title
                                  : item.name;

                              const date =
                                item.media_type === "movie"
                                  ? item.release_date
                                  : item.first_air_date;

                              return (
                                <button
                                  key={`${item.media_type}-${item.id}`}
                                  type="button"
                                  onClick={() =>
                                    openResult(item)
                                  }
                                  className="
                                    w-full
                                    flex
                                    items-center
                                    gap-3
                                    p-3
                                    text-left
                                    hover:bg-white/5
                                    transition
                                  "
                                >
                                  {item.poster_path ? (
                                    <img
                                      src={getImageUrl(
                                        item.poster_path
                                      )}
                                      alt={title}
                                      className="
                                        w-10
                                        h-14
                                        object-cover
                                        rounded
                                      "
                                    />
                                  ) : (
                                    <div
                                      className="
                                        w-10
                                        h-14
                                        rounded
                                        bg-zinc-900
                                        flex
                                        items-center
                                        justify-center
                                        text-xs
                                        text-gray-600
                                      "
                                    >
                                      N/A
                                    </div>
                                  )}

                                  <div
                                    className="
                                      min-w-0
                                      flex-1
                                    "
                                  >
                                    <p
                                      className="
                                        text-white
                                        text-sm
                                        font-medium
                                        truncate
                                      "
                                    >
                                      {title || "Untitled"}
                                    </p>

                                    <p
                                      className="
                                        text-gray-500
                                        text-xs
                                        mt-1
                                      "
                                    >
                                      {item.media_type ===
                                      "movie"
                                        ? "Movie"
                                        : "TV / Anime"}

                                      {" • "}

                                      {date
                                        ? date.slice(0, 4)
                                        : "N/A"}
                                    </p>
                                  </div>

                                  {item.vote_average > 0 && (
                                    <span
                                      className="
                                        text-yellow-400
                                        text-xs
                                        flex-shrink-0
                                      "
                                    >
                                      ⭐{" "}
                                      {item.vote_average.toFixed(
                                        1
                                      )}
                                    </span>
                                  )}
                                </button>
                              );
                            })}

                            <button
                              type="submit"
                              className="
                                w-full
                                border-t
                                border-white/10
                                px-4
                                py-3
                                text-sm
                                text-red-400
                                hover:text-red-300
                                hover:bg-white/5
                                transition
                              "
                            >
                              View all results →
                            </button>
                          </div>
                        )}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* ==========================
                USER / LOGIN
            ========================== */}

            {user ? (
              <div className="flex items-center gap-3">

                <div className="hidden sm:block text-right">
                  <p className="text-white text-sm font-medium">
                    {user.username}
                  </p>

                  <p className="text-gray-500 text-xs">
                    Account
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="
                    border
                    border-white/10
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    text-gray-300
                    hover:text-white
                    hover:bg-white/10
                    transition
                  "
                >
                  Logout
                </button>

              </div>
            ) : (
              <Link
                to="/login"
                className="
                  border
                  border-white/10
                  px-4
                  py-2
                  rounded-lg
                  text-sm
                  text-gray-300
                  hover:text-white
                  hover:bg-white/10
                  transition
                "
              >
                Login
              </Link>
            )}

          </div>
        </div>

        {/* ==============================
            MOBILE NAVIGATION
        ============================== */}

        <div
          className="
            md:hidden
            flex
            gap-5
            overflow-x-auto
            pb-3
          "
        >
          {links.map((link) => {
            const active =
              location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                className={`
                  whitespace-nowrap
                  text-sm
                  font-medium
                  ${
                    active
                      ? "text-white"
                      : "text-gray-500"
                  }
                `}
              >
                {link.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;