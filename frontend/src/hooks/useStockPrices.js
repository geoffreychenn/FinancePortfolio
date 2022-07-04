import { useState, useEffect } from "react";
import API from "../API";

export const useStockPrices = (pf) => {
  const [prices, setPrice] = useState([]);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [pricesError, setPricesError] = useState("");

  const stockPrices = async (pf) => {
    const tickers = [];
    for (let i = 0; i < pf.length; i++) {
      var r = pf[i].region;
      var t = pf[i].ticker;
      if (r === "AU") {
        t = pf[i].ticker + ".AU";
      }
      tickers.push(t);
    }
    try {
      setPricesError("");
      setPricesLoading(true);
      const data = await API.stockPrice(tickers);
      if (data.success) setPrice(data.prices);
      else
        setPricesError("Sorry there was a problem finding the current prices");
    } catch (error) {
      setPricesError(
        "Sorry there was a problem finding the current prices of the stocks"
      );
    }
    setPricesLoading(false);
  };

  useEffect(() => {
    stockPrices(pf);
  }, [pf]);

  return { prices, pricesLoading, pricesError };
};
