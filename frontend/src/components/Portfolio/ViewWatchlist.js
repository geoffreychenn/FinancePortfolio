import React, { useState } from "react";
import { Button, Container, Card, Form } from "react-bootstrap";
import {
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Grid,
  Drawer,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useAuth } from "../Account/AuthContext";
import { useWatchlistFetch } from "../../hooks/useWatchlistFetch";
import API from "../../API";
import { useStockPrices } from "../../hooks/useStockPrices";
import { DayChartComponent } from "../Querying/DayChart";

export default function ViewWatchlist() {
  const { currentUser } = useAuth();
  const { wlid } = useParams();
  const watchlist_id = parseInt(wlid, 10);
  const { watchlist, watchlistLoading } = useWatchlistFetch(
    currentUser.uid,
    watchlist_id
  );
  const { prices, pricesLoading } = useStockPrices(watchlist.stocks);
  const timeStart = new Date();
  // Used to display the time that data was grabbed
  // const [timeStamp, setTimeStamp] = useState(timeStart.getHours() + ':' + timeStart.getMinutes() + ':' + timeStart.getSeconds());
  const timeStamp =
    timeStart.getHours() +
    ":" +
    timeStart.getMinutes() +
    ":" +
    timeStart.getSeconds();
  const [showChart, setShowChart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currWL, setCurrWL] = useState(-1);

  const [init, setInit] = useState(false);
  const [stocklist, setStocklist] = useState([]);

  function createStocklist() {
    const tickers = watchlist.stocks.map((sks) => [
      sks.ticker,
      sks.quantity,
      sks.region,
    ]);
    setCurrWL(watchlist.info.watchlist_id);
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

  function stockList() {
    if (watchlistLoading) return;
    if (pricesLoading) return;
    if (prices.length === 0) return;
    if (watchlist.info.watchlist_id !== currWL) {
      setInit(false);
    }
    if (init === false) {
      setInit(true);
      let list = createStocklist();
      setStocklist(list);
    }

    return stocklist
      .filter((val) => {
        if (searchTerm === "") return val;
        else if (val.ticker.toUpperCase().includes(searchTerm.toUpperCase()))
          return val;
        else return false; // CHECK: does this break anything???
      })
      .map((stks, index) => (
        <TableRow>
          <TableCell style={{ width: "10rem" }}>
            <a href={"/company/" + stks.ticker + "/" + stks.region}>
              {stks.ticker}
            </a>
          </TableCell>
          <TableCell style={{ width: "10rem" }}>{stks.region}</TableCell>
          <TableCell style={{ width: "16rem" }}>
            ${stks.price} ({stks.region}D)
          </TableCell>

          <TableCell style={{ width: "10rem" }}>
            <Button
              onClick={(event) =>
                removeStockWatchlist(event, stks.ticker, stks.region)
              }
            >
              Remove
            </Button>
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
        </TableRow>
      ));
  }

  async function removeStockWatchlist(event, ticker, region) {
    try {
      const success = await API.removeStockWatchlist(wlid, ticker, region);
      if (success) {
        window.location.reload();
      }
    } catch (error) {}
  }

  // This is part of the implementation for AutoRefresh
  // It has been disabled for usability
  /*
	useInterval(() => {
			window.location.reload(false); // this works but it is not nice 
	}, [60000]);
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
              <div>Watchlist: {watchlist.info.name}</div>
            </Card.Title>

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

            {watchlist.stocks.length === 0 && !watchlistLoading ? (
              <h4>Watchlist Empty</h4>
            ) : (
              ""
            )}
            <TableContainer sx={{ maxHeight: "28vh" }}>
              <Table stickyHeader aria-label="sticky table">
                <TableHead>
                  <TableRow>
                    <TableCell>Stock</TableCell>
                    <TableCell>Region</TableCell>
                    <TableCell>Current Price</TableCell>
                    {/* if we dont have all these TableCells here the table lines looks weird */}
                    <TableCell />
                    <TableCell />
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>{stockList()}</TableBody>
              </Table>
            </TableContainer>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
