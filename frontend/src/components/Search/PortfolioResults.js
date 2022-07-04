import React from "react";
import { useParams } from "react-router";
import { Container, Row } from "react-bootstrap";
import ResultList from "./ResultList";
import { useSearchPortfolioFetch } from "../../hooks/useSearchPortfolioFetch";

/*
 * designed to grab results of search from params and then hopefully filter the portfolio
 * pointed to
 * Params: /:pfID/:searchTerm
 */
function PortfolioResults(){
  const { pfid, searchTerm } = useParams(); // Params= /:pfid/:searchTearm
  const { results, resultsLoading, resultsError } =
    useSearchPortfolioFetch(searchTerm);
  // currently a debug return statement
  // TODO: should investigate the possibility of optional params

  function checkPFID() {
    // if parameters aren't there they will be undefined
    //console.log(typeof pfid);
    //console.log(typeof searchTerm);
    if (pfid === undefined) {
      return "pfid not given";
    }
    return pfid;
  }
  function checkSearchTerm() {
    if (searchTerm === undefined) {
      return "searchTerm not given";
    }
    return searchTerm;
  }
  // we might wannt this to be asynch or useeffect
  // we want it to run once we actually have results passed to us
  // for now lets not deal with it
  function filterSearch() {
    // want a list of results[i].symbol
    const symbolList = [];
    for (var i = 0; i < results.length; i++) {
      symbolList[i] = results[i].symbol;
    }
    // this seems to work, now what?
    return symbolList;
  }

  function displayResultList() {
    if (resultsLoading) return;
    if (results === -1) {
      return "Invalid search";
    }
    return results.toString();
  }
  return (
    <div>
      {filterSearch()}
      pfid = {checkPFID()} || searchTerm = {checkSearchTerm()}
      <Container>
        {resultsError && <Row>Error getting page</Row>}
        {!resultsLoading && displayResultList()}
      </Container>
    </div>
  );
}
