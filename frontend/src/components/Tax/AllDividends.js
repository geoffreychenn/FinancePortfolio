import React, { useState, useEffect } from "react";
import {
  Button,
  Container,
  Card,
  ListGroup,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "../Account/AuthContext";
import API from "../../API";
import { usePortfoliosFetch } from "../../hooks/usePortfoliosFetch";
import { frankingCreditsCalculator } from "./DividendsCalculator";

export default function AllDividends() {
  // const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [dividends, setDividends] = useState([]);
  const { portfolios, portfoliosLoading, portfoliosError } = usePortfoliosFetch(
    currentUser.uid
  );
  const [totals, setTotals] = useState({
    totalDividends: 0,
    totalFrankingCredits: 0,
    totalGrossDividends: 0,
  });

  const fetchDividends = async (pfs) => {
    if (pfs === undefined) return;
    // Fetch estimated gains for the portfolios
    const ids = pfs.map((pf) => {
      return pf.portfolio_id;
    });

    try {
      setLoading(true);
      const data = await API.fetchAllDividends(currentUser.uid, ids);

      // Loop through each portfolio
      const allDividends = [];
      const total = {
        totalDividends: 0,
        totalFrankingCredits: 0,
        totalGrossDividends: 0,
      };
      data.forEach((pf) => {
        const pfData = {
          portfolio_id: pf.portfolio_id,
          name: pf.name,
          totalDividends: 0,
          totalFrankingCredits: 0,
          totalGrossDividends: 0,
        };
        // Loop through each portfolios stocks
        pf.stocks.forEach((stk) => {
          // console.log(stk);
          const calc = frankingCreditsCalculator(
            stk.dividend_price,
            stk.franked,
            stk.quantity
          );
          pfData.totalDividends += calc.totalDividends;
          pfData.totalFrankingCredits += calc.totalFrankingCredits;
          pfData.totalGrossDividends += calc.totalGrossDividends;
          total.totalDividends += calc.totalDividends;
          total.totalFrankingCredits += calc.totalFrankingCredits;
          total.totalGrossDividends += calc.totalGrossDividends;
        });
        allDividends.push(pfData);
      });
      setDividends(allDividends);
      setTotals(total);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDividends(portfolios);
  }, [portfolios]);

  const portfolioList = () => {
    if (
      portfoliosLoading ||
      loading ||
      Object.keys(dividends).length !== portfolios.length
    ) {
      return (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      );
    }

    if (portfolios.length === 0) {
      return <div className="text-center">No Portfolios found</div>;
    }

    return (
      <React.Fragment>
        {dividends.map((dividend, index) => (
          <ListGroup.Item
            className="d-flex justify-content-between align-items-center"
            key={index}
          >
            <div>
              <Link to={`/tax/dividends/view/${dividend.portfolio_id}`}>
                {dividend.name}
              </Link>
            </div>
            <Card>
              <Card.Body>
                <div>
                  Dividends paid:{" "}
                  {dividend.totalDividends.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
                <div>
                  Franking credits:{" "}
                  {dividend.totalFrankingCredits.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
                <div>
                  Gross dividend:{" "}
                  {dividend.totalGrossDividends.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD",
                  })}
                </div>
              </Card.Body>
            </Card>
          </ListGroup.Item>
        ))}
        <ListGroup.Item
          className="d-flex justify-content-between align-items-center"
          key={`all-pf-dividends-total`}
        >
          <div/>
          <Card>
            <Card.Body>
              <div style={{ fontWeight: "bold" }}>
                Total dividends paid:{" "}
                {totals.totalDividends.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <div style={{ fontWeight: "bold" }}>
                Total franking credits:{" "}
                {totals.totalFrankingCredits.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
              <div style={{ fontWeight: "bold" }}>
                Total gross dividend:{" "}
                {totals.totalGrossDividends.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </Card.Body>
          </Card>
        </ListGroup.Item>
      </React.Fragment>
    );
  };

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>All Portfolio Dividends</Card.Title>
            <ListGroup>{portfolioList()}</ListGroup>
            {portfoliosError && (
              <Alert variant="danger">{portfoliosError}</Alert>
            )}
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
