import { csvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";
const axios = require("axios").default;
const API_URL = "http://localhost:42069";

function parseData(parse) {
  return function (d) {
    d.pubDate = parse(d.pubDate);

    return d;
  };
}

const parseDate = timeParse("%Y-%m-%dT%H:%M:%SZ");

export function getNews() {
  return axios
    .get(`${API_URL}/getNews`, {})
    .then((response) => response.data)
    .then((data) => csvParse(data, parseData(parseDate)));
}
