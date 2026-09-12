import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";

import {
  getActionAnime,
  getPopularAnime,
  getTopRatedAnime,
  getImageUrl,
} from "../services/tmdb";


function AnimeRow({ title, shows }) {
  return (
    <section className="mt-10">

      <h2 className="text-white text-2xl font-bold mb-5">
        {title}
      </h2>

      <div className="flex gap-5 overflow-x-auto pb-4">

        {shows.map((show) => (
          <MovieCard
            key={show.id}
            id={show.id}
            type="tv"
            title={show.name}
            year={
              show.first_air_date
                ? show.first_air_date.slice(0, 4)
                : "N/A"
            }
            rating={
              show.vote_average
                ? show.vote_average.toFixed(1)
                : "N/A"
            }
            image={getImageUrl(show.poster_path)}
          />
        ))}

      </div>

    </section>
  );
}


function Anime() {

  const [popular, setPopular] = useState([]);
  const [action, setAction] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function fetchAnime() {

      try {

        const [
          popularData,
          actionData,
          topRatedData,
        ] = await Promise.all([

          getPopularAnime(),
          getActionAnime(),
          getTopRatedAnime(),

        ]);

        setPopular(popularData);
        setAction(actionData);
        setTopRated(topRatedData);

      } catch (error) {

        console.error("Anime page error:", error);

      } finally {

        setLoading(false);

      }

    }

    fetchAnime();

  }, []);


  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading anime...
      </div>
    );

  }


  return (

    <div className="min-h-screen bg-black px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <h1 className="text-white text-4xl font-bold">
          Anime
        </h1>

        <p className="text-gray-500 mt-2">
          Discover popular and highly rated anime.
        </p>


        {/* Popular Anime */}

        <AnimeRow
          title="Popular Anime"
          shows={popular}
        />


        {/* Action Anime */}

        <AnimeRow
          title="Action Anime"
          shows={action}
        />


        {/* Top Rated */}

        <AnimeRow
          title="Top Rated Anime"
          shows={topRated}
        />

      </div>

    </div>

  );
}


export default Anime;