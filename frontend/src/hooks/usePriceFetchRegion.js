import { useState, useEffect } from "react";
import API from "../API";

export const usePriceFetchRegion = (ticker, region) => {
  const [price, setPrice] = useState(-1);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState("");

  const fetchPriceRegion = async (ticker, region) => {
    try {
      if (region === "AU") {
        ticker = ticker + ".AU";
      }
      setPriceError("");
      setPriceLoading(true);
      const data = await API.fetchPrice(ticker);
      if (data.success) setPrice(data.price);
      else setPriceError("Sorry there was a problem adding this stock");
    } catch (error) {
      setPriceError("Sorry there was a problem adding this stock");
    }
    setPriceLoading(false);
  };

  useEffect(() => {
    fetchPriceRegion(ticker, region);
  }, [ticker, region]);

  return { price, priceLoading, priceError };
};
