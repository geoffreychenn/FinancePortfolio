import { useState, useEffect } from "react";
import API from "../API";

const defaultPortfolio = {
  info: {
    name: "",
    user_id: "",
    portfolio_id: -1,
  },
  stocks: [],
};

export const usePortfolioFetch = (userid, pfid) => {
  const [portfolio, setPortfolio] = useState(defaultPortfolio);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioError, setPortfolioError] = useState("");

  const fetchPortfolio = async (userid, pfid) => {
    const portfolio_id = parseInt(pfid, 10);

    try {
      setPortfolioError("");
      setPortfolioLoading(true);
      const data = await API.fetchPortfolio(userid, portfolio_id);
      if (data.success) setPortfolio(data.portfolio);
      else setPortfolioError("Could not obtain portfolio");
    } catch (error) {
      setPortfolioError("Could not obtain portfolio");
    }
    setPortfolioLoading(false);
  };

  useEffect(() => {
    fetchPortfolio(userid, pfid);
  }, [userid, pfid]);

  return { portfolio, portfolioLoading, portfolioError };
};
