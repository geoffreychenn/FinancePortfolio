import { useState, useEffect } from "react";
import API from "../API";

export const useWatchlistsFetch = (userid) => {
  const [watchlists, setWatchlists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWatchlists = async (userid) => {
    try {
      setError("");
      setLoading(true);
      const wls = await API.fetchWatchlists(userid);
      if (wls.success) setWatchlists(wls.watchlists);
      else setError("Could not obtain watchlists");
    } catch (error) {
      setError("Could not obtain watchlists");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWatchlists(userid);
  }, [userid]);

  return { watchlists, loading, error };
};
