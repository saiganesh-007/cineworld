import { Link } from "react-router-dom";

// ==========================================
// NAVIGATION
// ==========================================

const FOOTER_LINKS = [
  { name: "Home", path: "/" },
  { name: "Movies", path: "/movies" },
  { name: "Web Series", path: "/webseries" },
  { name: "Anime", path: "/anime" },
  { name: "Favorites", path: "/favorites" },
  { name: "Watchlist", path: "/watchlist" },
];

// ==========================================
// FOOTER
// ==========================================

function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-zinc-950">
      <div className="container-cw">
        <div className="py-10">

          {/* BRAND + TAGLINE + LINKS */}

          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

            <div>
              <Link
                to="/"
                className="text-2xl font-bold text-white"
              >
                CINE
                <span className="text-red-500">
                  World
                </span>
              </Link>

              <p className="mt-3 max-w-sm text-sm text-gray-500">
                Movies, anime, dramas and web series — all in one place.
              </p>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-x-12 gap-y-2.5 sm:grid-cols-3"
            >
              {FOOTER_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="
                    text-sm
                    text-gray-400
                    hover:text-red-400
                    transition-colors
                    duration-200
                  "
                >
                  {link.name}
                </Link>
              ))}
            </nav>

          </div>

          {/* BOTTOM LINE */}

          <div className="mt-10 flex flex-col gap-2 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-600">
              © 2026 CINEWorld. All rights reserved.
            </p>

            <p className="text-xs text-gray-600">
              Powered by TMDB data
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}

export default Footer;