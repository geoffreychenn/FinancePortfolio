import { csvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";
const axios = require("axios").default;
const API_URL = "http://localhost:42069";

function parseData(parse) {
  return function (d) {
    d.date = parse(d.timestamp);
    d.open = +d.open;
    d.high = +d.high;
    d.low = +d.low;
    d.close = +d.close;
    d.volume = +d.volume;

    return d;
  };
}

const parseIntraDate = timeParse("%Y-%m-%d %H:%M:%S");
const parseDate = timeParse("%Y-%m-%d");

export function getIntraData(symbol, interval) {
  return axios
    .get(`${API_URL}/getIntraDay`, {
      params: {
        symbol: symbol,
        interval: interval,
      },
    })
    .then((response) => csvParse(response.data, parseData(parseIntraDate)));
}

export function getDayData(symbol, region) {
  return axios
    .get(`${API_URL}/getDay`, {
      params: {
        symbol: symbol,
        region: region,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data, parseData(parseDate)));
}

export function getCompanyNews(symbol, region) {
  return axios
    .get(`${API_URL}/getNewsByTicker`, {
      params: {
        symbol: symbol,
        region: region,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data));
}

export function getCompanyHolders(symbol, region) {
  return axios
    .get(`${API_URL}/getHoldersByTicker`, {
      params: {
        symbol: symbol,
        region: region,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data));
}

export function getCompanyInfo(symbol, region) {
  return axios
    .get(`${API_URL}/getInfoByTicker`, {
      params: {
        symbol: symbol,
        region: region,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data));
}

export function getCompanyEvents(symbol, region) {
  return axios
    .get(`${API_URL}/getEarningsByTicker`, {
      params: {
        symbol: symbol,
        region: region,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data));
}

export function getWatchlistPerformers(watchlistID) {
  return axios
    .get(`${API_URL}/getWatchlistPerformer`, {
      params: {
        watchlist_id: watchlistID,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data));
}

export function getPortfolioPerformers(portfolioID) {
  return axios
    .get(`${API_URL}/getPortfolioPerformer`, {
      params: {
        portfolio_id: portfolioID,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data));
}

export function getPortfolioPerformersLastLogout(portfolioID, uid) {
  return axios
    .get(`${API_URL}/getPortfolioPerformerLastLogout`, {
      params: {
        portfolio_id: portfolioID,
        user_id: uid,
      },
    })
    .then((response) => response.data)
    .then((data) => csvParse(data));
}
