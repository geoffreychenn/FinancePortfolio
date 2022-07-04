import { useState, useEffect } from "react";
import API from "../API";

export const useSearchFetch = (searchTerm) => {
  const [results, setResults] = useState(-1);
  const [resultsLoading, setResultsLoading] = useState(true); // true --> loading at start
  const [resultsError, setResultsError] = useState(false); // false --> no error at start

  const fetchSearchResults = async (searchTerm) => {
    try {
      setResultsError("");
      setResultsLoading(true);
      const results = await API.fetchSearchResults(searchTerm);
      if (results.length === 0) {
        // we want a return that is actually checkable
        setResults(null);
      } else {
        setResults(results);
      }
    } catch (error) {
      setResultsError("Error");
    }
    setResultsLoading(false);
  };

  useEffect(() => {
    fetchSearchResults(searchTerm);
  }, [searchTerm]);

  return { results, resultsLoading, resultsError };
};
