const API_KEY = "c50d1c37427cf55096e70f64594a7896";

const BASE_URL = "https://api.themoviedb.org/3";


// ==========================================
// REQUEST
// ==========================================

async function request(endpoint) {
  const response = await fetch(
    `${BASE_URL}${endpoint}${
      endpoint.includes("?") ? "&" : "?"
    }api_key=${API_KEY}`
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
// TRENDING MOVIES
// ==========================================

export async function getTrendingMovies() {
  const data = await request("/trending/movie/week");

  return data.results;
}


// ==========================================
// POPULAR MOVIES
// ==========================================

export async function getPopularMovies(page = 1) {
  const data = await request(
    `/movie/popular?page=${page}`
  );

  return data.results;
}


// ==========================================
// MOVIES BY LANGUAGE
// ==========================================

export async function getMoviesByLanguage(
  language,
  page = 1
) {
  const data = await request(
    `/discover/movie?with_original_language=${language}&sort_by=popularity.desc&page=${page}`
  );

  return data.results;
}


// ==========================================
// TOP RATED MOVIES
// ==========================================

export async function getTopRatedMovies(page = 1) {
  const data = await request(
    `/movie/top_rated?page=${page}`
  );

  return data.results;
}
// ==========================================
// MOVIE CREDITS
// ==========================================

export async function getMovieCredits(id) {
  const data = await request(`/movie/${id}/credits`);

  const director =
    data.crew?.find(
      (person) => person.job === "Director"
    ) || null;

  const cast = data.cast || [];

  return {
    director,
    cast,
  };
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
// SEARCH MOVIES + TV
// ==========================================

export async function searchMoviesAndTV(query) {
  const data = await request(
    `/search/multi?query=${encodeURIComponent(query)}`
  );

  return data.results.filter(
    (item) =>
      item.media_type === "movie" ||
      item.media_type === "tv"
  );
}


// ==========================================
// MOVIE DETAILS
// ==========================================

export async function getMovieDetails(id) {
  return await request(`/movie/${id}`);
}


// ==========================================
// TV / WEB SERIES DETAILS
// ==========================================

export async function getTVDetails(id) {
  return await request(`/tv/${id}`);
}


// ==========================================
// POPULAR TV / WEB SERIES
// ==========================================

export async function getPopularTVShows(page = 1) {
  const data = await request(
    `/tv/popular?page=${page}`
  );

  return data.results;
}


// ==========================================
// TV SHOWS BY LANGUAGE
// ==========================================

export async function getTVShowsByLanguage(
  language,
  page = 1
) {
  const data = await request(
    `/discover/tv?with_original_language=${language}&sort_by=popularity.desc&page=${page}`
  );

  return data.results;
}


// ==========================================
// TOP RATED TV SHOWS
// ==========================================

export async function getTopRatedTVShows(page = 1) {
  const data = await request(
    `/tv/top_rated?page=${page}`
  );

  return data.results;
}
// ==========================================
// ANIME
// ==========================================

export async function getActionAnime(page = 1) {
  const data = await request(
    `/discover/tv?with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=${page}`
  );

  return data.results;
}

export async function getPopularAnime(page = 1) {
  const data = await request(
    `/discover/tv?with_genres=16&sort_by=popularity.desc&page=${page}`
  );

  return data.results;
}

export async function getTopRatedAnime(page = 1) {
  const data = await request(
    `/discover/tv?with_genres=16&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`
  );

  return data.results;
}
// ==========================================
// MOVIE TRAILER
// ==========================================

export async function getMovieVideos(id) {
  const data = await request(`/movie/${id}/videos`);

  return data.results || [];
}
// ==========================================
// TV / ANIME CREDITS
// ==========================================

export async function getTVCredits(id) {
  const data = await request(`/tv/${id}/credits`);

  const creators = data.crew?.filter(
    (person) =>
      person.job === "Director" ||
      person.job === "Creator"
  ) || [];

  return {
    creators,
    cast: data.cast || [],
  };
}


// ==========================================
// TV / ANIME VIDEOS
// ==========================================

export async function getTVVideos(id) {
  const data = await request(`/tv/${id}/videos`);

  return data.results || [];
}
export async function searchMulti(query) {
  if (!query || !query.trim()) {
    return [];
  }

  const data = await request(
    `/search/multi?query=${encodeURIComponent(query)}`
  );

  return (data.results || []).filter(
    (item) =>
      item.media_type === "movie" ||
      item.media_type === "tv"
  );
}