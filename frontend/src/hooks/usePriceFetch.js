import { useState, useEffect } from "react";
import API from "../API";

export const usePriceFetch = (ticker) => {
  const [price, setPrice] = useState(-1);
  const [priceLoading, setPriceLoading] = useState(true);
  const [priceError, setPriceError] = useState("");

  const fetchPrice = async (ticker) => {
    try {
      setPriceError("");
      setPriceLoading(true);
      const data = await API.fetchPrice(ticker);
      if (data.success) setPrice(parseFloat(data.price));
      else setPriceError("Sorry there was a problem adding this stock");
    } catch (error) {
      setPriceError("Sorry there was a problem adding this stock");
    }
    setPriceLoading(false);
  };

  useEffect(() => {
    fetchPrice(ticker);
  }, [ticker]);

  return { price, priceLoading, priceError };
};
