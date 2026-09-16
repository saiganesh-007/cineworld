import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  searchMulti,
  getImageUrl,
} from "../services/tmdb";

import { isSupabaseConfigured } from "../lib/supabaseClient";
import {
  getSession,
  onAuthStateChange,
  signOut,
} from "../lib/auth";

// ==========================================
// ICONS
// ==========================================

function SearchIcon({ className = "" }) {
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
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function ClearIcon({ className = "" }) {
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
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// ==========================================
// SUGGESTION TYPE LABEL
// "Movie" / "Anime" / "Drama" / "TV" only
// when the result tells us enough to be sure.
// ==========================================

function getTypeLabel(item) {
  if (item.media_type === "movie") {
    return "Movie";
  }

  if (
    item.original_language === "ja" &&
    item.genre_ids?.includes(16)
  ) {
    return "Anime";
  }

  if (item.original_language === "ko") {
    return "Drama";
  }

  return "TV";
}

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const inputRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileClosing, setMobileClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [active, setActive] = useState(-1);

  // ==============================
  // LOGGED-IN USER (Supabase)
  // ==============================

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 8);

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    onScroll();

    return () =>
      window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSession() {
      if (!isSupabaseConfigured()) {
        setAuthChecked(true);
        return;
      }

      const { session } = await getSession();

      if (active) {
        setUser(session?.user ?? null);
        setAuthChecked(true);
      }
    }

    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      if (active) {
        setUser(session?.user ?? null);
      }
    });

    loadSession();

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // ==============================
  // NAVIGATION LINKS
  // ==============================

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Movies", path: "/movies" },
    { name: "Web Series", path: "/webseries" },
    { name: "Anime", path: "/anime" },
  ];

  const sideLinks = [
    { name: "Favorites", path: "/favorites" },
    { name: "Watchlist", path: "/watchlist" },
  ];

  const mobileLinks = [...navLinks, ...sideLinks];

  // ==============================
  // SEARCH
  // ==============================

  useEffect(() => {
    const trimmedQuery = query.trim();

    setActive(-1);

    if (trimmedQuery.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);

        const data = await searchMulti(trimmedQuery);

        setResults(data.slice(0, 5));
      } catch (error) {
        console.error("Navbar search error:", error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // ==============================
  // AUTOFOCUS SEARCH INPUTS
  // ==============================

  useEffect(() => {
    if (mobileSearchOpen) {
      inputRef.current?.focus();
    }
  }, [mobileSearchOpen]);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  // ==============================
  // CLOSE SEARCH OUTSIDE
  // ==============================

  useEffect(() => {
    function handleClickOutside(event) {
      const insideSearch =
        desktopSearchRef.current?.contains(event.target) ||
        mobileSearchRef.current?.contains(event.target);

      if (
        !insideSearch &&
        searchOpen
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
  // KEYBOARD NAVIGATION
  // ==============================

  function handleKeyDown(event) {
    if (event.key === "Escape") {
      setResults([]);
      setSearching(false);
      setActive(-1);
      inputRef.current?.blur();
      return;
    }

    if (results.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) =>
        index >= results.length - 1
          ? -1
          : index + 1
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) =>
        index < 0
          ? results.length - 1
          : index - 1
      );
    } else if (event.key === "Enter" && active >= 0) {
      event.preventDefault();
      openResult(results[active]);
    }
  }

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
    setActive(-1);
    setSearchOpen(false);
    closeMobileSearch();
  }

  // ==============================
  // FULL SEARCH PAGE
  // ==============================

  function handleSearchSubmit(event) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) return;

    navigate(
      `/search?query=${encodeURIComponent(trimmed)}`
    );

    setQuery("");
    setResults([]);
    setActive(-1);
    setSearchOpen(false);
    closeMobileSearch();
  }

  // ==============================
  // SEARCH PRESS (tablet vs mobile)
  // Tablets get an inline expander, phones expand
  // the full-width search row below the navbar.
  // ==============================

  function handleSearchPress() {
    const isTablet = window.matchMedia(
      "(min-width: 768px)"
    ).matches;

    if (isTablet) {
      setMobileSearchOpen(false);
      setMobileClosing(false);
      setSearchOpen(true);
    } else {
      setSearchOpen(false);
      setMobileClosing(false);
      setMobileSearchOpen(true);
    }
  }

  // ==============================
  // CLOSE MOBILE SEARCH (animated)
  // ==============================

  function closeMobileSearch() {
    if (!mobileSearchOpen) return;

    setMobileClosing(true);

    window.setTimeout(() => {
      setMobileSearchOpen(false);
      setMobileClosing(false);
    }, 200);
  }

  // ==============================
  // SEARCH BOX (shared layout)
  // ==============================

  function renderSearchBox() {
    return (
      <form
        onSubmit={handleSearchSubmit}
        className="relative w-full"
      >
        {/* SEARCH ICON */}
        <SearchIcon
          className="
            absolute
            left-3
            top-1/2
            -translate-y-1/2
            w-4
            h-4
            pointer-events-none
            text-gray-500
            peer-focus:text-red-500
            transition-colors
            duration-200
            z-10
          "
        />

        <input
          ref={(node) => {
            inputRef.current = node;
          }}
          type="text"
          value={query}
          autoComplete="off"
          spellCheck="false"
          onChange={(event) =>
            setQuery(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Search movies, anime, dramas, series..."
          className="
            peer
            w-full
            bg-zinc-900/80
            border
            border-white/10
            rounded-lg
            pl-9
            pr-9
            py-2.5
            text-white
            text-sm
            placeholder-gray-500
            outline-none
            transition-all
            duration-200
            hover:bg-zinc-900
            focus:border-red-500/60
            focus:bg-zinc-900
            focus:ring-1
            focus:ring-red-500/50
            focus:shadow-[0_0_0_3px_rgba(239,68,68,0.14),0_0_16px_rgba(239,68,68,0.2)]
          "
        />

        {/* CLEAR BUTTON */}
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="
              absolute
              right-2.5
              top-1/2
              -translate-y-1/2
              text-gray-500
              hover:text-white
              transition
              p-0.5
            "
          >
            <ClearIcon className="w-4 h-4" />
          </button>
        )}

        {/* LIVE SUGGESTIONS */}
        {query.trim().length >= 2 && (
          <div
            className="
              absolute
              top-[calc(100%+8px)]
              left-0
              right-0
              bg-zinc-950/95
              backdrop-blur
              border
              border-white/10
              rounded-xl
              shadow-2xl
              shadow-black/60
              overflow-hidden
              z-50
            "
          >
            {searching && (
              <div className="px-4 py-5 text-gray-500 text-sm">
                Searching...
              </div>
            )}

            {!searching && results.length === 0 && (
              <div className="px-4 py-5 text-gray-500 text-sm">
                No results found.
              </div>
            )}

            {!searching && results.length > 0 && (
              <div>
                {results.map((item, index) => {
                  const title =
                    item.media_type === "movie"
                      ? item.title
                      : item.name;

                  const date =
                    item.media_type === "movie"
                      ? item.release_date
                      : item.first_air_date;

                  const typeLabel = getTypeLabel(item);

                  return (
                    <button
                      key={`${item.media_type}-${item.id}`}
                      type="button"
                      onClick={() => openResult(item)}
                      onMouseEnter={() =>
                        setActive(index)
                      }
                      className={`
                        w-full
                        flex
                        items-center
                        gap-3
                        p-3
                        text-left
                        transition-colors
                        duration-150
                        ${
                          active === index
                            ? "bg-red-500/10"
                            : "hover:bg-white/5"
                        }
                      `}
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
                            flex-shrink-0
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
                            flex-shrink-0
                          "
                        >
                          N/A
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
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
                          {typeLabel}

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
                          {item.vote_average.toFixed(1)}
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
    );
  }

  // ==============================
  // LOGOUT
  // ==============================

  async function handleLogout() {
    await signOut();

    setUser(null);

    navigate("/");
  }

  return (
    <nav
      className={`
        ${scrolled ? "bg-black/90 backdrop-blur-md" : "bg-black"}
        border-b
        border-white/10
        sticky
        top-0
        z-50
        transition-colors
        duration-300
      `}
    >
      <div className="container-cw">
        <div
          className="
            min-h-16
            flex
            items-center
            justify-between
            gap-4
            lg:gap-6
          "
        >

          {/* ==============================
              LEFT: LOGO + PRIMARY NAV
          ============================== */}

          <div className="flex items-center gap-5 xl:gap-8">

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

            <div
              className="
                hidden
                md:flex
                items-center
                gap-5
                xl:gap-7
              "
            >
              {navLinks.map((link) => {
                const activeNav =
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
                        activeNav
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
          </div>

          {/* ==============================
              MIDDLE: SEARCH (desktop)
              Always visible — the main,
              obvious way to search.
          ============================== */}

          <div
            ref={desktopSearchRef}
            className="
              hidden
              lg:block
              flex-1
              max-w-[300px]
              mx-auto
            "
          >
            {renderSearchBox()}
          </div>

          {/* ==============================
              RIGHT
          ============================== */}

          <div className="flex items-center justify-end gap-4 xl:gap-6">

            {/* ==========================
                SEARCH (tablet expander)
            ========================== */}

            <div
              ref={mobileSearchRef}
              className="
                lg:hidden
                relative
                flex
                items-center
              "
            >
              {!searchOpen && (
                <button
                  onClick={handleSearchPress}
                  className="
                    flex
                    items-center
                    gap-2
                    text-gray-400
                    hover:text-white
                    transition
                    px-2
                    py-2
                  "
                  title="Search"
                >
                  <SearchIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    Search
                  </span>
                </button>
              )}

              {searchOpen && (
                <div className="relative w-64">
                  {renderSearchBox()}
                </div>
              )}
            </div>

            {/* ==========================
                FAVORITES + WATCHLIST
            ========================== */}

            <div
              className="
                hidden
                md:flex
                items-center
                gap-5
              "
            >
              {sideLinks.map((link) => {
                const activeNav =
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
                        activeNav
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

            {/* ==========================
                USER / LOGIN
            ========================== */}

            {!authChecked ? null : user ? (
              <div className="flex items-center gap-3">

                <div className="hidden sm:block text-right">
                  <p className="text-white text-sm font-medium">
                    {user.user_metadata?.username || user.email}
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
            MOBILE SEARCH (expandable)
        ============================== */}

        {mobileSearchOpen && (
          <div
            className={`
              lg:hidden
              ${
                mobileClosing
                  ? "animate-search-out"
                  : "animate-search-in"
              }
            `}
          >
            <div className="px-1 pb-4">
              {renderSearchBox()}
            </div>
          </div>
        )}

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
          {mobileLinks.map((link) => {
            const activeNav =
              location.pathname === link.path;

            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobileSearch}
                className={`
                  whitespace-nowrap
                  text-sm
                  font-medium
                  ${
                    activeNav
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