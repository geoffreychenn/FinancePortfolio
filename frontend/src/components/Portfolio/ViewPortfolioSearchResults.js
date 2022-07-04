import React, { useState } from "react";
import { Button, Container, Card, Alert, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAuth } from "../Account/AuthContext";
import { usePortfolioFetch } from "../../hooks/usePortfolioFetch";
import API from "../../API";
import { useSearchPortfolioFetch } from "../../hooks/useSearchPortfolioFetch";

export default function ViewPortfolioSearchResults() {
  const { currentUser } = useAuth();
  const [error, setError] = useState("");
  const { pfid, searchTerm } = useParams(); // searchTerm is optional
  const portfolio_id = parseInt(pfid, 10);
  const { portfolio, portfolioLoading, portfolioError } = usePortfolioFetch(
    currentUser.uid,
    portfolio_id
  );
  const [init, setInit] = useState(false);
  const [stocklist, setStocklist] = useState([]);
  const [doUpdate, setUpdate] = useState(false);
  // if we want to search we set state as there being an error by default
  const [noResultsError, setNoResultsError] =
    searchTerm === undefined ? useState(false) : useState(true);

  // const {rmstock} = useRef(0);
  // const [stock_id, setSI] = useState(-1);
  // const [quant, setQuant] = useState(-1);
  let searchTermFixed = searchTerm;
  if (searchTerm === undefined) {
    searchTermFixed = "";
  }
  const { results, resultsLoading } = useSearchPortfolioFetch(searchTermFixed);

  // I think this is the easiest place to add a filter
  // how can we tell? I suppose if searchTermFixed !== ""
  function createStocklist() {
    const tickers = portfolio.stocks.map((sks) => [sks.ticker, sks.quantity]);
    // const quantities = (stocks.map((sks) => (sks.quantity)));

    var dict = {};
    for (let i = 0; i < tickers.length; i++) {
      dict[tickers[i][0]] = 0;
    }

    for (let i = 0; i < tickers.length; i++) {
      dict[tickers[i][0]] += tickers[i][1];
    }

    // console.log(portfolio.stocks);
    let keys = Object.keys(dict);
    let arr = new Array(keys.length);
    let j = 0; // seperate counter for array only needed if searching portfolio
    for (let i = 0; i < keys.length; i++) {
      // =====
      // if we want to filter the results
      if (searchTermFixed !== "") {
        // if results is null it means that we didn't really search so we can just do this
        if (results === null || !results.includes(keys[i])) {
          // then we want to not show this stock so skip to next iteration
          continue;
        }
      }
      // =====
      // if results is true then we want to search
      // and since we're here we've found a valid search return
      if (noResultsError === true) {
        setNoResultsError(false);
      }
      // if we change this to arry[j] then we can keep this line
      arr[j] = { ticker: keys[i], quantity: dict[keys[i]], remove: false };
      j++; // increment the return array counter
    }

    return arr;
  }

  function remover(ticker) {
    for (let i = 0; i < stocklist.length; i++) {
      if (ticker === stocklist[i].ticker && stocklist[i].remove !== true) {
        return;
      }
    }

    const stocks = portfolio.stocks.map((sks) => [
      sks.ticker,
      sks.quantity,
      sks.stock_id,
      sks.time,
    ]);

    let arr = [];
    for (let i = 0; i < stocks.length; i++) {
      if (ticker === stocks[i][0]) {
        arr.push(stocks[i]);
      }
    }

    return arr.map((stk, index) => (
      <Form onSubmit={(event) => removeStock(event, stk)} key={index}>
        <Form.Group>
          <Form.Label>
            Remove Stocks from Batch Added At Time: {stk[3]} with {stk[1]}{" "}
            Stocks
          </Form.Label>
          <Form.Control type="text" name="stocks"/>
        </Form.Group>
        <Button variant="primary" type="submit">
          Remove Stocks
        </Button>
      </Form>
    ));
  }

  async function removeStock(event, stk) {
    event.preventDefault();
    let toRemove = event.target[0].value;
    if (parseInt(toRemove, 10) < 1) {
      setError("Invalid Quantity to Remove");
      return;
    }
    if (parseInt(toRemove, 10) > stk[1]) {
      setError("Not enough stocks in this batch");
      return;
    }
    if (toRemove.length < 1) {
      setError("Input cannot be empty");
      return;
    }

    let sure = window.confirm(
      "Are you sure you want to remove " +
        toRemove +
        " " +
        stk[0] +
        " from this portfolio"
    );
    if (!sure) return;

    let quantity = stk[1] - parseInt(toRemove, 10);
    try {
      if (quantity === 0) {
        const success = await API.deleteStocks(stk[2]);

        if (success) {
          setError("");
          window.location.reload();
        }
      } else {
        const success = await API.updateStocks(stk[2], quantity);
        // console.log(success);
        if (success) {
          setError("");
          window.location.reload();
        }
      }
    } catch (e) {
      setError("Stocks could not be removed");
      console.log(e);
    }

    //call remove stock from portfolio

    // console.log(stk);

    // console.log(event.target[0].value);
    //window.location.reload();
  }

  // just a simple function in case error messages get more elaborate
  function rError() {
    return "Sorry, no stocks were found with that search.";
  }

  // we have an issue because results is still loading
  function stockList() {
    // Adding check for if we need to wait for results to load as well
    if (searchTermFixed === "") {
      if (portfolioLoading) return;
      // console.log(stocklist);
      if (init === false) {
        setInit(true);
        let list = createStocklist();
        setStocklist(list);
        // console.log(stocklist);
      }
    } else {
      if (portfolioLoading || resultsLoading) return;
      // console.log(stocklist);
      if (init === false) {
        setInit(true);
        let list2 = createStocklist();
        setStocklist(list2);
        // console.log(stocklist);
      }
    }
    return stocklist.map((stks, index) => (
      <Card key={index}>
        <Card.Body as="span">
          Stock: {stks.ticker} <br/>
          Quantity: {stks.quantity} <br/>
          <Button href={"/add/" + stks.ticker} size="sm">
            +
          </Button>
          <Button
            onClick={() => {
              stks.remove = !stks.remove;
              console.log(stocklist[index]);
              setUpdate(!doUpdate);
            }}
            size="sm"
          >
            -
          </Button>
          {remover(stks.ticker)}
        </Card.Body>
      </Card>
    ));
  }

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>Portfolio: {portfolio.info.name}</Card.Title>
            {error && <Alert variant="danger">{error}</Alert>}
            {noResultsError && !resultsLoading && rError()}
            {searchTerm && (
              <Button href={"/portfolio/view/" + pfid}>Clear search</Button>
            )}
            {stockList()}
            {portfolioError && <Alert variant="danger">{portfolioError}</Alert>}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
