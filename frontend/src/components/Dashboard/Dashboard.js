import React, { useEffect, useState } from "react";
import NavSide from "../Navigation/NavSide";
import NavHeader from "../Navigation/NavHeader";

import PrivateRoute from "../Account/PrivateRoute";
import AddPortfolioWatchlist from "../Portfolio/AddPortfolioWatchlist";
import DelPortfolioWatchlist from "../Portfolio/DelPortfolioWatchlist";
import ViewPortfolio from "../Portfolio/ViewPortfolio";
import ViewWatchlist from "../Portfolio/ViewWatchlist";
import AddingStock from "../Portfolio/AddingStock";
import UserProfile from "../Account/UserProfile";
import AllEstimatedGains from "../Tax/AllEstimatedGains";
import ViewPortfolioEstdGains from "../Tax/ViewPortfolioEstdGains";
import DividendsCalculator from "../Tax/DividendsCalculator";
import AllDividends from "../Tax/AllDividends";
import ViewPortfolioDividends from "../Tax/ViewPortfolioDividends";
import SearchResults from "../Search/SearchResults";
import { BrowserRouter, Switch } from "react-router-dom";
import SharpeRatio from "../SharpeRatio/SharpeRatio";
import Profile from "../CompanyProfile/Profile";
import { AppContext } from "../../Context";

import { useAuth } from "../Account/AuthContext";
import API from "../../API";
import ViewPortfolioSearchResults from "../Portfolio/ViewPortfolioSearchResults";
import { DayChartComponent } from "../Querying/DayChart";
import { IntraChartComponent } from "../Querying/IntraChart";
import { NewsComponent } from "../News/News";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [watchlists, setWatchlists] = useState([]);
  const [portfolios, setPortfolios] = useState([]);

  useEffect(() => {
    API.fetchWatchlists(currentUser.uid).then((result) =>
      setWatchlists(result.watchlists)
    );
    API.fetchPortfolios(currentUser.uid).then((result) =>
      setPortfolios(result.portfolios)
    );
  }, [loading]);

  const [lastUpdateTime, setLastUpdateTime] = useState("");
  const [sharpeList, setSharpeList] = useState([]);
  const [percents, setPercents] = useState([]);
  const [tickers, setTickers] = useState([]);

  return (
    <React.Fragment>
      <BrowserRouter>
        <AppContext.Provider
          value={{
            currentUser,
            loading,
            setLoading,
            watchlists,
            portfolios,
            lastUpdateTime,
            setLastUpdateTime,
            sharpeList,
            setSharpeList,
            percents,
            setPercents,
            tickers,
            setTickers,
          }}
        >
          <div className="menu-components">
            <NavHeader />
            <NavSide />
          </div>

          <Switch>
            <PrivateRoute path="/user-profile">
              <UserProfile />
            </PrivateRoute>

            <PrivateRoute path="/portfoliowatchlist/add">
              <AddPortfolioWatchlist />
            </PrivateRoute>

            <PrivateRoute path="/portfoliowatchlist/delete">
              <DelPortfolioWatchlist />
            </PrivateRoute>

            <PrivateRoute path="/portfolio/view/:pfid">
              <ViewPortfolio />
            </PrivateRoute>

            <PrivateRoute path="/watchlist/view/:wlid">
              <ViewWatchlist />
            </PrivateRoute>

            <PrivateRoute path="/add/:ticker">
              <AddingStock />
            </PrivateRoute>

            <PrivateRoute path="/tax/estdgains/view/:pfid">
              <ViewPortfolioEstdGains />
            </PrivateRoute>

            <PrivateRoute path="/tax/estdgains/all">
              <AllEstimatedGains />
            </PrivateRoute>

            <PrivateRoute path="/search/:searchTerm">
              <SearchResults />
            </PrivateRoute>

            <PrivateRoute path="/sharpe">
              <SharpeRatio />
            </PrivateRoute>

            <PrivateRoute path="/tax/dividends/calculator">
              <DividendsCalculator />
            </PrivateRoute>

            <PrivateRoute path="/tax/dividends/all">
              <AllDividends />
            </PrivateRoute>

            <PrivateRoute path="/tax/dividends/view/:pfid">
              <ViewPortfolioDividends />
            </PrivateRoute>
            <PrivateRoute path="/portfolioSearch/:pfid/:searchTerm">
              <ViewPortfolioSearchResults />
            </PrivateRoute>

            <PrivateRoute path="/query/daychart">
              <DayChartComponent />
            </PrivateRoute>

            <PrivateRoute path="/query/intrachart">
              <IntraChartComponent />
            </PrivateRoute>

            <PrivateRoute path="/news">
              <NewsComponent />
            </PrivateRoute>

            <PrivateRoute path="/company/:company/:region">
              <Profile />
            </PrivateRoute>
          </Switch>
        </AppContext.Provider>
      </BrowserRouter>
    </React.Fragment>
  );
}
