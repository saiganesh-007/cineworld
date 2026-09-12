const API_URL = "http://127.0.0.1:5001/api";

// ==========================================
// ❤️ FAVORITES
// ==========================================

export async function getFavorites(userId) {
  const response = await fetch(
    `${API_URL}/favorites/${userId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get favorites");
  }

  return data.favorites || [];
}

export async function addToFavorites(userId, item) {
  const response = await fetch(
    `${API_URL}/favorites`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        movie_id: item.id,
        media_type: item.type,
        title: item.title,
        poster_path: item.image || null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add favorite");
  }

  return data;
}

export async function removeFromFavorites(favoriteId) {
  const response = await fetch(
    `${API_URL}/favorites/${favoriteId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove favorite");
  }

  return data;
}


// ==========================================
// 🔖 WATCHLIST
// ==========================================

export async function getWatchlist(userId) {
  const response = await fetch(
    `${API_URL}/watchlist/${userId}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to get watchlist");
  }

  return data.watchlist || [];
}

export async function addToWatchlist(userId, item) {
  const response = await fetch(
    `${API_URL}/watchlist`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        movie_id: item.id,
        media_type: item.type,
        title: item.title,
        poster_path: item.image || null,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to add watchlist");
  }

  return data;
}

export async function removeFromWatchlist(itemId) {
  const response = await fetch(
    `${API_URL}/watchlist/${itemId}`,
    {
      method: "DELETE",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove watchlist");
  }

  return data;
}