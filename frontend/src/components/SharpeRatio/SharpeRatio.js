import React, { useState, useRef, useEffect, useContext } from "react";
import {
  Form,
  Button,
  Container,
  Card,
  Alert,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import API from "../../API";
import { Grid, TableCell, TableRow, TableContainer } from "@mui/material";
import { AppContext } from "../../Context";

export default function SharpeRatio() {
  const searchRef = useRef();

  const [errors, setErrors] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [radioValue, setRadioValue] = useState("0");
  const {
    sharpeList,
    setSharpeList,
    percents,
    setPercents,
    tickers,
    setTickers,
  } = useContext(AppContext);
  const [SearchResults, setSearchResults] = useState([""]);
  const [SearchQuery, setSearchQuery] = useState("");
  const [search, setSearch] = useState("");
  const [emptyResult, setEmptyResult] = useState(true);
  const [prices, setPrices] = useState([]);
  const [dTickers, setDTickers] = useState([]);

  const axios = require("axios").default;
  axios.defaults.baseURL = "http://localhost:42069/searchQuery";

  const options = [
    { name: "Maximise Sharpe Ratio", value: "0" },
    { name: "Minimise Risk", value: "1" },
  ];

  useEffect(() => {
    searchSharpe();
  }, [SearchQuery, sharpeList]);

  async function maxSharpe() {
    const success = await API.maxSharpeRatio(tickers);
    if (success && success["success"] === true) {
      const data = await API.stockPrice(tickers);
      setPrices(data["prices"]);
      setPercents(success["percents"]);
      setErrors(success["errors"]);
      setDTickers(tickers);
    }
  }

  async function minRisk() {
    const success = await API.minRisk(tickers);

    if (success && success["success"] === true) {
      const data = await API.stockPrice(tickers);
      setPrices(data["prices"]);
      setPercents(success["percents"]);
      setErrors(success["errors"]);
      setDTickers(tickers);
    }
  }

  function update(ticker) {
    if (tickers.includes(ticker)) {
      setTickers(tickers.filter((elem) => elem !== ticker));
    } else {
      setTickers((tickers) => [...tickers, ticker]);
    }
  }
  function update2(ticker) {
    if (tickers.includes(ticker)) {
      setTickers(tickers.filter((elem) => elem !== ticker));
    } else {
      setTickers((tickers) => [...tickers]);
    }
  }
  function showPercents() {
    // console.log(percents)
    if (!percents) {
      return;
    }
    if (percents.length > 0) {
      return dTickers.map((ticker, index) => (
        <div>
          <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
            <TableCell>{ticker}:</TableCell>
            <TableCell>
              {(percents[index] * 100).toFixed(2)} +/-{" "}
              {(errors[index] * 100).toFixed(2)}%
            </TableCell>
            <TableCell>${prices[index]}</TableCell>
          </TableRow>
        </div>
      ));
    }
  }

  // axios api calls because dont want to change URL
  async function searchSharpe() {
    setErrorMessage("");
    setEmptyResult(true);
    if (!SearchQuery) return;
    axios
      .post("", {
        searchTerm: SearchQuery,
      })
      .then((response) => {
        const newArray = [];
        response.data.results.map((item) => newArray.push(item.symbol));
        if (!newArray.length > 0) {
          setEmptyResult(false);
        }
        if (JSON.stringify(SearchResults) !== JSON.stringify(newArray)) {
          setSearchResults(newArray);
        }
      })
      .catch((error) => {});
  }

  function updateSearch() {
    setSearch(searchRef.current.value);
  }

  function updateQuery() {
    setSearchQuery(search);
    setSearch("");
  }

  function addToSharpeList(item) {
    setErrorMessage("");
    if (sharpeList.indexOf(item) === -1) {
      setSharpeList([...sharpeList, item]);
    } else {
      return setErrorMessage("item already exists in list");
    }
  }

  function removeFromSharpeList(item) {
    setErrorMessage("");
    const newArray = sharpeList;
    const index = newArray.indexOf(item);
    if (index !== -1) {
      newArray.splice(index, 1);
      //update(item);
      update2(item);
      // console.log(newArray);
      setSharpeList(newArray);
    }
  }

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Grid
              container
              spacing={0.5}
              direction="row"
              justifyContent="center"
            >
              <Grid item>
                <div className="sharpe-search-label">Add tickers:</div>
              </Grid>
              <Grid item>
                <Form>
                  <Form.Control
                    type="pname"
                    ref={searchRef}
                    onChange={updateSearch}
                  />
                </Form>
              </Grid>
              <Grid item>
                <Button variant="primary" type="submit" onClick={updateQuery}>
                  Search
                </Button>
              </Grid>
            </Grid>
            {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

            <Form>
              <TableContainer sx={{ maxHeight: "18vh" }}>
                {/* emptyResult might be a little backwards and not make sense but it works */}
                {emptyResult ? (
                  SearchResults.map((symbol) => (
                    <TableRow sx={{ "& > *": { borderBottom: "none" } }}>
                      <TableCell>
                        {symbol && (
                          <Button
                            variant="primary"
                            onClick={() => addToSharpeList(symbol)}
                          >
                            {" "}
                            Add to list{" "}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>{symbol}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <div>No Results to display</div>
                )}
              </TableContainer>
            </Form>
          </Card.Body>

          <Card.Body>
            <Form>
              <TableContainer sx={{ maxHeight: "18vh" }}>
                {sharpeList.map((item) => (
                  <div>
                    <TableRow sx={{ "& > *": { borderBottom: "none" } }}>
                      <TableCell style={{ width: "12rem" }}>
                        {item && (
                          <div className={"sharpe-items"}>
                            <Form.Check
                              type="checkbox"
                              id="1"
                              label={item}
                              onChange={() => update(item)}
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="primary"
                          onClick={() => removeFromSharpeList(item)}
                          className={"sharpe-item-remove"}
                        >
                          {" "}
                          Remove{" "}
                        </Button>
                      </TableCell>
                    </TableRow>
                  </div>
                ))}
              </TableContainer>
            </Form>
            <ButtonGroup>
              {options.map((radio, idx) => (
                <ToggleButton
                  key={idx}
                  id={`radio-${idx}`}
                  type="radio"
                  variant="outline-primary"
                  name="radio"
                  value={radio.value}
                  checked={radioValue === radio.value}
                  onChange={(e) => setRadioValue(e.currentTarget.value)}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
            <div>
              {radioValue === "0" ? (
                <Button onClick={maxSharpe} className="mt-2">
                  Maximise
                </Button>
              ) : (
                <Button onClick={minRisk} className="mt-2">
                  Minimise
                </Button>
              )}
            </div>
            <TableContainer sx={{ maxHeight: "18vh" }} className="mt-4">
              {showPercents()}
            </TableContainer>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <h4>How to Use</h4>
            <div>
              This Calculator is a way to input stocks and get a recommended
              allocation based on the Sharpe Ratio. The calculator has two modes
              'Maximise' and 'Minimise'. For maximisation it returns an
              allocation set based on a maximisation of the Sharpe Ratio, that
              is the expected performance. For minimisation it returns an
              allocation to the user based on minimising the associated risks of
              the stocks.
            </div>
            <div>
              To use the calculator first search for stocks in the search bar.
              This adds it to your temporary list of stocks, you can then add it
              to the calculation by hitting the checkmark. You then select which
              mode and you will be give an allocation percentage for each stock,
              as if you were constructing a portfolio.
            </div>
            <h4>What is Sharpe?</h4>
            <div>
              The Sharpe Ratio is a mathematical formula that is used to
              determine the performance of a portfolio, by comparing the returns
              of the portfolio adjusted to the risk.
            </div>

            <h4>Disclaimer</h4>
            <div>
              The information given is sourced purely from a mathematical
              definition over past data, it is in no way financial advise and
              there is no guarantee the allocations presented are the correct
              choice in stock purchasing. This is purely tool to help give
              information on constructing your own portfolio.
            </div>
            <div>
              The Sharpe Calculator does not work for Australian (ASX) Stocks,
              due to data limitations
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
