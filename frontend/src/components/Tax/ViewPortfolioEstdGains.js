import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Card,
  Alert,
  Spinner,
  ListGroup,
  Table,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useAuth } from "../Account/AuthContext";
import { usePortfolioFetch } from "../../hooks/usePortfolioFetch";
import API from "../../API";

export default function ViewPortfolioEstdGains() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { pfid } = useParams();
  const portfolio_id = parseInt(pfid, 10);
  const { portfolio, portfolioLoading, portfolioError } = usePortfolioFetch(
    currentUser.uid,
    portfolio_id
  );
  const [gain, setGain] = useState({ stocks: [], totalReturn: 0, time: "" });

  const fetchPortfolioEstdGain = async (pfid) => {
    try {
      setLoading(true);
      const data = await API.fetchEstimatedGains(currentUser.uid, pfid);
      setGain(data.data);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
      setError("Could not fetch estimated gains");
    }
  };

  useEffect(() => {
    fetchPortfolioEstdGain(pfid);
  }, [pfid]);

  function stockList() {
    if (
      portfolioLoading ||
      loading ||
      gain.stocks.length !== portfolio.stocks.length
    ) {
      return (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      );
    }

    if (portfolio.stocks.length === 0) {
      return <div className="text-center">No Stocks found</div>;
    }

    return gain.stocks.map((stk, index) => (
      <ListGroup.Item
        className="d-flex justify-content-between align-items-center"
        key={index}
      >
        <div>
          <div style={{ fontWeight: "bold", fontSize: "18pt" }}>
            {stk.ticker}
          </div>
          <Table bordered striped className="text-center">
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Region</th>
                <th>Date Acquired</th>
                <th>
                  Acquired Price
                  <br />
                  (per share)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{stk.quantity}</td>
                <td>{stk.region}</td>
                <td>{stk.time}</td>
                <td>
                  {stk.price.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
        <Card>
          <Card.Body>
            <div>
              Cost:{" "}
              {stk.calc.cost.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <div>
              Current Price:{" "}
              {stk.calc.current.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <div className={stk.calc.return < 0 ? "error" : "valid"}>
              Estimated Gain: {+stk.calc.return.toFixed(2)}
            </div>
          </Card.Body>
        </Card>
      </ListGroup.Item>
    ));
  }

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>
              <div className="d-flex justify-content-between align-items-center">
                <div>Portfolio: {portfolio.info.name}</div>
                <div>Last Updated: {gain.time}</div>
              </div>
            </Card.Title>
            <ListGroup>{stockList()}</ListGroup>
            {error && <Alert variant="danger">{error}</Alert>}
            {portfolioError && <Alert variant="danger">{portfolioError}</Alert>}
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
