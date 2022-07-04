import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Card,
  Alert,
  ButtonGroup,
  ToggleButton,
  ListGroup,
} from "react-bootstrap";
import API from "../../API";

import { AppContext } from "../../Context";

export default function DelPortfolioWatchlist() {
  const { currentUser, portfolios, watchlists, loading, setLoading } =
    useContext(AppContext);
  const [error, setError] = useState("");
  const [radioValue, setRadioValue] = useState("0");

  const options = [
    { name: "Portfolio", value: "0" },
    { name: "Watchlist", value: "1" },
  ];

  // TODO
  const renderPortfolios = () => {
    if (!portfolios || portfolios.length === 0) {
      return <div className="text-center">No portfolios found</div>;
    }

    return portfolios.map((pl, index) => (
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-center"
        key={index}
      >
        <Button
          variant="link"
          href={`/portfolio/view/${pl.portfolio_id}`}
          disabled={loading}
        >
          {pl.name}
        </Button>
        <Button
          variant="danger"
          pill="true"
          value={pl.portfolio_id}
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </ListGroup.Item>
    ));
  };

  const renderWatchlists = () => {
    if (!watchlists || watchlists.length === 0) {
      return <div className="text-center">No watchlists found</div>;
    }

    return watchlists.map((wl, index) => (
      <ListGroup.Item
        as="li"
        className="d-flex justify-content-between align-items-center"
        key={index}
      >
        <Button
          variant="link"
          href={`/watchlist/view/${wl.watchlist_id}`}
          disabled={loading}
        >
          {wl.name}
        </Button>
        <Button
          variant="danger"
          pill="true"
          value={wl.watchlist_id}
          onClick={handleDelete}
          disabled={loading}
        >
          Delete
        </Button>
      </ListGroup.Item>
    ));
  };

  const handleDelete = async (event) => {
    event.preventDefault();
    const confirm = window.confirm(
      `Are you sure you want to delete this ${
        radioValue === "0" ? "portfolio" : "watchlist"
      }?`
    );
    if (confirm === false) return;
    const id = event.target.value;
    try {
      setLoading(true);
      let success;
      if (radioValue === options[0].value) {
        success = await API.deletePortfolio(currentUser.uid, id);
      } else {
        success = await API.deleteWatchlist(currentUser.uid, id);
      }
      setLoading(false);
      if (success) {
        setError("");
      } else {
        setError(
          `Could not delete ${radioValue === "0" ? "portfolio" : "watchlist"}`
        );
      }
    } catch (e) {
      setError(
        `Could not delete ${radioValue === "0" ? "portfolio" : "watchlist"}`
      );
      setLoading(false);
      console.log(e);
    }
  };

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <ButtonGroup
              className="d-flex align-items-center"
              style={{ marginBottom: 10 }}
            >
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
                  disabled={loading}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>

            <ListGroup as="ul" style={{ marginBottom: 10 }}>
              {radioValue === "0" ? renderPortfolios() : renderWatchlists()}
            </ListGroup>

            {error && <Alert variant="danger">{error}</Alert>}
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
