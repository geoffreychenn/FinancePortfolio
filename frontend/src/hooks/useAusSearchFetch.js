import { useState, useEffect } from "react";
import API from "../API";

// having this being a function option inside Search Fetch was causing issues.
// Reason unknown
export const useAusSearchFetch = (searchTerm) => {
  const [ausResults, setAusResults] = useState(-1);
  const [ausResultsLoading, setAusResultsLoading] = useState(true); // true --> loading at start
  const [ausResultsError, setAusResultsError] = useState(false); // false --> no error at start

  // maybe we can change this to have a second parameter
  const fetchAusSearchResults = async (searchTerm) => {
    try {
      setAusResultsError("");
      setAusResultsLoading(true);
      const ausResults = await API.fetchAusSearchResults(searchTerm);

      if (ausResults.length === 0) {
        // we want a return that is actually checkable
        setAusResults(null);
      } else {
        setAusResults(ausResults);
      }
    } catch (error) {
      setAusResultsError("Error");
    }
    setAusResultsLoading(false);
  };

  useEffect(() => {
    fetchAusSearchResults(searchTerm);
  }, [searchTerm]);

  return { ausResults, ausResultsLoading, ausResultsError };
};
