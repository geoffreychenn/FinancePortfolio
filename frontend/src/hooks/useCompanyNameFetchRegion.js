import { useState, useEffect } from "react";
import API from "../API";

export const useCompanyNameFetchRegion = (ticker, region) => {
  const [companyName, setCompanyName] = useState("");
  const [companyNameLoading, setCompanyNameLoading] = useState(true);
  const [companyNameError, setCompanyNameError] = useState("");

  const fetchCompanyNameRegion = async (ticker, region) => {
    try {
      if (region === "AU") {
        ticker = ticker + ".AU";
      }
      setCompanyNameError("");
      setCompanyNameLoading(true);
      const data = await API.fetchCompanyName(ticker);
      setCompanyName(data.name);
    } catch (error) {
      setCompanyNameError("Could not find company name");
    }
    setCompanyNameLoading(false);
  };

  useEffect(() => {
    fetchCompanyNameRegion(ticker, region);
  }, [ticker]);

  return { companyName, companyNameLoading, companyNameError };
};
