import React, { useState, useRef, useContext } from "react";
import {
  Form,
  Button,
  Container,
  Card,
  Alert,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import { useHistory } from "react-router-dom";
import API from "../../API";
import { AppContext } from "../../Context";

export default function AddPortfolioWatchlist() {
  const { currentUser, setLoading } = useContext(AppContext);

  const [error, setError] = useState("");

  const nameRef = useRef("");
  const [radioValue, setRadioValue] = useState("0");
  const history = useHistory();

  const options = [
    { name: "Portfolio", value: "0" },
    { name: "Watchlist", value: "1" },
  ];

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      let data;
      if (radioValue === options[0].value) {
        data = await API.addPortfolio(currentUser.uid, nameRef.current.value);
      } else {
        data = await API.addWatchlist(currentUser.uid, nameRef.current.value);
      }

      if (data.success) {
        setError("");
        // window.location.reload();
        if (radioValue === options[0].value) {
          history.push(`/portfolio/view/${data.portfolio_id}`);
        } else {
          history.push(`/watchlist/view/${data.watchlist_id}`);
        }
      } else {
        setError(data.error);
      }
    } catch (e) {
      setError(
        `Could not create new ${radioValue === "0" ? "portfolio" : "watchlist"}`
      );
      console.log(e);
    }
    setLoading(false);
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
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
            <Form onSubmit={handleSubmit} style={{ marginBottom: 10 }}>
              <Form.Group className="mb-3" controlId="formNewPortfolio">
                <Form.Label>
                  Create a new {radioValue === "0" ? "portfolio" : "watchlist"}
                </Form.Label>
                <Form.Control type="name" ref={nameRef}/>
              </Form.Group>
              <Button variant="primary" type="submit">
                Add {radioValue === "0" ? "portfolio" : "watchlist"}
              </Button>
            </Form>
            {error && <Alert variant="danger">{error}</Alert>}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
