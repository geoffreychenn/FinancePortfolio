import React, { useContext, useState } from "react";
import {
  Button,
  Container,
  Card,
  Alert,
  Form,
  ButtonGroup,
  ToggleButton,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import { usePortfolioFetch } from "../../hooks/usePortfolioFetch";
import { useStockPrices } from "../../hooks/useStockPrices";
import API from "../../API";
import { DayChartComponent } from "../Querying/DayChart";
import ReactDataGrid from "@inovua/reactdatagrid-community";
import "@inovua/reactdatagrid-community/index.css";
import {
  Table,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableBody,
  IconButton,
  Tooltip,
  Modal,
  Grid,
  Drawer,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AppContext } from "../../Context";
import { CompanyNewsComponent } from "../Querying/CompanyNews";
import { PortfolioPerformersComponent } from "../Querying/PortfolioPerformers";
import { PortfolioPerformersLastLogoutComponent } from "../Querying/PortfolioPerformersLastLogout";

export default function ViewPortfolio() {
  const { currentUser } = useContext(AppContext);
  const [error, setError] = useState("");
  const { pfid } = useParams();
  const portfolio_id = parseInt(pfid, 10);
  const { portfolio, portfolioLoading, portfolioError } = usePortfolioFetch(
    currentUser.uid,
    portfolio_id
  );
  const { prices, pricesLoading } = useStockPrices(portfolio.stocks);
  const [init, setInit] = useState(false);
  const [stocklist, setStocklist] = useState([]);
  const [doUpdate, setUpdate] = useState(false);
  const timeStart = new Date();
  // Used to display the time that data was grabbed
  const timeStamp =
    timeStart.getHours() +
    ":" +
    timeStart.getMinutes() +
    ":" +
    timeStart.getSeconds();
  const [showChart, setShowChart] = useState(false);
  const [showNews, setShowNews] = useState(false);

  const [viewValue, setViewValue] = useState("0");
  const [openModal, setOpenModal] = useState(false);
  const [currStks, setCurrStks] = useState();
  const [currStksTicker, setCurrStksTicker] = useState();
  const [currStksRegion, setCurrStksRegion] = useState();
  const [currTime] = useState(new Date().toLocaleTimeString());
  const [currPF, setCurrPF] = useState(-1);

  const [searchTerm, setSearchTerm] = useState("");

  const options = [
    { name: "Overview", value: "0" },
    { name: "Comparison View", value: "1" },
    { name: "Worst/Best Performers", value: "2" },
  ];

  const columns = [
    { name: "ticker", header: "Ticker", defaultFlex: 1 },
    { name: "region", header: "Region", defaultFlex: 1 },
    {
      name: "currPrice",
      header: "Current Price",
      defaultFlex: 1,
      type: "number",
    },
    { name: "cost", header: "Purchase Price", defaultFlex: 1, type: "number" },
    { name: "quantity", header: "Quantity", defaultFlex: 1, type: "number" },
    {
      name: "franked",
      header: "Franked Percentage",
      defaultFlex: 1,
      type: "number",
    },
    { name: "time", header: "Purchase Time", defaultFlex: 1 },
  ];

  // I think this is the easiest place to add a filter
  // how can we tell? I suppose if searchTermFixed !== ""
  function createStocklist() {
    const tickers = portfolio.stocks.map((sks) => [
      sks.ticker,
      sks.quantity,
      sks.region,
    ]);
    setCurrPF(portfolio.info.portfolio_id);
    let dict = {};
    let price = {};
    let regions = {};
    let k = {};
    for (let i = 0; i < tickers.length; i++) {
      dict[tickers[i][0] + tickers[i][2]] = 0;
      price[tickers[i][0] + tickers[i][2]] = prices[i];
      regions[tickers[i][0] + tickers[i][2]] = tickers[i][2];
      k[tickers[i][0]] = 0;
    }

    for (let i = 0; i < tickers.length; i++) {
      dict[tickers[i][0] + tickers[i][2]] += tickers[i][1];
    }

    let keys = Object.keys(dict);
    let arr = new Array(keys.length);
    let j = 0;
    for (let i = 0; i < keys.length; i++) {
      arr[j] = {
        ticker: keys[i].substring(0, keys[i].length - 2),
        quantity: dict[keys[i]],
        remove: false,
        region: regions[keys[i]],
        chart: false,
        price: price[keys[i]],
      };
      j++; // increment the return array counter
    }

    return arr;
  }

  function remover(ticker, region) {
    for (let i = 0; i < stocklist.length; i++) {
      if (
        ticker === stocklist[i].ticker &&
        stocklist[i].remove !== true &&
        stocklist[i].region === region
      ) {
        return;
      }
    }

    const stocks = portfolio.stocks.map((sks) => [
      sks.ticker,
      sks.quantity,
      sks.stock_id,
      sks.time,
      sks.region,
      sks.franked,
      sks.price,
      sks.exchange_rate,
    ]);

    var arr = [];
    for (let i = 0; i < stocks.length; i++) {
      if (ticker === stocks[i][0] && region === stocks[i][4]) {
        arr.push(stocks[i]);
      }
    }

    return arr.map((stk, index) => (
      <Form onSubmit={(event) => removeStock(event, stk)} key={index}>
        <Form.Group>
          <h6>
            Remove Stocks from Batch Added At Time: {stk[3]} with {stk[1]}{" "}
            Stocks
          </h6>
          {stk[4] === "AU" ? (
            <Form.Label className="mt-2">
              Purchased at Price ${stk[6]} ({stk[4]})
            </Form.Label>
          ) : (
            <Form.Label>
              Purchased at Price ${stk[6]} ({stk[4]}) / $
              {parseFloat(stk[6]) * parseFloat(stk[7])} (AU)
            </Form.Label>
          )}
          {stk[4] === "AU" ? (
            <Form.Label> With Franked Percentage {stk[5]} </Form.Label>
          ) : (
            " "
          )}
          <Grid container spacing={2}>
            <Grid item>
              <Form.Control type="text" name="stocks"/>
            </Grid>
            <Grid item>
              <Button variant="primary" type="submit" className="mb-3">
                Remove Stocks
              </Button>
            </Grid>
          </Grid>
        </Form.Group>
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
        if (success) {
          setError("");
          window.location.reload();
        }
      }
    } catch (e) {
      setError("Stocks could not be removed");
    }
  }

  function toggleModal() {
    setOpenModal(!openModal);
  }

  // this handles the switching of drawers, ensuring they dont open behind each other - only one is open at a time
  // this is awful and hacky but idk how else to do this rn its 5am help
  function toggleOtherOffChart(stks) {
    stocklist.forEach((item) => {
      if (item !== stks) {
        item.chart = false;
      }
      item.news = false;
      item.holders = false;
      item.info = false;
      item.events = false;
    });
  }

  function toggleOtherOffNews(stks) {
    stocklist.forEach((item) => {
      if (item !== stks) {
        item.news = false;
      }
      item.chart = false;
      item.holders = false;
      item.info = false;
      item.events = false;
    });
  }

	function stockList(){
		// Adding check for if we need to wait for results to load as well
		if (portfolioLoading) return;
		if (pricesLoading) return;
		if (prices.length === 0) return;
		if (currPF !== portfolio.info.portfolio_id){
		    setInit(false)
		}
		if (init === false) {
		    setInit(true);
            let list = createStocklist();
		    setStocklist(list);
		}

		return (stocklist.filter((val)=> {
			console.log(searchTerm);
			if(searchTerm === "") return val;
			else if(val.ticker.toUpperCase().includes(searchTerm.toUpperCase())) return val;
			else return false;
		}).map((stks, index) => (
			<TableRow>
				<TableCell style={{width: "10rem"}}><a href={"/company/" + stks.ticker + "/" + stks.region}>{stks.ticker}</a></TableCell>
				<TableCell style={{width: "10rem"}}>{stks.region}</TableCell>
				<TableCell style={{width: "10rem"}}>{stks.quantity}</TableCell>
				<TableCell style={{width: "10rem"}}>${stks.price} ({stks.region}D)</TableCell>

				<TableCell style={{width: "6rem"}}>
					<Tooltip title="Add Stocks">
						{stks.region === "AU" ?
						<IconButton href={"/add/" + stks.ticker + ".AU"} size="sm"><AddIcon/></IconButton>
						: <IconButton href={"/add/" + stks.ticker} size="sm"><AddIcon/></IconButton>
						}
					</Tooltip>
				</TableCell>

          <TableCell style={{ width: "6rem" }}>
            <Tooltip title="Remove Stocks">
              <IconButton
                onClick={() => {
                  stks.remove = !stks.remove;
                  // console.log(stocklist[index]);
                  setUpdate(!doUpdate);
                  toggleModal();
                  setCurrStks(stks);
                  setCurrStksTicker(stks.ticker);
                  setCurrStksRegion(stks.region);
                }}
              >
                <RemoveIcon />
              </IconButton>
            </Tooltip>
          </TableCell>

          <TableCell>
            <Button
              onClick={() => {
                stks.chart = !stks.chart;
                setShowChart(!showChart);
                toggleOtherOffChart(stks);
              }}
            >
              Chart
            </Button>
            {
              <Drawer open={stks.chart} variant="persistent" anchor="bottom">
                <div className="bottom-drawer">
                  <DayChartComponent
                    symbol={stks.ticker}
                    region={stks.region}
                  />
                  <Button
                    onClick={() => {
                      stks.chart = !stks.chart;
                      setShowChart(!showChart);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </Drawer>
            }
          </TableCell>

          <TableCell>
            <Button
              onClick={() => {
                stks.news = !stks.news;
                setShowNews(!showNews);
                toggleOtherOffNews(stks);
              }}
            >
              News
            </Button>
            {
              <Drawer open={stks.news} variant="persistent" anchor="bottom">
                <div className="bottom-drawer">
                  <CompanyNewsComponent
                    symbol={stks.ticker}
                    region={stks.region}
                  />
                  <Button
                    onClick={() => {
                      stks.news = !stks.news;
                      setShowNews(!showNews);
                    }}
                  >
                    Close
                  </Button>
                </div>
              </Drawer>
            }
          </TableCell>
        </TableRow>
      )));
  }

  function displayAllStock() {
    if (portfolioLoading) return;
    if (pricesLoading) return;

    // console.log(prices);
    let rows = [];
    for (let i = 0; i < portfolio.stocks.length; i++) {
      let s = portfolio.stocks[i];

      let data = {
        id: i,
        ticker: s.ticker,
        region: s.region,
        cost: s.price,
        quantity: s.quantity,
        franked: s.franked,
        time: s.time,
        currPrice: parseFloat(prices[i]),
      };
      rows.push(data);
    }

    const gridStyle = { minHeight: 55 * (portfolio.stocks.length + 1) };
    return (
      <Card>
        <Card.Body>
          <div style={{ height: 400, width: "100%" }}>
            <ReactDataGrid
              idProperty="id"
              columns={columns}
              style={gridStyle}
              dataSource={rows}
            />
          </div>
        </Card.Body>
      </Card>
    );
  }

  // This is part of the implementation for AutoRefresh
  // It has been disabled for usability
  /*
	useInterval(() => {
			window.location.reload(false); // this works but it is not nice 
	}, [6000000]);

	// this is the renderer for the countdown, change this to change timer appearence
	const countdownRenderer = ({seconds}) => {
		// do the render 
		return <span>Refresh in: {seconds}</span>;
	};
	*/

  return (
    <div className="canvas">
      <Container>
        <Card>
          <Card.Body>
            <Card.Title>
              <div>Portfolio: {portfolio.info.name}</div>
            </Card.Title>
            <div>
              <IconButton onClick={() => window.location.reload(false)}>
                <RefreshIcon />
              </IconButton>
              Last updated: {currTime}
            </div>
            <Card.Subtitle>Data timestamp: {timeStamp}.</Card.Subtitle>
            <Card.Subtitle>
              <div>
                <Grid
                  container
                  spacing={1}
                  direction="row"
                  justifyContent="center"
                >
                  <Form>
                    <Grid item>
                      <Form.Control
                        placeholder="Filter stocks..."
                        onChange={(event) => {
                          setSearchTerm(event.target.value);
                        }}
                      />
                    </Grid>
                  </Form>
                </Grid>
              </div>
            </Card.Subtitle>
            {error && <Alert variant="danger">{error}</Alert>}
            <ButtonGroup
              className="d-flex align-items-center mt-3"
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
                  checked={viewValue === radio.value}
                  onChange={(e) => setViewValue(e.currentTarget.value)}
                >
                  {radio.name}
                </ToggleButton>
              ))}
            </ButtonGroup>
            {portfolio.stocks.length === 0 && !portfolioLoading ? (
              <h4>Portfolio Empty</h4>
            ) : (
              ""
            )}
            {viewValue === "0" ? (
              <TableContainer sx={{ maxHeight: "28vh" }}>
                <Table stickyHeader aria-label="sticky table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Stock</TableCell>
                      <TableCell>Region</TableCell>
                      <TableCell>Quantity</TableCell>
                      <TableCell>Current Price</TableCell>
                      {/* if we dont have all these TableCells here the table lines looks weird */}
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>{stockList()}</TableBody>
                </Table>
              </TableContainer>
            ) : (
              " "
            )}
            {viewValue === "1" ? displayAllStock() : " "}
            {viewValue === "2" && portfolio.stocks.length !== 0 ? (
              <Card>
                <PortfolioPerformersLastLogoutComponent
                  portfolio_id={portfolio_id}
                  user_id={currentUser.uid}
                />
                <PortfolioPerformersComponent portfolio_id={portfolio_id} />
              </Card>
            ) : (
              " "
            )}
            {/*<NewsComponent/>*/}
            {portfolioError && <Alert variant="danger">{portfolioError}</Alert>}
          </Card.Body>
        </Card>
      </Container>

      <Modal
        open={openModal}
        onClose={() => {
          setUpdate(!doUpdate);
          toggleModal();
          currStks.remove = !currStks.remove;
        }}
        style={{ zIndex: 2500 }}
      >
        <Container>
          <Card className="remove-modal">
            <Card.Title className="remove-title mt-2">
              {currStksTicker}
            </Card.Title>
            <Card.Body>{remover(currStksTicker, currStksRegion)}</Card.Body>
          </Card>
        </Container>
      </Modal>
    </div>
  );
}
