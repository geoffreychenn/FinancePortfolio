import { useState, useEffect } from "react";
import API from "../API";

export const useCompanyNameFetch = (ticker) => {
  const [companyName, setCompanyName] = useState("");
  const [companyNameLoading, setCompanyNameLoading] = useState(true);
  const [companyNameError, setCompanyNameError] = useState("");

  const fetchCompanyName = async (ticker) => {
    try {
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
    fetchCompanyName(ticker);
  }, [ticker]);

  return { companyName, companyNameLoading, companyNameError };
};
