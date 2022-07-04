import React, {useContext, useRef, useState} from "react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Container,
  Dropdown,
  DropdownButton,
  Form,
  FormControl,
  InputGroup,
  ToggleButton,
} from "react-bootstrap";
import {useHistory, useParams} from "react-router-dom";
import {usePortfolioFetch} from "../../hooks/usePortfolioFetch";
import {usePriceFetch} from "../../hooks/usePriceFetch";
import {useCompanyNameFetch} from "../../hooks/useCompanyNameFetch";
import {useWatchlistFetch} from "../../hooks/useWatchlistFetch";
import API from "../../API";
import {AppContext} from "../../Context";

export default function AddingStock() {
  const { currentUser, portfolios, watchlists } = useContext(AppContext);

  const [error, setError] = useState("");
  const history = useHistory();

  const [pfid, setPfid] = useState(-1);
  const [wlid, setWlid] = useState(-1);
  const { watchlist, watchlistLoading } = useWatchlistFetch(
    currentUser.uid,
    wlid
  );

  const { portfolio, portfolioLoading, portfolioError } = usePortfolioFetch(
    currentUser.uid,
    pfid
  );

  const { ticker } = useParams();
  const { price, priceLoading, priceError } = usePriceFetch(ticker);
  const { companyName, companyNameLoading, companyNameError } =
    useCompanyNameFetch(ticker);
  const quantityRef = useRef(0);
  const frankedRef = useRef(0);
  const customPriceRef = useRef();
  const [radioValue, setRadioValue] = useState("0");

  const region = ticker.substring(ticker.length - 2, ticker.length);

  const options = [
    { name: "Portfolio", value: "0" },
    { name: "Watchlist", value: "1" },
  ];

  const handlePortfolioSelect = (pfid) => {
    const id = parseInt(pfid, 10);
    setPfid(id);
  };

  const handleWatchlistSelect = (wlid) => {
    const id = parseInt(wlid, 10);
    setWlid(id);
    // console.log(watchlist);
  };

  async function handleAddingStocks(event) {
    event.preventDefault();
    if (parseInt(quantityRef.current.value, 10) < 1) {
      setError("Invalid Number of Stocks");
      return;
    }

    // console.log(customPriceRef.current.value === "");
    const validPrice = /^([0-9]*[.])?[0-9]+$/.test(
      customPriceRef.current.value
    );
    const inputPrice = parseFloat(customPriceRef.current.value);
    // console.log(customPriceRef.current.value);
    // console.log(inputPrice);
    // console.log(validPrice);
    if (!validPrice || inputPrice < 0) {
      setError("Invalid Price of Stocks");
      return;
    }

    if (price === -1) {
      setError("This Stock Does Not Exist");
      return;
    }

    if (pfid === -1) {
      setError("No portfolio selected");
      return;
    }
    const franked = parseFloat(frankedRef.current.value);
    if (franked > 100 || franked < 0) {
      setError("Franked Percentage Invalid");
      return;
    }

    try {
      const quantityNumber = parseInt(quantityRef.current.value, 10);

      let finalPrice = parseFloat(price);
      const inputPrice = parseFloat(customPriceRef.current.value);
      if (validPrice) finalPrice = inputPrice;
      const success = API.addStock(
        currentUser.uid,
        pfid,
        quantityNumber,
        ticker,
        finalPrice,
        franked
      );
      if (success) {
        // no longer takes user to view portfolio
        history.push(`/`); // Take the user back to the homepage
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function addToWatchlist(event) {
    event.preventDefault();
    if (wlid < 1) {
      setError("There was a Problem Accessing this watchlist");
    }
    if (!watchlists) {
      setError("No Watchlists");
      return;
    }
    try {
      const success = await API.addStockWatchlist(
        currentUser.uid,
        wlid,
        ticker
      );
      if (success) {
        // no longer takes user to view portfolio
        history.push(`/`); // Take the user back to the homepage
      } else {
        setError("Stock Already in Watchlist");
      }
    } catch (error) {
      console.log(error);
    }
  }

  function displayPrice() {
    if (priceLoading) return;
    if (price === -1) {
      return "Invalid Stock";
    }
    return parseFloat(price).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
    });
  }

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <div>
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
              <div>
                {radioValue === "0" ? (
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      {pfid === -1 ? (
                        <Alert variant="danger">
                          Please select a portfolio
                        </Alert>
                      ) : (
                        <div style={{ fontWeight: "bold", fontSize: "15pt" }}>
                          Portfolio: {portfolio.info.name}
                        </div>
                      )}
                    </div>
                    <DropdownButton
                      id="dropdown-basic-button"
                      title="Choose Portfolio"
                      onSelect={handlePortfolioSelect}
                    >
                      {portfolios
                        ? portfolios.map((pf, index) => (
                            <Dropdown.Item
                              key={index}
                              eventKey={pf.portfolio_id}
                            >
                              {pf.name}
                            </Dropdown.Item>
                          ))
                        : ""}
                    </DropdownButton>
                  </div>
                ) : (
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      {wlid === -1 ? (
                        <Alert variant="danger">
                          Please select a watchlist
                        </Alert>
                      ) : (
                        <div style={{ fontWeight: "bold", fontSize: "15pt" }}>
                          Watchlist: {watchlist.info.name}
                        </div>
                      )}
                    </div>
                    <DropdownButton
                      id="dropdown-basic-button"
                      title="Choose Watchlist"
                      onSelect={handleWatchlistSelect}
                    >
                      {watchlists
                        ? watchlists.map((wl, index) => (
                            <Dropdown.Item
                              key={index}
                              eventKey={wl.watchlist_id}
                            >
                              {wl.name}
                            </Dropdown.Item>
                          ))
                        : ""}
                    </DropdownButton>
                  </div>
                )}
              </div>
              <hr />
              {!companyNameLoading && !priceLoading && (
                <div>
                  <div style={{ fontWeight: "bold", fontSize: "15pt" }}>
                    Stock: [{ticker}] {companyName}
                  </div>
                  <div>Current Price: {displayPrice()}</div>
                </div>
              )}
            </div>
            <hr />
            <div>
              {radioValue === "0" ? (
                <Form onSubmit={handleAddingStocks}>
                  <InputGroup className="mb-3">
                    <InputGroup.Text>Quantity</InputGroup.Text>
                    <FormControl
                      type="numberRef"
                      ref={quantityRef}
                      defaultValue={1}
                    />
                  </InputGroup>
                  {!priceLoading && (
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Price</InputGroup.Text>
                      <InputGroup.Text>$</InputGroup.Text>
                      <FormControl
                        type="numberRef"
                        ref={customPriceRef}
                        defaultValue={price}
                      />
                    </InputGroup>
                  )}

                  {region === "AU" ? (
                    <InputGroup className="mb-3">
                      <InputGroup.Text>Franking Percentage</InputGroup.Text>
                      <FormControl
                        type="numberRef"
                        ref={frankedRef}
                        defaultValue={0}
                      />
                      <InputGroup.Text>%</InputGroup.Text>
                    </InputGroup>
                  ) : (
                    ""
                  )}
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={pfid === -1 || portfolioLoading}
                  >
                    Add to portfolio
                  </Button>
                  {error && <Alert variant="danger">{error}</Alert>}
                  {pfid !== -1 && priceError && (
                    <Alert variant="danger">{priceError}</Alert>
                  )}
                  {pfid !== -1 && companyNameError && (
                    <Alert variant="danger">{companyNameError}</Alert>
                  )}
                  {pfid !== -1 && portfolioError && (
                    <Alert variant="danger">{portfolioError}</Alert>
                  )}
                </Form>
              ) : (
                <div>
                  <Button
                    onClick={addToWatchlist}
                    variant="primary"
                    type="submit"
                    disabled={wlid === -1 || watchlistLoading}
                  >
                    Add to watchlist
                  </Button>
                  {error && <Alert variant="danger">{error}</Alert>}
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
