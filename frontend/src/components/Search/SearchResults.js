/*
 * Show the results from the search
 * Assumes that the search text is passed through the parameters
 */
import React from "react";
import { Container, Spinner } from "react-bootstrap";
import { useSearchFetch } from "../../hooks/useSearchFetch";
import { useAusSearchFetch } from "../../hooks/useAusSearchFetch";
import { useParams } from "react-router-dom";
import ResultList from "./ResultList";

export default function SearchResults() {
  const { searchTerm } = useParams();
  const { results, resultsLoading, resultsError } = useSearchFetch(searchTerm);
  // search the australian market at the same time
  const { ausResults, ausResultsLoading, ausResultsError } =
    useAusSearchFetch(searchTerm);

  function ausDisplayResults() {
    if (ausResultsLoading) return;
    if (ausResults === -1) {
      return "Invalid search";
    }
    return ausResults;
  }

  function displayResults() {
    if (resultsLoading) return;
    if (results === -1) {
      return "Invalid search";
    }
    return results;
  }

  return (
    <div className="canvas">
      <Container>
        <div class="row">
          <div class="column">
            <div
              style={{ fontWeight: "bolder", fontSize: "20pt" }}
              className="text-center"
            >
              General Results
            </div>
            {resultsError && <row>error getting page</row>}
            {resultsLoading ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <ResultList results={displayResults()} />
            )}
          </div>
          <div class="column">
            <div
              style={{ fontWeight: "bolder", fontSize: "20pt" }}
              className="text-center"
            >
              Australian Results
            </div>
            {ausResultsError && <row>error getting page</row>}
            {ausResultsLoading ? (
              <div className="text-center">
                <Spinner animation="border" />
              </div>
            ) : (
              <ResultList results={ausDisplayResults()} region="aus" />
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
