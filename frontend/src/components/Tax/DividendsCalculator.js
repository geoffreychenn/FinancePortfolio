import React, {useEffect, useState} from "react";
import {Alert, Button, Card, Container, FormControl, InputGroup,} from "react-bootstrap";

// Calculator (Price given as price per share)
export const frankingCreditsCalculator = (
  price = 0,
  franking = 0,
  shares = 0
) => {
  const ausTax = 0.3; // Australian company tax flat 30%
  const p = parseFloat(price);
  const f = parseFloat(franking);
  const s = parseInt(shares, 10);
  const frankingCredits = ((p * ausTax) / (1 - ausTax)) * (f / 100);
  const totalDividends = (p / 100) * s;
  const totalFrankingCredits = (frankingCredits / 100) * s;
  return {
    frankingCredits: frankingCredits,
    grossDividend: p + frankingCredits,
    totalDividends: totalDividends,
    totalFrankingCredits: totalFrankingCredits,
    totalGrossDividends: totalDividends + totalFrankingCredits,
  };
};

export default function DividendsCalculator() {
  const [calc, setCalc] = useState({
    frankingCredits: 0,
    grossDividend: 0,
    totalDividends: 0,
    totalFrankingCredits: 0,
    totalGrossDividends: 0,
  });
  const [price, setPrice] = useState(0);
  const [franking, setFranking] = useState(0);
  const [shares, setShares] = useState(0);
  const [inputErrors, setInputErrors] = useState({
    price: false,
    franking: false,
    shares: false,
  });

  useEffect(() => {
    const calc = frankingCreditsCalculator(price, franking, shares);
    setCalc(calc);
  }, [price, franking, shares]);

  const handleChange = async (e) => {
    e.preventDefault();
    const name = e.target.name;
    const valid = e.target.validity.valid;
    const val = e.target.value;
    if (name === "price") {
      if (valid && val !== "") {
        setPrice(val);
        setInputErrors({ ...inputErrors, price: false });
      } else {
        setPrice(0);
        setInputErrors({ ...inputErrors, price: true });
      }
    } else if (name === "franking") {
      if (valid && val !== "" && val >= 0 && val <= 100) {
        setFranking(val);
        setInputErrors({ ...inputErrors, franking: false });
      } else {
        setFranking(0);
        setInputErrors({ ...inputErrors, franking: true });
      }
    } else if (name === "shares") {
      if (valid && val !== "" && val >= 0) {
        setShares(val);
        setInputErrors({ ...inputErrors, shares: false });
      } else {
        setShares(0);
        setInputErrors({ ...inputErrors, shares: true });
      }
    }
  };

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>Dividends Calculator</Card.Title>
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Price per share</InputGroup.Text>
                  <InputGroup.Text>$</InputGroup.Text>
                  <FormControl
                    name="price"
                    placeholder="0"
                    pattern="[+-]?([0-9]*[.])?[0-9]+"
                    isInvalid={inputErrors.price}
                    onChange={handleChange}
                  />
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Franking percentage</InputGroup.Text>
                  <FormControl
                    name="franking"
                    placeholder="0"
                    pattern="[+-]?([0-9]*[.])?[0-9]+"
                    isInvalid={inputErrors.franking}
                    onChange={handleChange}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
                <InputGroup className="mb-3">
                  <InputGroup.Text>Number of shares</InputGroup.Text>
                  <FormControl
                    name="shares"
                    placeholder="0"
                    pattern="[0-9]+"
                    isInvalid={inputErrors.shares}
                    onChange={handleChange}
                  />
                </InputGroup>
              </div>
              <Card>
                <Card.Body>
                  <div>
                    Franking credit:{" "}
                    {calc.frankingCredits.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                  <div>
                    Gross dividend:{" "}
                    {calc.grossDividend.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                  <hr />
                  <div>
                    Total dividends paid:{" "}
                    {calc.totalDividends.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                  <div>
                    Total franking credits:{" "}
                    {calc.totalFrankingCredits.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                  <div>
                    Total gross dividend:{" "}
                    {calc.totalGrossDividends.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </div>
                </Card.Body>
              </Card>
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
