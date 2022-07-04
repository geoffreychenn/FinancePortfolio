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

export default function AllEstimatedGains() {
  // const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [gains, setGains] = useState([]);
  const [time, setTime] = useState([]);
  const { portfolios, portfoliosLoading, portfoliosError } = usePortfoliosFetch(
    currentUser.uid
  );

  const estimatedGains = async (pfs) => {
    if (pfs === undefined) return;
    // Fetch estimated gains for the portfolios
    const ids = pfs.map((pf) => {
      return pf.portfolio_id;
    });

    try {
      setLoading(true);
      const data = await API.fetchAllEstimatedGains(currentUser.uid, ids);
      // console.log(pf.portfolio_id);
      setGains(data.data);
      setTime(data.time);
      setLoading(false);
    } catch (e) {
      console.log(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    estimatedGains(portfolios);
  }, [portfolios]);

  const portfolioList = () => {
    if (portfoliosLoading || loading || gains.length !== portfolios.length) {
      return (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      );
    }

    if (portfolios.length === 0) {
      return <div className="text-center">No Portfolios found</div>;
    }

    const total = gains.reduce((acc, curr) => {
      return acc + curr.totalReturn;
    }, 0);

    return (
      <React.Fragment>
        {gains.map((gain, index) => (
          <ListGroup.Item
            className="d-flex justify-content-between align-items-center"
            key={`pf-eg-${gain.portfolio_id}-${index}`}
          >
            <Link to={`/tax/estdgains/view/${gain.portfolio_id}`}>
              {gain.name}
            </Link>
            <div>Estimated Gains: {+gain.totalReturn.toFixed(2)}</div>
          </ListGroup.Item>
        ))}
        <ListGroup.Item
          className="d-flex justify-content-between align-items-center"
          key={`pf-eg-total-${gains.length}`}
        >
          <div/>
          <div>Total Estimated Gains: {+total.toFixed(2)}</div>
        </ListGroup.Item>
      </React.Fragment>
    );
  };

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>
              <div className="d-flex justify-content-between align-items-center">
                <div>All Portfolios Estimated Gains</div>
                <div>Last Updated: {time}</div>
              </div>
            </Card.Title>
            <ListGroup>{portfolioList()}</ListGroup>
            {portfoliosError && (
              <Alert variant="danger">{portfoliosError}</Alert>
            )}
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
