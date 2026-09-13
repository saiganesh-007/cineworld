import { useEffect, useState } from "react";

import MovieCard from "../components/MovieCard";

import {
  getPopularTVShows,
  getTopRatedTVShows,
  getTVShowsByLanguage,
  getUpcomingTVShowsByLanguage,
  getImageUrl,
} from "../services/tmdb";

// ==========================================
// WEB SERIES ROW
// ==========================================

function WebSeriesRow({ title, shows }) {
  if (!shows || shows.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="text-white text-2xl font-bold mb-5">
        {title}
      </h2>

      <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
        {shows.map((show) => (
          <div
            key={show.id}
            className="flex-shrink-0"
          >
            <MovieCard
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
          </div>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// WEB SERIES PAGE
// ==========================================

function WebSeries() {
  const [popular, setPopular] = useState([]);

  const [english, setEnglish] = useState([]);
  const [korean, setKorean] = useState([]);
  const [japanese, setJapanese] = useState([]);
  const [tamil, setTamil] = useState([]);
  const [hindi, setHindi] = useState([]);
  const [telugu, setTelugu] = useState([]);

  const [upcomingEnglish, setUpcomingEnglish] = useState([]);
  const [upcomingKorean, setUpcomingKorean] = useState([]);
  const [upcomingJapanese, setUpcomingJapanese] = useState([]);
  const [upcomingTamil, setUpcomingTamil] = useState([]);
  const [upcomingHindi, setUpcomingHindi] = useState([]);
  const [upcomingTelugu, setUpcomingTelugu] = useState([]);

  const [topRated, setTopRated] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // ==========================================
  // FETCH WEB SERIES
  // ==========================================

  useEffect(() => {
    async function fetchWebSeries() {
      try {
        setLoading(true);
        setError(false);

        const [
          popularData,

          englishData,
          koreanData,
          japaneseData,
          tamilData,
          hindiData,
          teluguData,

          upcomingEnglishData,
          upcomingKoreanData,
          upcomingJapaneseData,
          upcomingTamilData,
          upcomingHindiData,
          upcomingTeluguData,

          topRatedData,
        ] = await Promise.all([
          // Popular
          getPopularTVShows(),

          // Current web series
          getTVShowsByLanguage("en"),
          getTVShowsByLanguage("ko"),
          getTVShowsByLanguage("ja"),
          getTVShowsByLanguage("ta"),
          getTVShowsByLanguage("hi"),
          getTVShowsByLanguage("te"),

          // Upcoming web series
          getUpcomingTVShowsByLanguage("en"),
          getUpcomingTVShowsByLanguage("ko"),
          getUpcomingTVShowsByLanguage("ja"),
          getUpcomingTVShowsByLanguage("ta"),
          getUpcomingTVShowsByLanguage("hi"),
          getUpcomingTVShowsByLanguage("te"),

          // Top rated
          getTopRatedTVShows(),
        ]);

        setPopular(popularData || []);

        setEnglish(englishData || []);
        setKorean(koreanData || []);
        setJapanese(japaneseData || []);
        setTamil(tamilData || []);
        setHindi(hindiData || []);
        setTelugu(teluguData || []);

        setUpcomingEnglish(
          upcomingEnglishData || []
        );

        setUpcomingKorean(
          upcomingKoreanData || []
        );

        setUpcomingJapanese(
          upcomingJapaneseData || []
        );

        setUpcomingTamil(
          upcomingTamilData || []
        );

        setUpcomingHindi(
          upcomingHindiData || []
        );

        setUpcomingTelugu(
          upcomingTeluguData || []
        );

        setTopRated(topRatedData || []);

      } catch (error) {
        console.error(
          "Web Series error:",
          error
        );

        setError(true);

      } finally {
        setLoading(false);
      }
    }

    fetchWebSeries();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
      ">
        <div className="text-center">

          <div className="
            w-10
            h-10
            border-2
            border-white/20
            border-t-red-500
            rounded-full
            animate-spin
            mx-auto
            mb-4
          " />

          <p className="text-gray-500">
            Loading web series...
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="
        min-h-screen
        bg-black
        text-white
        flex
        items-center
        justify-center
        px-6
      ">
        <div className="text-center">

          <h2 className="
            text-2xl
            font-bold
            mb-3
          ">
            Something went wrong
          </h2>

          <p className="text-gray-500">
            We couldn't load the web series right now.
            Please refresh the page and try again.
          </p>

        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <main className="
      min-h-screen
      bg-black
      px-6
      py-10
      text-white
    ">

      <div className="
        max-w-7xl
        mx-auto
      ">

        {/* PAGE TITLE */}

        <h1 className="
          text-white
          text-4xl
          font-bold
        ">
          Web Series
        </h1>

        <p className="
          text-gray-500
          mt-2
        ">
          Discover popular, upcoming and highly
          rated web series.
        </p>

        {/* ==========================================
            POPULAR
        ========================================== */}

        <WebSeriesRow
          title="🔥 Popular Web Series"
          shows={popular}
        />

        {/* ==========================================
            ENGLISH
        ========================================== */}

        <WebSeriesRow
          title="🇺🇸 English Web Series"
          shows={english}
        />

        <WebSeriesRow
          title="🎬 Upcoming English Web Series"
          shows={upcomingEnglish}
        />

        {/* ==========================================
            KOREAN
        ========================================== */}

        <WebSeriesRow
          title="🇰🇷 Korean Web Series"
          shows={korean}
        />

        <WebSeriesRow
          title="🎬 Upcoming Korean Web Series"
          shows={upcomingKorean}
        />

        {/* ==========================================
            JAPANESE
        ========================================== */}

        <WebSeriesRow
          title="🇯🇵 Japanese Web Series"
          shows={japanese}
        />

        <WebSeriesRow
          title="🎬 Upcoming Japanese Web Series"
          shows={upcomingJapanese}
        />

        {/* ==========================================
            TAMIL
        ========================================== */}

        <WebSeriesRow
          title="🇮🇳 Tamil Web Series"
          shows={tamil}
        />

        <WebSeriesRow
          title="🎬 Upcoming Tamil Web Series"
          shows={upcomingTamil}
        />

        {/* ==========================================
            HINDI
        ========================================== */}

        <WebSeriesRow
          title="🇮🇳 Hindi Web Series"
          shows={hindi}
        />

        <WebSeriesRow
          title="🎬 Upcoming Hindi Web Series"
          shows={upcomingHindi}
        />

        {/* ==========================================
            TELUGU
        ========================================== */}

        <WebSeriesRow
          title="🇮🇳 Telugu Web Series"
          shows={telugu}
        />

        <WebSeriesRow
          title="🎬 Upcoming Telugu Web Series"
          shows={upcomingTelugu}
        />

        {/* ==========================================
            TOP RATED
        ========================================== */}

        <WebSeriesRow
          title="⭐ Top Rated Web Series"
          shows={topRated}
        />

        {/* BOTTOM SPACE */}

        <div className="h-10" />

      </div>
    </main>
  );
}

export default WebSeries;