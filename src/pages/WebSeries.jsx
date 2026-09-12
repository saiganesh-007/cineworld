import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";

import {
  getPopularTVShows,
  getTopRatedTVShows,
  getTVShowsByLanguage,
  getImageUrl,
} from "../services/tmdb";


function WebSeriesRow({ title, shows }) {
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


function WebSeries() {

  const [popular, setPopular] = useState([]);
  const [english, setEnglish] = useState([]);
  const [korean, setKorean] = useState([]);
  const [japanese, setJapanese] = useState([]);
  const [topRated, setTopRated] = useState([]);

  const [loading, setLoading] = useState(true);


  useEffect(() => {

    async function fetchWebSeries() {

      try {

        const [
          popularData,
          englishData,
          koreanData,
          japaneseData,
          topRatedData,
        ] = await Promise.all([

          getPopularTVShows(),
          getTVShowsByLanguage("en"),
          getTVShowsByLanguage("ko"),
          getTVShowsByLanguage("ja"),
          getTopRatedTVShows(),

        ]);

        setPopular(popularData);
        setEnglish(englishData);
        setKorean(koreanData);
        setJapanese(japaneseData);
        setTopRated(topRatedData);

      } catch (error) {

        console.error("Web Series error:", error);

      } finally {

        setLoading(false);

      }

    }

    fetchWebSeries();

  }, []);


  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading web series...
      </div>
    );

  }


  return (

    <div className="min-h-screen bg-black px-6 py-10">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-white text-4xl font-bold">
          Web Series
        </h1>

        <p className="text-gray-500 mt-2">
          Discover popular and highly rated web series.
        </p>


        <WebSeriesRow
          title="Popular Web Series"
          shows={popular}
        />


        <WebSeriesRow
          title="English Web Series"
          shows={english}
        />


        <WebSeriesRow
          title="Korean Web Series"
          shows={korean}
        />


        <WebSeriesRow
          title="Japanese Web Series"
          shows={japanese}
        />


        <WebSeriesRow
          title="Top Rated Web Series"
          shows={topRated}
        />

      </div>

    </div>

  );
}


export default WebSeries;