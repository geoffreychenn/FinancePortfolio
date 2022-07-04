import React from "react";
import ResultCard from "./ResultCard";

import { ListGroup } from "react-bootstrap";

/*
    Purpose: make a list of search results in a dynamic pattern 
*/
const ResultList = (props) => {
  const resultsData = props.results;
  const errorMsg = <div>Sorry no results found.</div>;
  // This still doesn't really work
  const rList =
    resultsData !== null && resultsData !== -1 && resultsData !== undefined
      ? resultsData.map((d) => (
          <ResultCard result={d} key="{d.symbol}" region={props.region} />
        ))
      : errorMsg;
  //const errorBool = rList ? true : false;  // was having some trouble with 0 being counted as a bool in the return

  return (
    <div>
      <ListGroup>{rList}</ListGroup>
    </div>
  );
};

export default ResultList;
