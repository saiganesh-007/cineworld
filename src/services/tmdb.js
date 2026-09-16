// ==========================================
// TMDB CONFIG
// ==========================================

const API_KEY =
  import.meta.env.VITE_TMDB_API_KEY ||
  "c50d1c37427cf55096e70f64594a7896";

const BASE_URL = "https://api.themoviedb.org/3";


// ==========================================
// REQUEST
// ==========================================

async function request(endpoint) {
  const separator = endpoint.includes("?") ? "&" : "?";

  const response = await fetch(
    `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error(
      "TMDB ERROR:",
      response.status,
      errorText
    );

    throw new Error(
      `TMDB request failed: ${response.status}`
    );
  }

  return response.json();
}


// ==========================================
// IMAGE URL
// ==========================================

export function getImageUrl(path) {
  return path
    ? `https://image.tmdb.org/t/p/w500${path}`
    : null;
}


// ==========================================
// MOVIES
// ==========================================

// Trending Movies

export async function getTrendingMovies() {
  const data = await request(
    "/trending/movie/week"
  );

  return data.results || [];
}


// Popular Movies

export async function getPopularMovies(page = 1) {
  const data = await request(
    `/movie/popular?page=${page}`
  );

  return data.results || [];
}


// Movies By Language

export async function getMoviesByLanguage(
  language,
  page = 1
) {
  const data = await request(
    `/discover/movie?with_original_language=${language}&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// Top Rated Movies

export async function getTopRatedMovies(page = 1) {
  const data = await request(
    `/movie/top_rated?page=${page}`
  );

  return data.results || [];
}


// Upcoming Movies

export async function getUpcomingMovies(page = 1) {
  const data = await request(
    `/movie/upcoming?page=${page}`
  );

  return data.results || [];
}


// Upcoming Movies By Language

export async function getUpcomingMoviesByLanguage(
  language,
  page = 1
) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const data = await request(
    `/discover/movie?with_original_language=${language}&primary_release_date.gte=${today}&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// Movie Details

export async function getMovieDetails(id) {
  return await request(
    `/movie/${id}`
  );
}


// Movie Credits

export async function getMovieCredits(id) {
  const data = await request(
    `/movie/${id}/credits`
  );

  const director =
    data.crew?.find(
      (person) => person.job === "Director"
    ) || null;

  return {
    director,
    cast: data.cast || [],
  };
}


// Movie Videos / Trailers

export async function getMovieVideos(id) {
  const data = await request(
    `/movie/${id}/videos`
  );

  return data.results || [];
}


// ==========================================
// WEB SERIES / TV
// ==========================================

// Popular TV Shows

export async function getPopularTVShows(page = 1) {
  const data = await request(
    `/tv/popular?page=${page}`
  );

  return data.results || [];
}


// TV Shows By Language

export async function getTVShowsByLanguage(
  language,
  page = 1
) {
  const data = await request(
    `/discover/tv?with_original_language=${language}&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// Top Rated TV Shows

export async function getTopRatedTVShows(
  page = 1
) {
  const data = await request(
    `/tv/top_rated?page=${page}`
  );

  return data.results || [];
}


// Upcoming TV Shows

export async function getUpcomingTVShows(
  page = 1
) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const data = await request(
    `/discover/tv?first_air_date.gte=${today}&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// Upcoming TV Shows By Language

export async function getUpcomingTVShowsByLanguage(
  language,
  page = 1
) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const data = await request(
    `/discover/tv?with_original_language=${language}&first_air_date.gte=${today}&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// TV Details

export async function getTVDetails(id) {
  return await request(
    `/tv/${id}`
  );
}


// TV Credits

export async function getTVCredits(id) {
  const data = await request(
    `/tv/${id}/credits`
  );

  const creators =
    data.crew?.filter(
      (person) =>
        person.job === "Director" ||
        person.job === "Creator"
    ) || [];

  return {
    creators,
    cast: data.cast || [],
  };
}


// TV Videos / Trailers

export async function getTVVideos(id) {
  const data = await request(
    `/tv/${id}/videos`
  );

  return data.results || [];
}


// ==========================================
// ANIME
// ==========================================

// Trending Anime
// Japanese + Animation only

export async function getTrendingAnime() {
  const data = await request(
    "/trending/tv/week"
  );

  return (data.results || []).filter(
    (show) =>
      show.original_language === "ja" &&
      show.genre_ids?.includes(16)
  );
}


// Popular Anime
// Japanese + Animation only

export async function getPopularAnime(
  page = 1
) {
  const data = await request(
    `/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// Upcoming Anime
// Japanese + Animation only

export async function getUpcomingAnime(
  page = 1
) {
  const today = new Date()
    .toISOString()
    .split("T")[0];

  const data = await request(
    `/discover/tv?with_genres=16&with_original_language=ja&first_air_date.gte=${today}&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// Top Rated Anime
// Japanese + Animation only

export async function getTopRatedAnime(
  page = 1
) {
  const data = await request(
    `/discover/tv?with_genres=16&with_original_language=ja&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`
  );

  return data.results || [];
}


// Action Anime
// Japanese + Animation + Action

export async function getActionAnime(
  page = 1
) {
  const data = await request(
    `/discover/tv?with_genres=16,10759&with_original_language=ja&sort_by=popularity.desc&page=${page}`
  );

  return data.results || [];
}


// ==========================================
// SEARCH
// ==========================================

// Search Movies + TV

export async function searchMoviesAndTV(
  query
) {
  if (!query || !query.trim()) {
    return [];
  }

  const data = await request(
    `/search/multi?query=${encodeURIComponent(
      query
    )}`
  );

  return (data.results || []).filter(
    (item) =>
      item.media_type === "movie" ||
      item.media_type === "tv"
  );
}


// Same search function
// Kept for compatibility

export async function searchMulti(query) {
  return searchMoviesAndTV(query);
}