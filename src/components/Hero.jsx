import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative min-h-[420px] flex items-center overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-black to-red-950/20" />

      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-600/10 rounded-full blur-[120px]" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 py-16">

        {/* Small heading */}
        <p className="text-red-500 uppercase tracking-[0.2em] text-sm font-semibold mb-4">
          Welcome to CINEWorld
        </p>

        {/* Main heading */}
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight max-w-3xl">
          Everything you
          <br />
          <span className="text-red-500">
            want to watch.
          </span>
        </h1>

        {/* Description */}
        <p className="text-gray-400 text-base max-w-2xl mt-5 leading-7">
          Explore movies, web series and anime.
          Discover what's trending, save your favourites,
          and build your personal watchlist.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mt-7">

          {/* Explore Movies */}
          <Link
            to="/movies"
            className="
              bg-red-600
              text-white
              px-5
              py-2.5
              rounded-lg
              font-semibold
              text-sm
              hover:bg-red-700
              transition
            "
          >
            Explore Movies
          </Link>

          {/* Web Series */}
          <Link
            to="/webseries"
            className="
              border
              border-white/20
              text-white
              px-5
              py-2.5
              rounded-lg
              font-semibold
              text-sm
              hover:bg-white/10
              transition
            "
          >
            Web Series
          </Link>

          {/* Anime */}
          <Link
            to="/anime"
            className="
              border
              border-white/20
              text-white
              px-5
              py-2.5
              rounded-lg
              font-semibold
              text-sm
              hover:bg-white/10
              transition
            "
          >
            Anime
          </Link>

        </div>

      </div>
    </section>
  );
}

export default Hero;