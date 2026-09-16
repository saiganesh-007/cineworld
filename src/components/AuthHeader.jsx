import { Link } from "react-router-dom";

function AuthHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 pointer-events-none">
      <div
        className="
          flex
          items-center
          justify-between
          px-5
          sm:px-6
          py-5
        "
      >
        {/* LOGO */}
        <Link
          to="/"
          className="
            pointer-events-auto
            text-2xl
            font-bold
            text-white
          "
        >
          CINE
          <span className="text-red-500">
            World
          </span>
        </Link>

        {/* HOME */}
        <Link
          to="/"
          className="
            pointer-events-auto
            text-sm
            text-gray-300
            hover:text-white
            border
            border-white/10
            px-4
            py-2
            rounded-lg
            transition
          "
        >
          Home
        </Link>
      </div>
    </header>
  );
}

export default AuthHeader;