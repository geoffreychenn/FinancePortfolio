import { useState, useEffect } from "react";
import API from "../API";

const defaultWatchlist = {
  info: {
    name: "",
    user_id: "",
    watchlist_id: -1,
  },
  stocks: [],
};

export const useWatchlistFetch = (userid, wlid) => {
  const [watchlist, setWatchlist] = useState(defaultWatchlist);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [watchlistError, setWatchlistError] = useState("");

  const fetchWatchlist = async (userid, wlid) => {
    try {
      setWatchlistError("");
      setWatchlistLoading(true);
      const wl = await API.fetchWatchlist(userid, wlid);
      if (wl.success) setWatchlist(wl.watchlist);
      else setWatchlistError("Could not obtain watchlist");
    } catch (error) {
      setWatchlistError("Could not obtain watchlist");
    }
    setWatchlistLoading(false);
  };

  useEffect(() => {
    fetchWatchlist(userid, wlid);
  }, [userid, wlid]);

  return { watchlist, watchlistLoading, watchlistError };
};
