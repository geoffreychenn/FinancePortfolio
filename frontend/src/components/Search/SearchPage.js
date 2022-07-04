// A tester page for the search bar
// could be userful but SearchBar is usable on its own
import { Grid } from "@mui/material";
import React, { useState, useRef } from "react";
import { Form, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";

// expects props to be the search type in Search.js
// 9/11/21: will now search aus and general stocks through alpha vantage and YH Finance
const SearchPage = (props) => {
  const searchRef = useRef();
  const history = useHistory();
  const [searchQuery, setSearchQuery] = useState("");

  // function to handle redirecting to SearchResults page
  const searchRoute = () => {
    let path = "search/" + searchRef.current.value;
    history.push("/" + path);
  };

  const handleSearchInput = async (event) => {
    event.preventDefault();
    try {
      if (props.searchType === "stock") {
        // to prevent a weird interaction where the result cards get multiple timezone fields
        if (searchRef.current.value !== searchQuery) {
          setSearchQuery(searchRef.current.value);
          searchRoute();
        }
      }
    } catch (e) {
      // might need to setError like in addPortfolio
      console.log(e);
    }
  };

  return (
    <div>
      <Grid container spacing={0.5} direction="row" justifyContent="center">
        <Grid item className="m-auto">
          Search stock:
        </Grid>
        <Grid item>
          <Form>
            <Form.Control type="pname" ref={searchRef}/>
          </Form>
        </Grid>
        <Grid item>
          <Button variant="primary" type="submit" onClick={handleSearchInput}>
            Search
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SearchPage;
