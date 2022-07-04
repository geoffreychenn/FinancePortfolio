// Mainly taken from some tutorial
// NOTE: updates on ever letter inputed. This should be changed to submit once on button
// if used now could go over the alphavantage hitrate
//Note: could use the 'search endpoint' feature for fetching possible options if
import React from "react";

//need to see what the destructuring here really does
const SearchBar = ({ input: keyword, onChange: setKeyword }) => {
  // This is just taken from somewhere, need to update to our visual style
  const BarStyling = {
    width: "20rem",
    background: "#F2F1F9",
    border: "none",
    padding: "0.5rem",
  };

  return (
    <input
      style={BarStyling}
      key="random1"
      value={keyword}
      placeholder={"search..."}
      onChange={(e) => setKeyword(e.target.value)}
    />
  );
};

export default SearchBar;
