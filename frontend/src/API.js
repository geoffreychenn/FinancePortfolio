// Backend API

const API_URL = "http://localhost:42069";

const defaultConfig = {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
};

const apiMethods = {
  addUser: async (uid, email) => {
    // console.log("add user")
    const bodyData = {
      email: email,
      userid: uid,
    };
    const data = await (
      await fetch(`${API_URL}/addUser`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  updateEmail: async (oldEmail, newEmail) => {
    // console.log("test")
    const bodyData = {
      oldEmail: oldEmail,
      newEmail: newEmail,
    };
    const data = await (
      await fetch(`${API_URL}/updateEmail`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    // console.log(data.success)
    return !!data.success;
  },

  fetchPortfolios: async (uid) => {
    const bodyData = {
      userid: uid,
    };
    const data = await (
      await fetch(`${API_URL}/portfolios`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data;
    else return {};
  },

  addPortfolio: async (uid, n) => {
    const bodyData = {
      userid: uid,
      name: n,
    };
    return await (
        await fetch(`${API_URL}/addPortfolio`, {
          ...defaultConfig,
          body: JSON.stringify(bodyData),
        })
    ).json();
  },

  addStock: async (uid, pfid, quantity, ticker, price, franked) => {
    const bodyData = {
      userid: uid,
      portfolio_id: pfid,
      quantity: quantity,
      ticker: ticker,
      price: price,
      franked: franked,
    };
    // console.log(bodyData);
    const data = await (
      await fetch(`${API_URL}/addStock`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  fetchPortfolio: async (uid, pfid) => {
    const bodyData = {
      userid: uid,
      portfolio_id: pfid,
    };
    return await (
        await fetch(`${API_URL}/portfolio`, {
          ...defaultConfig,
          body: JSON.stringify(bodyData),
        })
    ).json();
  },

  fetchPrice: async (ticker) => {
    const bodyData = {
      ticker: ticker,
    };
    return await (
        await fetch(`${API_URL}/findStock`, {
          ...defaultConfig,
          body: JSON.stringify(bodyData),
        })
    ).json();
  },

  fetchCompanyName: async (ticker) => {
    const bodyData = {
      ticker: ticker,
    };
    return await (
        await fetch(`${API_URL}/stockName`, {
          ...defaultConfig,
          body: JSON.stringify(bodyData),
        })
    ).json();
  },

  deleteStocks: async (stock_id) => {
    const bodyData = {
      stock_id: stock_id,
    };
    const data = await (
      await fetch(`${API_URL}/deleteStocks`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  updateStocks: async (stock_id, quantity) => {
    const bodyData = {
      stock_id: stock_id,
      quantity: quantity,
    };
    const data = await (
      await fetch(`${API_URL}/updateStocks`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  fetchSearchResults: async (searchTerm) => {
    const bodyData = {
      searchTerm: searchTerm,
    };
    const data = await (
      await fetch(`${API_URL}/searchQuery`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return data.results;
  },

  fetchAusSearchResults: async (searchTerm) => {
    // console.log("fetchAusSearchResults started");
    const bodyData = {
      searchTerm: searchTerm,
    };
    const data = await (
      await fetch(`${API_URL}/searchQueryAUS`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return data.results;
  },

  addWatchlist: async (uid, n) => {
    const bodyData = {
      userid: uid,
      name: n,
    };
    return await (
        await fetch(`${API_URL}/addWatchlist`, {
          ...defaultConfig,
          body: JSON.stringify(bodyData),
        })
    ).json();
  },

  fetchWatchlists: async (uid) => {
    const bodyData = {
      userid: uid,
    };
    return await (
        await fetch(`${API_URL}/watchlists`, {
          ...defaultConfig,
          body: JSON.stringify(bodyData),
        })
    ).json();
  },

  fetchWatchlist: async (uid, pfid) => {
    const bodyData = {
      userid: uid,
      watchlist_id: pfid,
    };
    const data = await (
      await fetch(`${API_URL}/watchlist`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data;
  },

  addStockWatchlist: async (uid, wlid, ticker) => {
    const bodyData = {
      userid: uid,
      watchlist_id: wlid,
      ticker: ticker,
    };

    const data = await (
      await fetch(`${API_URL}/addStockWatchlist`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  removeStockWatchlist: async (wlid, ticker, region) => {
    const bodyData = {
      watchlist_id: wlid,
      ticker: ticker,
      region: region,
    };

    const data = await (
      await fetch(`${API_URL}/removeStockWatchlist`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  deleteWatchlist: async (uid, wlid) => {
    const bodyData = {
      userid: uid,
      watchlist_id: wlid,
    };
    const data = await (
      await fetch(`${API_URL}/deleteWatchlist`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  deletePortfolio: async (uid, pfid) => {
    const bodyData = {
      userid: uid,
      portfolio_id: pfid,
    };
    const data = await (
      await fetch(`${API_URL}/deletePortfolio`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  maxSharpeRatio: async (tickers) => {
    const bodyData = {
      tickers: tickers,
    };
    const data = await (
      await fetch(`${API_URL}/maxSharpeRatio`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data;
  },

  minRisk: async (tickers) => {
    const bodyData = {
      tickers: tickers,
    };
    const data = await (
      await fetch(`${API_URL}/minRisk`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data;
  },

  fetchEstimatedGains: async (uid, pfid) => {
    const bodyData = {
      userid: uid,
      portfolio_id: pfid,
    };
    const data = await (
      await fetch(`${API_URL}/estdGains`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data;
    else return false;
  },

  fetchAllEstimatedGains: async (uid, pfids) => {
    const bodyData = {
      userid: uid,
      portfolio_ids: pfids,
    };
    const data = await (
      await fetch(`${API_URL}/allEstdGains`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data;
    else return false;
  },

  fetchDividends: async (uid, pfid) => {
    const bodyData = {
      userid: uid,
      portfolio_id: pfid,
    };
    const data = await (
      await fetch(`${API_URL}/dividends`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data.data;
    else return false;
  },

  fetchAllDividends: async (uid, pfids) => {
    const bodyData = {
      userid: uid,
      portfolio_ids: pfids,
    };
    const data = await (
      await fetch(`${API_URL}/allDividends`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    if (data.success) return data.data;
    else return false;
  },

  updateDividends: async (uid, pfid, stkid, price) => {
    const bodyData = {
      userid: uid,
      portfolio_id: pfid,
      stock_id: stkid,
      price: price,
    };
    const data = await (
      await fetch(`${API_URL}/updateDividends`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },

  stockPrice: async (tickers) => {
    const bodyData = {
      tickers: tickers,
    };
    return await (
        await fetch(`${API_URL}/stockPrices`, {
          ...defaultConfig,
          body: JSON.stringify(bodyData),
        })
    ).json();
  },
  logout: async (uid) => {
    const bodyData = {
      uid: uid,
    };
    const data = await (
      await fetch(`${API_URL}/logout`, {
        ...defaultConfig,
        body: JSON.stringify(bodyData),
      })
    ).json();
    return !!data.success;
  },
};

export default apiMethods;
