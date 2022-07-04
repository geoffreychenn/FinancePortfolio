import { useState, useEffect } from "react";
import API from "../API";

export const usePortfoliosFetch = (userid) => {
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPortfolios = async (userid) => {
    try {
      setError("");
      setLoading(true);
      const pfs = await API.fetchPortfolios(userid);
      if (pfs.success) setPortfolios(pfs.portfolios);
      else setError("Could not obtain portfolios");
    } catch (error) {
      setError("Could not obtain portfolios");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPortfolios(userid);
  }, [userid]);

  return { portfolios, loading, error };
};
