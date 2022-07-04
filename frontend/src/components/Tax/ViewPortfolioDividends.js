import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Card,
  Alert,
  Spinner,
  InputGroup,
  FormControl,
  ListGroup,
  Table,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAuth } from "../Account/AuthContext";
import { usePortfolioFetch } from "../../hooks/usePortfolioFetch";
import API from "../../API";
import { frankingCreditsCalculator } from "./DividendsCalculator";

export default function ViewPortfolioDividends() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { pfid } = useParams();
  const [portfolio_id, setPortfolioId] = useState(parseInt(pfid, 10));
  const { portfolio, portfolioLoading, portfolioError } = usePortfolioFetch(
    currentUser.uid,
    portfolio_id
  );
  const [dividends, setDividends] = useState({});
  const [total, setTotal] = useState({
    totalDividends: 0,
    totalFrankingCredits: 0,
    totalGrossDividends: 0,
  });

  // Possibly not needed?
  // May prevent bugs when switching between portfolios?
  useEffect(() => {
    setPortfolioId(parseInt(pfid, 10));
  }, [pfid]);

  const fetchDividends = async (portfolio) => {
    try {
      setLoading(true);
      const pf = await API.fetchDividends(
        currentUser.uid,
        portfolio.info.portfolio_id
      );
      const dvds = {};
      const ttl = {
        totalDividends: 0,
        totalFrankingCredits: 0,
        totalGrossDividends: 0,
      };
      // Loop through each portfolios stocks
      pf.stocks.forEach((stk) => {
        const calc = frankingCreditsCalculator(
          stk.dividend_price,
          stk.franked,
          stk.quantity
        );
        ttl.totalDividends += calc.totalDividends;
        ttl.totalFrankingCredits += calc.totalFrankingCredits;
        ttl.totalGrossDividends += calc.totalGrossDividends;
        dvds[stk.stock_id] = {
          error: false,
          data: { ...stk, ...calc },
          currentPrice: "",
          fetchPrice: stk.dividend_price,
        };
      });
      setDividends(dvds);
      setTotal(ttl);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
      setError("Could not fetch dividends");
    }
  };

  useEffect(() => {
    fetchDividends(portfolio);
  }, [portfolio]);

  const handleChange = async (e) => {
    e.preventDefault();
    const name = e.target.name;
    const valid = e.target.validity.valid;
    const val = e.target.value;
    if (valid && val !== "") {
      setDividends({
        ...dividends,
        [name]: { ...dividends[name], currentPrice: val, error: false },
      });
    } else {
      // setPrice(0);
      setDividends({
        ...dividends,
        [name]: { ...dividends[name], currentPrice: "", error: true },
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const name = e.target.name;
    const valid = e.target.validity.valid;
    const val = dividends[name].currentPrice;
    if (valid && val !== "") {
      // Update backend
      try {
        if (Number(val) === dividends[name].fetchPrice) return;
        const success = await API.updateDividends(
          currentUser.uid,
          portfolio_id,
          name,
          val
        );
        if (success) fetchDividends(portfolio);
      } catch (e) {
        console.log(e);
      }
    } else {
      // Clear input
      setDividends({
        ...dividends,
        [name]: { ...dividends[name], currentPrice: "", error: true },
      });
    }
  };

  function stockList() {
    if (
      portfolioLoading ||
      loading ||
      Object.keys(dividends).length !== portfolio.stocks.length
    ) {
      return (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      );
    }

    if (portfolio.stocks.length === 0) {
      return <div className="text-center">No stocks found</div>;
    }

    return (
      <React.Fragment>
        {Object.keys(dividends).map((stk, index) => (
          <ListGroup.Item
            className="d-flex justify-content-between align-items-center"
            key={index}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: "18pt" }}>
                {dividends[stk].data.ticker}
              </div>
              <Table bordered striped className="text-center">
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Region</th>
                    <th>Date Acquired</th>
                    <th>Franking Percentage</th>
                    <th>Current Dividend Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{dividends[stk].data.quantity}</td>
                    <td>{dividends[stk].data.region}</td>
                    <td>{dividends[stk].data.time}</td>
                    <td>{dividends[stk].data.franked}%</td>
                    <td>
                      {dividends[stk].fetchPrice.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                      })}
                    </td>
                  </tr>
                </tbody>
              </Table>
              <InputGroup className="mb-3">
                <InputGroup.Text>Dividend Price (per share)</InputGroup.Text>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  name={dividends[stk].data.stock_id}
                  pattern="[+-]?([0-9]*[.])?[0-9]+"
                  isInvalid={dividends[stk].error}
                  onChange={handleChange}
                />
                <Button
                  name={dividends[stk].data.stock_id}
                  variant="outline-primary"
                  id="button-addon2"
                  onClick={handleUpdate}
                >
                  Update
                </Button>
              </InputGroup>
            </div>
            <Card>
              <Card.Body>
                <div>
                  Franking credit:{" "}
                  {dividends[stk].data.frankingCredits.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
                <div>
                  Gross dividend:{" "}
                  {dividends[stk].data.grossDividend.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
                <hr />
                <div>
                  Total dividends paid:{" "}
                  {dividends[stk].data.totalDividends.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
                <div>
                  Total franking credits:{" "}
                  {dividends[stk].data.totalFrankingCredits.toLocaleString(
                    "en-US",
                    { style: "currency", currency: "USD" }
                  )}
                </div>
                <div>
                  Total gross dividend:{" "}
                  {dividends[stk].data.totalGrossDividends.toLocaleString(
                    "en-US",
                    { style: "currency", currency: "USD" }
                  )}
                </div>
              </Card.Body>
            </Card>
          </ListGroup.Item>
        ))}
        <ListGroup.Item
          className="d-flex justify-content-between align-items-center"
          key="pf-dividends-total"
        >
          <div/>
          <Card>
            <Card.Body>
              <div style={{ fontWeight: "bold" }}>
                Total dividends paid:{" "}
                {total.totalDividends.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <div style={{ fontWeight: "bold" }}>
                Total franking credits:{" "}
                {total.totalFrankingCredits.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <div style={{ fontWeight: "bold" }}>
                Total gross dividend:{" "}
                {total.totalGrossDividends.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </Card.Body>
          </Card>
        </ListGroup.Item>
      </React.Fragment>
    );
  }

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>Portfolio: {portfolio.info.name}</Card.Title>
            <ListGroup>{stockList()}</ListGroup>
            {error && <Alert variant="danger">{error}</Alert>}
            {portfolioError && <Alert variant="danger">{portfolioError}</Alert>}
            <div className="w-100 text-center mt-2">
              <Button variant="link" href="/tax/dividends/all">
                Back to all Portfolios
              </Button>
            </div>
          </Card.Body>
        </Card>
        <Card>
          <Card.Body>
            <Alert variant="secondary">
              <Alert.Heading>Note:</Alert.Heading>
              <ul>
                <li>
                  45 Day Holding Rule:
                  <ul>
                    <li>
                      The holding period rule requires you to continuously hold
                      shares 'at risk' for at least 45 days to be eligible for
                      the franking tax offset
                    </li>
                    <li>
                      This rule does not apply to individual taxpayers whose
                      total franking credits claimed is less than $5000 for the
                      financial year
                    </li>
                    <li>
                      For more information visit the{" "}
                      <a href="https://www.ato.gov.au/Forms/You-and-your-shares-2021/?page=10">
                        ATO
                      </a>
                    </li>
                  </ul>
                </li>
              </ul>
            </Alert>
          </Card.Body>
        </Card>
      </Container>
      <Container>
        <div className="w-100 text-center mt-2">
          <Button variant="link" href="/">
            Home
          </Button>
        </div>
      </Container>
    </div>
  );
}
