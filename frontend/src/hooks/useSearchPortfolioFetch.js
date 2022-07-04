/*
 *   designed to search for potential companies by ticker or name
 *   and return the only the ticker symbols associated with the results
 *
 */
import { useState, useEffect } from "react";
import API from "../API";

// a lot of stuff is recycled from searchFetch but I didn't want to layer to many asych functions
export const useSearchPortfolioFetch = (searchTerm) => {
  const [results, setResults] = useState(-1);
  const [resultsLoading, setResultsLoading] = useState(true);
  const [resultsError, setResultsError] = useState(false);

  const fetchSearchPortfolioResults = async (searchTerm) => {
    try {
      setResultsError("");
      setResultsLoading(true);
      const results = await API.fetchSearchResults(searchTerm);
      if (results.length === 0) {
        setResults(null);
      } else {
        // this what we want to change
        // filter down to only what we want
        const symbolList = [];
        for (var i = 0; i < results.length; i++) {
          symbolList[i] = results[i].symbol;
        }
        setResults(symbolList);
      }
    } catch (e) {
      setResultsError("Error");
    }
    setResultsLoading(false);
  };

  useEffect(() => {
    fetchSearchPortfolioResults(searchTerm);
  }, [searchTerm]);

  return { results, resultsLoading, resultsError };
};
