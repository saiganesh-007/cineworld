import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import { searchMulti } from "../services/tmdb";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(
    searchParams.get("query") || ""
  );

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlQuery = searchParams.get("query") || "";

    setQuery(urlQuery);

    if (!urlQuery.trim()) {
      setResults([]);
      return;
    }

    loadSearchResults(urlQuery);
  }, [searchParams]);

  async function loadSearchResults(searchQuery) {
    try {
      setLoading(true);

      const data = await searchMulti(searchQuery);

      setResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) return;

    setSearchParams({
      query: trimmedQuery,
    });
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold mb-8">
          🔍 Search CINEWorld
        </h1>

        {/* SEARCH BAR */}

        <form
          onSubmit={handleSubmit}
          className="flex gap-3 mb-10"
        >
          <input
            type="text"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search movies, TV shows, anime..."
            className="
              flex-1
              bg-zinc-900
              border
              border-white/10
              focus:border-red-500
              outline-none
              rounded-lg
              px-4
              py-3
              text-white
            "
          />

          <button
            type="submit"
            className="
              bg-red-600
              hover:bg-red-700
              px-6
              py-3
              rounded-lg
              font-semibold
            "
          >
            Search
          </button>
        </form>

        {/* LOADING */}

        {loading && (
          <div className="text-center py-20">
            <p className="text-gray-400">
              Searching...
            </p>
          </div>
        )}

        {/* NO RESULTS */}

        {!loading &&
          query.trim() &&
          results.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">
                No results found.
              </p>

              <p className="text-gray-600 mt-2">
                Try another movie, series, or anime.
              </p>
            </div>
          )}

        {/* RESULTS */}

        {!loading && results.length > 0 && (
          <>
            <h2 className="text-2xl font-bold mb-6">
              Search Results
            </h2>

            <div
              className="
                grid
                grid-cols-2
                sm:grid-cols-3
                md:grid-cols-4
                lg:grid-cols-5
                gap-6
              "
            >
              {results.map((item) => (
                <MovieCard
                  key={`${item.media_type}-${item.id}`}
                  id={item.id}
                  type={item.media_type}
                  title={
                    item.title ||
                    item.name
                  }
                  year={
                    item.release_date?.slice(0, 4) ||
                    item.first_air_date?.slice(0, 4)
                  }
                  rating={
                    item.vote_average
                      ? item.vote_average.toFixed(1)
                      : "N/A"
                  }
                  image={
                    item.poster_path
                      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                      : null
                  }
                />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default Search;