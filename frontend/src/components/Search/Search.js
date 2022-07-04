import React, { useState } from "react";
import { Container, Card } from "react-bootstrap";
import SearchPage from "./SearchPage";
//import { useHistory } from "react-router-dom";
//import { useAuth } from "../Account/AuthContext";

/*
    Current Top level page for search functionality 
*/
// assumes inputValue as a property
export default function Search(props) {
  const [searchType, setSearchType] = useState("stock");
  // change what search type to use
  const updateSearchType = (searchType) => {
    setSearchType(searchType);
  };

  let errorMsg = "Sorry, no results found.";
  //Change this when the search is implemented
  const results = props.inputValue ? "search values here" : errorMsg;

  const handleRadio = (e) => {
    updateSearchType(e);
  };
  // This output is just for debugging for now
  // searching news is not a needed feature yet
  //<Button id='search_stocks' >Stocks</Button>
  //<Button id='search_news' >News</Button>
  /*

        Need to figure out what is wrong with theses we had them working at some point 
                <div>
                    <input type="radio" name="stock_radio" onChange={() => handleRadio('stock')}>Stocks</input>
                    <input type="radio" name="news_radio" onChange={() => handleRadio('news')}>News</input>
                </div>
        */
  return (
    <div>
      <Container>
        Search type: Needs fixing
        <Card>
          <Card.Body>{results}</Card.Body>
        </Card>
      </Container>
      <Container>
        <SearchPage searchType={searchType} />
      </Container>
    </div>
  );
}
