import React, { useRef } from "react";
import { Form, Button } from "react-bootstrap";
import { useHistory } from "react-router";
import { Grid } from "@mui/material";
/*
 * Slight alteration of the regular search to be used for searching portfolios
 * So far this is needed since search portfolio needs to work for company names as well
 * expects being given the portfolio id in the props
 * expects: props.pfid
 */
export default function SearchPortfolio(props) {
  const searchRef = useRef("");
  const history = useHistory();

  const handleSearchInput = async (event) => {
    event.preventDefault();
    try {
      // needs the path to be searchPortfolio/:pfid/:searchterm
      // maybe we can get the relative positioning to work for us
      history.push(
        "/portfolioSearch/" + props.pfid + "/" + searchRef.current.value
      );
    } catch (e) {}
  };

  return (
    <div>
      <Grid container spacing={1} direction="row" justifyContent="center">
        <Grid item style={{ display: "inline-block" }}>
          <p className="m-auto">Filter Stocks:</p>
        </Grid>
        <Form>
          <Grid item style={{ display: "inline-block" }}>
            <Form.Control type="pname" ref={searchRef}/>
          </Grid>
          <Grid item style={{ display: "inline-block" }}>
            <Button variant="primary" type="submit" onClick={handleSearchInput}>
              Search portfolio
            </Button>
          </Grid>
        </Form>
      </Grid>
    </div>
  );
}
