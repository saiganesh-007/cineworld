import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { authenticatedFetch } from "../lib/api";
import { subscribeToAuthSession } from "../lib/auth";

const SavedItemsContext = createContext(null);

function makeKey(tmdbId, mediaType) {
  return `${mediaType}:${String(tmdbId ?? "").trim()}`;
}

export function SavedItemsProvider({ children }) {
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [savedError, setSavedError] = useState(null);

  const loadedForUserRef = useRef(null);

  const loadSavedItems = useCallback(async () => {
    try {
      const [favoritesData, watchlistData] =
        await Promise.all([
          authenticatedFetch("/api/me/favorites"),
          authenticatedFetch("/api/me/watchlist"),
        ]);

      setFavorites(favoritesData.favorites || []);
      setWatchlist(watchlistData.watchlist || []);
      setSavedError(null);
    } catch (error) {
      if (error.status === 401) {
        setFavorites([]);
        setWatchlist([]);
      } else {
        setSavedError("Unable to load saved items.");
      }
    }
  }, []);

  // ==========================================
  // AUTH SESSION WATCH
  // SIGNED_IN  -> load saved items once per user.
  // SIGNED_OUT -> clear all saved-item state immediately.
  // ==========================================

  useEffect(() => {
    let active = true;

    const unsubscribe = subscribeToAuthSession((nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession ?? null);

      const userId = nextSession?.user?.id ?? null;

      if (!nextSession) {
        loadedForUserRef.current = null;
        setFavorites([]);
        setWatchlist([]);
        setSavedError(null);
        setStatus("ready");
        return;
      }

      if (loadedForUserRef.current === userId) {
        setStatus("ready");
        return;
      }

      loadedForUserRef.current = userId;
      setStatus("loading");

      loadSavedItems().finally(() => {
        if (active) {
          setStatus("ready");
        }
      });
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadSavedItems]);

  // ==========================================
  // MEMBERSHIP LOOKUPS
  // Keyed as `${media_type}:${movie_id}` so a
  // movie and a TV show sharing an ID never collide.
  // ==========================================

  const favoriteKeySet = useMemo(
    () =>
      new Set(
        favorites.map((item) =>
          makeKey(item.movie_id, item.media_type)
        )
      ),
    [favorites]
  );

  const watchlistKeySet = useMemo(
    () =>
      new Set(
        watchlist.map((item) =>
          makeKey(item.movie_id, item.media_type)
        )
      ),
    [watchlist]
  );

  const isFavorite = useCallback(
    (tmdbId, mediaType) =>
      favoriteKeySet.has(makeKey(tmdbId, mediaType)),
    [favoriteKeySet]
  );

  const isWatchlisted = useCallback(
    (tmdbId, mediaType) =>
      watchlistKeySet.has(makeKey(tmdbId, mediaType)),
    [watchlistKeySet]
  );

  // ==========================================
  // FAVORITES
  // ==========================================

  const addFavorite = useCallback(
    async ({
      tmdb_id,
      media_type,
      title,
      poster_path,
    }) => {
      let data = null;

      try {
        data = await authenticatedFetch(
          "/api/me/favorites",
          {
            method: "POST",
            body: JSON.stringify({
              tmdb_id: Number(tmdb_id),
              media_type,
              title,
              poster_path: poster_path ?? null,
            }),
          }
        );
      } catch (error) {
        // 409 => already saved; treat as saved.
        if (error.status !== 409) {
          throw error;
        }
      }

      const item =
        data?.favorite ?? {
          id: null,
          movie_id: Number(tmdb_id),
          media_type,
          title,
          poster_path: poster_path ?? null,
        };

      setFavorites((current) => {
        const key = makeKey(item.movie_id, item.media_type);

        const exists = current.some(
          (fav) =>
            makeKey(fav.movie_id, fav.media_type) === key
        );

        if (exists) {
          return current;
        }

        return [item, ...current];
      });

      return { data, alreadySaved: data === null };
    },
    []
  );

  const removeFavorite = useCallback(
    async (tmdbId, mediaType) => {
      const key = makeKey(tmdbId, mediaType);

      try {
        await authenticatedFetch(
          `/api/me/favorites/${encodeURIComponent(tmdbId)}?media_type=${encodeURIComponent(mediaType)}`,
          { method: "DELETE" }
        );
      } catch (error) {
        // 404 => already removed; treat as removed.
        if (error.status !== 404) {
          throw error;
        }
      }

      setFavorites((current) =>
        current.filter(
          (fav) =>
            makeKey(fav.movie_id, fav.media_type) !== key
        )
      );

      return true;
    },
    []
  );

  // ==========================================
  // WATCHLIST
  // ==========================================

  const addWatchlist = useCallback(
    async ({
      tmdb_id,
      media_type,
      title,
      poster_path,
    }) => {
      let data = null;

      try {
        data = await authenticatedFetch(
          "/api/me/watchlist",
          {
            method: "POST",
            body: JSON.stringify({
              tmdb_id: Number(tmdb_id),
              media_type,
              title,
              poster_path: poster_path ?? null,
            }),
          }
        );
      } catch (error) {
        // 409 => already saved; treat as saved.
        if (error.status !== 409) {
          throw error;
        }
      }

      const item =
        data?.watchlist ?? {
          id: null,
          movie_id: Number(tmdb_id),
          media_type,
          title,
          poster_path: poster_path ?? null,
        };

      setWatchlist((current) => {
        const key = makeKey(item.movie_id, item.media_type);

        const exists = current.some(
          (entry) =>
            makeKey(entry.movie_id, entry.media_type) ===
            key
        );

        if (exists) {
          return current;
        }

        return [item, ...current];
      });

      return { data, alreadySaved: data === null };
    },
    []
  );

  const removeWatchlist = useCallback(
    async (tmdbId, mediaType) => {
      const key = makeKey(tmdbId, mediaType);

      try {
        await authenticatedFetch(
          `/api/me/watchlist/${encodeURIComponent(tmdbId)}?media_type=${encodeURIComponent(mediaType)}`,
          { method: "DELETE" }
        );
      } catch (error) {
        // 404 => already removed; treat as removed.
        if (error.status !== 404) {
          throw error;
        }
      }

      setWatchlist((current) =>
        current.filter(
          (entry) =>
            makeKey(entry.movie_id, entry.media_type) !==
            key
        )
      );

      return true;
    },
    []
  );

  const refreshSavedItems = useCallback(async () => {
    setStatus("loading");
    await loadSavedItems();
    setStatus("ready");
  }, [loadSavedItems]);

  const value = useMemo(
    () => ({
      isAuthenticated: Boolean(session),
      status,
      favorites,
      watchlist,
      savedError,
      isFavorite,
      isWatchlisted,
      addFavorite,
      removeFavorite,
      addWatchlist,
      removeWatchlist,
      refreshSavedItems,
    }),
    [
      session,
      status,
      favorites,
      watchlist,
      savedError,
      isFavorite,
      isWatchlisted,
      addFavorite,
      removeFavorite,
      addWatchlist,
      removeWatchlist,
      refreshSavedItems,
    ]
  );

  return (
    <SavedItemsContext.Provider value={value}>
      {children}
    </SavedItemsContext.Provider>
  );
}

export function useSavedItems() {
  const context = useContext(SavedItemsContext);

  if (!context) {
    throw new Error(
      "useSavedItems must be used within SavedItemsProvider"
    );
  }

  return context;
}

export default SavedItemsProvider;