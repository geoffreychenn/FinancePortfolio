import io
import os
from datetime import datetime

import numpy as np
import pandas as pd
import pandas_datareader as pdr
import requests
import yfinance as yf
from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin

import db_api as db

AV_API_KEY = "LLB9NRBXYJ17JYAV"
RAPID_API_KEY = "99f6025acamsh73bc5cdb6fcda7bp15307fjsnd3ca52d644e2"
TOKEN = os.getenv("ALPHAV_TOKEN")

app = Flask(__name__)
CORS(app)

prices = {}


# Check if time difference is less than duration
# Default 15 minutes duration
def checkTimeDiff(t: datetime, d=15):
    return (datetime.now() - t).total_seconds() < d * 60


# ===================== USER FUNCTIONS ===================== #


@app.route("/addUser", methods=["POST"])
@cross_origin()
def addUser():
    """
    Adds a user to the database
    :param uid: ID of the user
    :param email: Email of the user
    :return: True is successful, False otherwise
    """
    result = request.get_json(force=True)
    uid = result["userid"]
    email = result["email"]
    success = db.addUser(uid, email)

    if success:
        return jsonify(success=True)
    return jsonify(success=False)


@app.route("/userid", methods=["POST"])
@cross_origin()
def userID():
    """
    Gets the user ID of the user
    :param email: Email of the user
    :return: The user ID of the given email, defaults to -1 if not found
    """
    result = request.get_json(force=True)
    email = result["email"]
    userid = db.getUserID(email)

    if userid > 0:
        return jsonify({"userid": userid, "success": True})
    return jsonify({"userid": -1, "success": False})


@app.route("/updateEmail", methods=["POST"])
@cross_origin()
def updateEmail():
    """
    Updates the user's email
    :param oldEmail: The user's old email
    :param newEmail: The user's new email
    :return: newEmail and whether if it was successful
    """
    result = request.get_json(force=True)
    oldEmail = result["oldEmail"]
    newEmail = result["newEmail"]
    success = db.updateEmail(oldEmail, newEmail)

    return jsonify({"newEmail": newEmail, "success": success})


@app.route("/logout", methods=["POST"])
@cross_origin()
def logout():
    """
    Logs the user out of the application
    :param uid: ID of the user
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    uid = result["uid"]
    success = db.setLastLogout(uid)

    return jsonify(success=True)


# ===================== PORTFOLIO FUNCTIONS ===================== #


@app.route("/portfolio", methods=["POST"])
@cross_origin()
def getPortfolio():
    """
    Gets the portfolio of the user
    :params userid: ID of the user
    :params pfid: ID of the portfolio
    :return: Portfolio and its respective stocks if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    pfid = result["portfolio_id"]
    pf = db.getPortfolio(userid, pfid)
    stocks = db.getStocks(pfid)

    if pf is None or pf == {}:
        return jsonify(success=False)
    return jsonify({"success": True, "portfolio": {"info": pf, "stocks": stocks}})


@app.route("/portfolios", methods=["POST"])
@cross_origin()
def getAllPortfolios():
    """
    Gets all portfolios of the user
    :params userid: ID of the user
    :return: All portfolios if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    pfs = db.getUserPortfolios(userid)

    if pfs is None or pfs == []:
        return jsonify(success=False)
    return jsonify({"success": True, "portfolios": pfs})


@app.route("/addPortfolio", methods=["POST"])
@cross_origin()
def addPortfolio():
    """
    Adds a portfolio to the database
    :param userid: ID of the user
    :param name: Name of the portfolio
    :return: Portfolio ID if successful, error otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    name = result["name"]
    pfid, err = db.addPortfolio(userid, name)

    if pfid != -1:
        return jsonify({"success": True, "portfolio_id": pfid})
    return jsonify({"success": False, "error": err})


# Deletes a user's portfolio
@app.route("/deletePortfolio", methods=["POST"])
@cross_origin()
def deletePortfolio():
    """
    Deletes a portfolio from the database
    :param userid: ID of the user
    :param portfolio_id: ID of the portfolio
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    pfid = result["portfolio_id"]
    success = db.deletePortfolio(userid, pfid)

    if success:
        return jsonify(success=True)
    return jsonify(success=False)


# ===================== STOCKS FUNCTIONS ===================== #


@app.route("/getStocks", methods=["POST"])
@cross_origin()
def getStocks():
    """
    Gets all stocks of the portfolio
    :params portfolio_id: ID of the portfolio
    :return: All of the stocks of the portfolio
    """
    result = request.get_json(force=True)
    portfolio_id = result["portfolio_id"]
    stocks = db.getStocks(portfolio_id)

    return jsonify({"success": True, "stocks": stocks})


@app.route("/addStock", methods=["POST"])
@cross_origin()
def addStock():
    """
    Adds a stock to the portfolio
    :param portfolio_id: ID of the portfolio
    :param quantity: Quantity of the stock
    :param ticker: Ticker of the stock
    :param price: Price of the stock
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    portfolio_id = result["portfolio_id"]
    quantity = result["quantity"]
    ticker = result["ticker"]
    price = result["price"]
    frank = 0  # All US stocks are unfranked (e.g. 0% franked percentage)
    if ticker[-3:] == ".AU":
        exchange_rate = 1
        region = "AU"
        frank = result["franked"]
        ticker = ticker[:-3]
    else:
        currency = "USD"
        url = (
            f"https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency="
            f"{currency}&to_currency=AUD&apikey={AV_API_KEY}"
        )
        r = requests.get(url)
        data = r.json()
        data = data["Realtime Currency Exchange Rate"]
        exchange_rate = data["5. Exchange Rate"]
        region = "US"
    success = db.addStock(
        int(portfolio_id),
        int(quantity),
        ticker,
        float(price),
        float(exchange_rate),
        float(frank),
        region,
    )

    if success:
        return jsonify(success=True)
    return jsonify(success=False)


@app.route("/findStock", methods=["POST"])
@cross_origin()
def findStock():
    """
    Gets the price of a stock
    :params ticker: Ticker of the stock
    :return: Price of the stock
    """
    result = request.get_json(force=True)
    ticker = result["ticker"]
    saveTicker = ticker
    if saveTicker in prices.keys():
        if checkTimeDiff(prices[saveTicker][1]):
            price = prices[saveTicker][0]
            return jsonify({"price": price, "success": True})

        prices.pop(saveTicker)

    if ticker[-3:] == ".AU":
        ticker = ticker[:-3] + ".AX"
        url = "https://yh-finance.p.rapidapi.com/market/v2/get-quotes"
        querystring = {"region": "AU", "symbols": ticker}
        headers = {
            "x-rapidapi-host": "yh-finance.p.rapidapi.com",
            "x-rapidapi-key": RAPID_API_KEY,
        }
        response = requests.request("GET", url, headers=headers, params=querystring)
        r = response.json()
        r = r["quoteResponse"]
        r = r["result"]
        if r:
            r = r[0]
            price = r["regularMarketPrice"]
        else:
            return jsonify(success=False)
    else:
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={AV_API_KEY}"
        r = requests.get(url)
        data = r.json()
        data = data["Global Quote"]
        if data == {}:
            return jsonify(success=False)
        price = data["05. price"]
    prices[saveTicker] = [price, datetime.now()]
    return jsonify({"price": price, "success": True})


@app.route("/stockPrices", methods=["POST"])
@cross_origin()
def stockPrices():
    """
    Gets the prices of all given stocks
    :param tickers: List of tickers of stocks
    :return: Prices of the stocks
    """
    result = request.get_json(force=True)
    tickers = result["tickers"]
    currPrices = []
    for ticker in tickers:
        saveTicker = ticker
        if saveTicker in prices.keys():
            if checkTimeDiff(prices[saveTicker][1]):
                price = prices[saveTicker][0]
                currPrices.append(price)
            else:
                prices.pop(saveTicker)
        else:
            if ticker[-3:] == ".AU":
                ticker = ticker[:-3] + ".AX"
                url = "https://yh-finance.p.rapidapi.com/market/v2/get-quotes"
                querystring = {"region": "AU", "symbols": ticker}
                headers = {
                    "x-rapidapi-host": "yh-finance.p.rapidapi.com",
                    "x-rapidapi-key": RAPID_API_KEY,
                }
                response = requests.request(
                    "GET", url, headers=headers, params=querystring
                )
                r = response.json()
                r = r["quoteResponse"]
                r = r["result"]
                if r:
                    r = r[0]
                    price = r["regularMarketPrice"]
                else:
                    return jsonify(success=False)
            else:
                url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={ticker}&apikey={AV_API_KEY}"
                r = requests.get(url)
                data = r.json()
                data = data["Global Quote"]
                if data == {}:
                    return jsonify(success=False)
                price = data["05. price"]
            prices[saveTicker] = [price, datetime.now()]
            currPrices.append(price)

    return jsonify(success=True, prices=currPrices)


@app.route("/stockName", methods=["POST"])
@cross_origin()
def stockName():
    """
    Gets the name of a stock
    :param ticker: Ticker of the stock
    :return: Name of the stock
    """
    result = request.get_json(force=True)
    ticker = result["ticker"]
    if ticker[-3:] == ".AU":
        ticker = ticker[:-3] + ".AX"
        url = "https://yh-finance.p.rapidapi.com/market/v2/get-quotes"

        querystring = {"region": "AU", "symbols": ticker}

        headers = {
            "x-rapidapi-host": "yh-finance.p.rapidapi.com",
            "x-rapidapi-key": RAPID_API_KEY,
        }

        response = requests.request("GET", url, headers=headers, params=querystring)
        r = response.json()
        r = r["quoteResponse"]
        r = r["result"]
        if r:
            r = r[0]
            name = r["longName"]
        else:
            name = "unknown"
    else:
        url = f"https://www.alphavantage.co/query?function=OVERVIEW&symbol={ticker}&apikey={AV_API_KEY}"
        r = requests.get(url)
        data = r.json()
        name = data["Name"]

    return jsonify({"name": name})


# ===================== SEARCH FUNCTIONS ===================== #
# Handles search queries. Expects the search terms to be passed through the url
# path = "/search/:searchTerm"
# fix this after we've got stuff sorta connected
@app.route("/searchQuery", methods=["POST"])
@cross_origin()
def searchQuery():
    """
    Searches for stocks based on the search term
    :param searchTerm: Search term
    :return: List of stocks that match the search term
    """
    result = request.get_json(force=True)
    searchTerm = result["searchTerm"]
    # this url needs be fixed with whatever search function we end up needing
    url = f"https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords={searchTerm}&apikey={AV_API_KEY}"
    r = requests.get(url)
    data = r.json()
    if data == {}:
        results = "unknown"
    else:
        results = data["bestMatches"]  # This needs to change

    # fix the bestMatchEntry
    search = []
    for i in range(len(results)):
        if results[i]["4. region"] == "United States":
            results[i] = fixBestMatchEntry(results[i])
            search.append(results[i])
    return jsonify({"results": search})


# ASX searching
@app.route("/searchQueryAUS", methods=["POST"])
@cross_origin()
def searchQueryAUS():
    """
    Searches for AU stocks based on the search term
    :param searchTerm: Search term
    :return: List of AU stocks that match the search term
    """
    reqjson = request.get_json(force=True)
    searchTerm = reqjson["searchTerm"]
    searchTerm = (
        searchTerm + ".AX"
    )  # AX must be appended for searching the AU stock market

    url = "https://yh-finance.p.rapidapi.com/auto-complete"
    querystring = {"q": searchTerm, "region": "AU"}
    headers = {
        "x-rapidapi-host": "yh-finance.p.rapidapi.com",
        "x-rapidapi-key": RAPID_API_KEY,
    }
    response = requests.request("GET", url, headers=headers, params=querystring)
    data = response.json()
    dataFixed = []
    for q in range(len(data["quotes"])):
        dataFixed.append(YHFinanceToAVFormat(data["quotes"][q]))
    return jsonify({"results": dataFixed})


# helps convert to the format that we want for usage
# this will also strip the AX from the symbol
def YHFinanceToAVFormat(d):
    fixedDict = {
        "symbol": d["symbol"][0:-3],
        "name": d["shortname"],
        "long name": d["longname"],
        "type": d["typeDisp"],
        "region": d["exchDisp"],
    }

    return fixedDict


# fixes Alpha Vantage's strange naming scheme for BestMatch
def fixBestMatchEntry(d):
    d["symbol"] = d.pop("1. symbol")
    d["name"] = d.pop("2. name")
    d["type"] = d.pop("3. type")
    d["region"] = d.pop("4. region")
    d["marketOpen"] = d.pop("5. marketOpen")
    d["marketClose"] = d.pop("6. marketClose")
    d["timezone"] = d.pop("7. timezone")
    d["currency"] = d.pop("8. currency")
    d["matchScore"] = d.pop("9. matchScore")
    return d


def print_dictionary(d):
    for k in d.keys():
        print("=================")
        print(k)
        print(d[k])


def print_results(results):
    print("Python search results:")
    for i in results:
        print(i)


@app.route("/updateStocks", methods=["POST"])
@cross_origin()
def updateStocks():
    """
    Updates a stock in the database
    :param stock_id: ID of the stock in the database
    :param quantity: New quantity of the stock
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    stock_id = result["stock_id"]
    quantity = result["quantity"]
    success = db.updateStocks(stock_id, quantity)
    if success:
        return jsonify(success=True)
    return jsonify(success=False)


@app.route("/deleteStocks", methods=["POST"])
@cross_origin()
def deleteStocks():
    """
    Deletes a stock from the database
    :param stock_id: ID of the stock in the database
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    stock_id = result["stock_id"]
    success = db.deleteStocks(stock_id)
    if success:
        return jsonify(success=True)
    return jsonify(success=False)


# ===================== WATCHLIST FUNCTIONS ===================== #


@app.route("/addWatchlist", methods=["POST"])
@cross_origin()
def addWatchlist():
    """
    Adds a new watchlist to the database
    :param userid: ID of the user
    :param name: Name of the watchlist
    :return: watchlist_id if successful, error otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    name = result["name"]
    wlid, err = db.addWatchlist(userid, name)
    if wlid != -1:
        return jsonify({"success": True, "watchlist_id": wlid})
    return jsonify({"success": False, "error": err})


@app.route("/watchlists", methods=["POST"])
@cross_origin()
def getAllWatchlists():
    """
    Returns list of all watchlists for user
    :param userid: ID of the user
    :return: List of all watchlists if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    wls = db.getUserWatchlists(userid)
    if wls is None or wls == []:
        return jsonify(success=False)
    return jsonify({"success": True, "watchlists": wls})


@app.route("/watchlist", methods=["POST"])
@cross_origin()
def getWatchlist():
    """
    Returns watchlist info and stocks for given watchlist
    :param userid: ID of the user
    :param watchlist_id: ID of the watchlist
    :return: Watchlist info and all of its respective stocks if successful, False otherwise
    """
    result = request.get_json(force=True)
    # print(f"getWatchlist: {reqjson}")
    userid = result["userid"]
    wlid = result["watchlist_id"]
    wl = db.getWatchlist(userid, wlid)
    stocks = db.getWatchlistStocks(wlid)
    if wl is None or wl == {}:
        return jsonify(success=False)
    return jsonify({"success": True, "watchlist": {"info": wl, "stocks": stocks}})


@app.route("/addStockWatchlist", methods=["POST"])
@cross_origin()
def addStockWatchlist():
    """
    Adds a stock to the watchlist
    :param watchlist_id: ID of the watchlist
    :param ticker: Ticker of the stock
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    wlid = result["watchlist_id"]
    ticker = result["ticker"]
    region = "US"
    if ticker[-3:] == ".AU":
        region = "AU"
        ticker = ticker[:-3]
    success = db.addStockWatchlist(wlid, ticker, region)
    if success:
        return jsonify(success=True)
    return jsonify(success=False)


@app.route("/removeStockWatchlist", methods=["POST"])
@cross_origin()
def removeStockWatchlist():
    """
    Removes a stock from the watchlist
    :param watchlist_id: ID of the watchlist
    :param ticker: Ticker of the stock
    :param region: Region of the stock
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    wlid = result["watchlist_id"]
    ticker = result["ticker"]
    region = result["region"]
    success = db.removeStockWatchlist(wlid, ticker, region)
    if success:
        return jsonify(success=True)
    return jsonify(success=False)


@app.route("/deleteWatchlist", methods=["POST"])
@cross_origin()
def deleteWatchlist():
    """
    Deletes a watchlist from the database
    :param userid: ID of the user
    :param watchlist_id: ID of the watchlist
    :return: True if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    wlid = result["watchlist_id"]
    success = db.deleteWatchlist(userid, wlid)
    if success:
        return jsonify(success=True)
    return jsonify(success=False)


@app.route("/getIntraDay", methods=["GET"])
@cross_origin()
def getIntraDay():
    """
    Gets the intraday data for a stock
    :param symbol: Ticker of the stock
    :param interval: Interval of the data (5min, 10min, etc)
    :return: Intraday data of the stock as CSV
    """
    content = request.get_json(force=True)
    symbol = content["symbol"]
    interval = content["interval"]
    url = (
        f"https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol={symbol}&interval={interval}min"
        f"&apikey={AV_API_KEY}&datatype=csv&outputsize=full"
    )
    result = requests.get(url).text
    data = pd.read_csv(io.StringIO(result))
    data = data.iloc[::-1]
    return Response(data.to_csv())


@app.route("/getDay", methods=["GET"])
@cross_origin()
def getDay():
    """
    Gets the historical data for a stock
    :param symbol: Ticker of the stock
    :param region: Region of the stock
    :return: Historical data of the stock as CSV
    """
    content = request.args
    symbol = content["symbol"]
    region = content["region"]
    if region == "AU":
        stock = yf.Ticker(symbol + ".AX")
        data = stock.history(period="max")
        data["timestamp"] = data.index
        data = data.rename(
            columns={
                "Open": "open",
                "High": "high",
                "Low": "low",
                "Close": "close",
                "Volume": "volume",
            },
        )
    else:
        url = (
            f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol}&apikey="
            f"{AV_API_KEY}&datatype=csv&outputsize=full "
        )

        result = requests.get(url).text
        data = pd.read_csv(io.StringIO(result))
        data = data.iloc[::-1]
    return Response(data.to_csv())


@app.route("/getNews", methods=["GET"])
@cross_origin()
def getNews():
    """
    Gets the recent general financial news
    :return: Recent financial news as CSV
    """
    url = "https://mboum-finance.p.rapidapi.com/ne/news"
    host = "mboum-finance.p.rapidapi.com"
    key = "6bc5ac738emsh341da8bb9afec7ap1dd2d2jsn679fbb6bc010"
    result = requests.get(
        url, headers={"X-RapidAPI-Host": host, "X-RapidAPI-Key": key}
    ).text
    data = pd.read_json(io.StringIO(result))
    return Response(data.to_csv())


@app.route("/getNewsByTicker", methods=["GET"])
@cross_origin()
def getNewsByTicker():
    """
    Gets the news of a stock
    :param symbol: Ticker of a stock
    :param region: Region of a stock
    :return: Recent news of the stock as CSV
    """
    content = request.args
    symbol = content["symbol"]
    region = content["region"]
    if region == "AU":
        symbol += ".AX"
    stock = yf.Ticker(symbol)
    df = pd.DataFrame(stock.news)
    return Response(df.to_csv())


@app.route("/getInfoByTicker", methods=["GET"])
@cross_origin()
def getInfoByTicker():
    """
    Gets the information of a stock
    :param symbol: Ticker of the stock
    :param region: Region of the stock
    :return: General information of the stock as CSV
    """
    content = request.args
    symbol = content["symbol"]
    region = content["region"]
    if region == "AU":
        symbol += ".AX"
    stock = yf.Ticker(symbol)
    info = stock.info
    df = pd.DataFrame.from_dict(info, orient="index")
    df["description"] = df.index
    df.rename(columns={0: "value"}, inplace=True)
    return Response(df.to_csv())


@app.route("/getHoldersByTicker", methods=["GET"])
@cross_origin()
def getHoldersByTicker():
    """
    Gets the major shareholders of a stock
    :param symbol: Ticker of the stock
    :param region: Region of the stock
    :return: Major shareholders of the stock as CSV
    """
    content = request.args
    symbol = content["symbol"]
    region = content["region"]
    if region == "AU":
        symbol += ".AX"
    stock = yf.Ticker(symbol)
    df = stock.institutional_holders
    return Response(df.to_csv())


@app.route("/getEarningsByTicker", methods=["GET"])
@cross_origin()
def getEarningsByTicker():
    """
    Gets upcoming earnings events of a stock
    :param symbol: Ticker of the stock
    :param region: Region of the stock
    :return: Upcoming earnings events of the stock as CSV
    """
    content = request.args
    symbol = content["symbol"]
    region = content["region"]
    if region == "AU":
        symbol += ".AX"
    stock = yf.Ticker(symbol)
    events = stock.calendar
    events = events.T
    return Response(events.to_csv())


# Returns watchlist info and stocks for given watchlist
@app.route("/getWatchlistPerformer", methods=["GET"])
@cross_origin()
def getWatchlistPerformer():
    """
    Gets the stocks of a watchlist sorted by intraday performance
    :param watchlist_id: ID of the watchlist
    :return: All of the stocks of a watchlist sorted by intraday performance
    """
    content = request.args
    watchlistID = content["watchlist_id"]
    stocks = db.getWatchlistStocks(watchlistID)
    stocks_df = pd.DataFrame(stocks)
    changes = []
    for i, r in stocks_df.iterrows():
        symbol = r["ticker"]
        if r["region"] == "AU":
            symbol += ".AX"
        stock = yf.Ticker(symbol)
        info = stock.info
        open_price = info["open"]
        current_price = info["currentPrice"]
        change = (current_price - open_price) / open_price * 100
        change = "{:,.2f}".format(change)
        changes.append(change)
    stocks_df["change"] = changes
    stocks_df = stocks_df.sort_values(by=["change"], ascending=False)
    stocks_df["change"] = stocks_df["change"] + "%"
    return Response(stocks_df.to_csv())


@app.route("/getPortfolioPerformer", methods=["GET"])
@cross_origin()
def getPortfolioPerformer():
    """
    Gets the stocks of a portfolio sorted by intraday performance
    :param portfolio_id: ID of the portfolio
    :return: All of the stocks of a portfolio sorted by intraday performance
    """
    content = request.args
    portfolioID = content["portfolio_id"]
    stocks = db.getStocks(portfolioID)
    solo = []
    checked = []
    for s in stocks:
        if s["ticker"] not in checked:
            checked.append(s["ticker"])
            solo.append(s)
    stocks_df = pd.DataFrame(solo)
    changes = []

    for i, r in stocks_df.iterrows():
        symbol = r["ticker"]
        if r["region"] == "AU":
            symbol += ".AX"

        stock = yf.Ticker(symbol)
        info = stock.info
        open_price = info["open"]
        current_price = info["currentPrice"]
        change = (current_price - open_price) / open_price * 100
        changes.append(round(change, 2))
    stocks_df["change"] = changes
    stocks_df = stocks_df.sort_values(by=["change"], ascending=False)

    return Response(stocks_df.to_csv())


@app.route("/getPortfolioPerformerLastLogout", methods=["GET"])
@cross_origin()
def getPortfolioPerformerLastLogout():
    """
    Gets the stocks of a portfolio sorted by performance since last logout
    :param portfolio_id: ID of the portfolio
    :param user_id: ID of the user
    :return: All of the stocks of a portfolio sorted by performance since last logout
    """
    content = request.args
    portfolioID = content["portfolio_id"]
    uid = content["user_id"]
    stocks = db.getStocks(portfolioID)
    solo = []
    checked = []
    for s in stocks:
        if s["ticker"] not in checked:
            checked.append(s["ticker"])
            solo.append(s)

    stocks_df = pd.DataFrame(solo)
    end = datetime.now()
    start = db.getLastLogout(uid)

    changes = []

    for i, r in stocks_df.iterrows():
        symbol = r["ticker"]
        if r["region"] == "AU":
            symbol += ".AX"
        stock = yf.Ticker(symbol)
        if start != 0 and start != -1:
            start = datetime.strptime(start, "%Y-%m-%d %H:%M:%S")
            his = stock.history(start=start, end=end)
        else:
            his = stock.history(start=end, end=end)
        if his.index.size == 0:
            info = stock.info
            open_price = info["open"]
            current_price = info["currentPrice"]
            change = (current_price - open_price) / open_price * 100
            change = "{:,.2f}".format(change)
            changes.append(change)
        else:
            info = stock.info
            open_price = his.iloc[0]["Open"]
            current_price = info["currentPrice"]
            change = (current_price - open_price) / open_price * 100
            # change = '{:,.2f}'.format(change)

            changes.append(round(change, 2))
        # checked.append(symbol)
    stocks_df["change"] = changes
    stocks_df.sort_values(by=["change"], ascending=False, inplace=True)
    return Response(stocks_df.to_csv())


@app.route("/", methods=["GET"])
@cross_origin()
def test():
    return jsonify({"msg": "Server running"})


# ===================== TAX FUNCTIONS ===================== #


@app.route("/estdGains", methods=["POST"])
@cross_origin()
def estimatedGains():
    """
    Calculates estimated gains of a portfolio
    :param portfolio_id: ID of the portfolio
    :return: Estimated gains if successful, False otherwise
    """
    result = request.get_json(force=True)
    pfid = result["portfolio_id"]
    data = calcEstimatedGains(pfid)
    return jsonify({"success": True, "data": data})


@app.route("/allEstdGains", methods=["POST"])
@cross_origin()
def allEstimatedGains():
    """
    Calculates estimates gains for all given portfolios
    :param userid: ID of the user
    :param portfolio_ids: List of IDs of portfolios
    :return: Estimated gains of each portfolio if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    pfids = result["portfolio_ids"]

    allGains = []
    for pfid in pfids:
        data = calcEstimatedGains(pfid)
        data["portfolio_id"] = pfid
        data["name"] = db.getPortfolioName(userid, pfid)
        allGains.append(data)

    now = datetime.now()
    t = now.strftime("%H:%M:%S %d/%m/%Y")

    return jsonify({"success": True, "data": allGains, "time": t})


# Store gains recently calculated
# prevGains = {pfid: [time, data]}
prevGains = {}


def calcEstimatedGains(pfid):
    # Get stocks for pf
    stocks = db.getStocks(pfid)

    # Check if this pf has been calculated recently
    if (
        prevGains.get(pfid) is not None
        and checkTimeDiff(prevGains.get(pfid)[0])
        and len(stocks) == len(prevGains.get(pfid)[1]["stocks"])
    ):
        return prevGains.get(pfid)[1]

    currentValues = []
    costInvestments = []

    # Fetch prices for each unique ticker
    currPrices = {}
    for stock in stocks:
        currPrices[stock["ticker"] + "." + stock["region"]] = None

    for tkr in currPrices.keys():
        if tkr[-3:] == ".AU":
            ticker = tkr[:-3] + ".AX"
            data = yf.Ticker(ticker)
            if data != {}:
                price = data.info["currentPrice"]
                currPrices[tkr] = price

        else:
            url = (
                "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol="
                + tkr[:-3]
                + "&apikey="
                + AV_API_KEY
            )
            r = requests.get(url)
            data = r.json()
            data = data["Global Quote"]
            if data != {}:
                price = data["05. price"]
                currPrices[tkr] = price

    # Calculate Current price and Cost
    for stock in stocks:
        # print(stock["ticker"])
        price = currPrices.get(stock["ticker"] + "." + stock["region"])

        if data == {}:
            currentValues.append(0)
            costInvestments.append(0)
            continue

        # price = data['05. price']
        currentValues.append(float(price) * stock["quantity"] * stock["exchange_rate"])
        costInvestments.append(
            stock["price"] * stock["quantity"] * stock["exchange_rate"]
        )

    # Calculate ROI
    # ROI = (CV - CI)/CI
    rois = []
    for i in range(len(currentValues)):
        rois.append((currentValues[i] - costInvestments[i]) / costInvestments[i])

    # Calculate Portfolio Weight
    # PW = V/TV
    weights = []
    totalValue = sum(currentValues)
    for val in currentValues:
        weights.append(val / totalValue * 100)

    # Calculate Portfolio Return
    # PR = SUM(ROI*PW)
    prs = []
    for i in range(len(rois)):
        prs.append(rois[i] * weights[i])
    totalReturn = sum(prs)

    stklist = []
    for i, stock in enumerate(stocks):
        data = stock
        data["calc"] = {
            "cost": costInvestments[i],
            "current": currentValues[i],
            "weight": weights[i],
            "return": prs[i],
        }
        stklist.append(data)

    now = datetime.now()
    t = now.strftime("%H:%M:%S %d/%m/%Y")

    data = {"stocks": stklist, "totalReturn": totalReturn, "time": t}
    prevGains[pfid] = [now, data]
    return data


@app.route("/dividends", methods=["POST"])
@cross_origin()
def getDividends():
    """
    Calculates estimated dividends of a portfolio
    :param userid: ID of the user
    :param portfolio_id: ID of the portfolio
    :return: ID, Name, and list of stocks of the portfolio if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    pfid = result["portfolio_id"]
    stocks = db.getStocks(pfid)
    data = {
        "portfolio_id": pfid,
        "name": db.getPortfolioName(userid, pfid),
        "stocks": stocks,
    }
    return jsonify({"success": True, "data": data})


@app.route("/allDividends", methods=["POST"])
@cross_origin()
def allDividends():
    """
    Calculates estimated dividends of all given portfolios
    :param userid: ID of the user
    :param portfolio_ids: List of IDs of the portfolios
    :return: List of ID, Name, list of stocks of each portfolio if successful, False otherwise
    """
    result = request.get_json(force=True)
    userid = result["userid"]
    pfids = result["portfolio_ids"]

    allDividends = []
    for pfid in pfids:
        stocks = db.getStocks(pfid)
        data = {
            "portfolio_id": pfid,
            "name": db.getPortfolioName(userid, pfid),
            "stocks": stocks,
        }
        allDividends.append(data)

    return jsonify({"success": True, "data": allDividends})


@app.route("/updateDividends", methods=["POST"])
@cross_origin()
def updateDividends():
    """
    Updates the dividend price of a stock
    :param portfolio_id: ID of the portfolio
    :param stock_id: ID of the stock
    :param price: New dividend price
    :return: Success if successful, False otherwise
    """
    result = request.get_json(force=True)
    pfid = result["portfolio_id"]
    stkid = result["stock_id"]
    price = result["price"]
    success = db.updateDividends(pfid, stkid, price)
    if success:
        return jsonify({"success": True})
    return jsonify({"success": False})


# ===================== SHARPE FUNCTIONS ===================== #


@app.route("/maxSharpeRatio", methods=["POST"])
@cross_origin()
def maxSharpeRatio():
    """
    Maximizes the Sharpe Ratio of the given stocks
    :param tickers: List of tickers of stocks
    :return: Percentage allocation and error of each stock if successful, False otherwise
    """
    result = request.get_json(force=True)
    tickers = result["tickers"]
    size = len(tickers)
    if size == 0:
        return jsonify({"success": False})

    start = datetime(2020, 1, 1)
    data = pdr.get_data_yahoo(tickers, start)
    data = data["Adj Close"]
    data = data.iloc[::-1]

    stock_ret = data.pct_change()  # stock returns

    mean_returns = stock_ret.mean()  # mean returns

    cov_matrix = stock_ret.cov()  # covariance matrix

    def sim():
        n = 5000
        sim_res = np.zeros((4 + len(tickers) - 1, n))

        for i in range(n):
            weights = np.array(np.random.random(size))
            weights /= np.sum(weights)

            portfolio_return = np.sum(mean_returns * weights)
            portfolio_std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

            sim_res[0, i] = portfolio_return
            sim_res[1, i] = portfolio_std

            sim_res[2, i] = portfolio_return / portfolio_std
            for j in range(len(weights)):
                sim_res[j + 3, i] = weights[j]

        return sim_res

    col = ["ret", "std", "sharpe"]
    cols = np.concatenate((col, tickers))
    res = sim()
    frame1 = pd.DataFrame(res.T, columns=cols)
    res = sim()
    frame2 = pd.DataFrame(res.T, columns=cols)
    res = sim()
    frame3 = pd.DataFrame(res.T, columns=cols)

    max_sharpe_1 = frame1.iloc[frame1["sharpe"].idxmax()]
    max_sharpe_2 = frame2.iloc[frame2["sharpe"].idxmax()]
    max_sharpe_3 = frame3.iloc[frame3["sharpe"].idxmax()]
    percents = []
    errors = []
    for ticker in tickers:
        error = (
            max(max_sharpe_1[ticker], max_sharpe_2[ticker], max_sharpe_3[ticker])
            - min(max_sharpe_1[ticker], max_sharpe_2[ticker], max_sharpe_3[ticker])
        ) / 2
        val = (max_sharpe_1[ticker] + max_sharpe_2[ticker] + max_sharpe_3[ticker]) / 3
        percents.append(val)
        errors.append(error)
    return jsonify({"success": True, "percents": percents, "errors": errors})


@app.route("/minRisk", methods=["POST"])
@cross_origin()
def minRisk():
    """
    Minimizes the risk of the given stocks
    :param tickers: List of tickers of stocks
    :return: Percentage allocation and error of each stock if successful, False otherwise
    """
    result = request.get_json(force=True)
    tickers = result["tickers"]
    size = len(tickers)
    if size == 0:
        return jsonify(success=False)

    start = datetime(2020, 1, 1)
    data = pdr.get_data_yahoo(tickers, start)
    data = data["Adj Close"]
    data = data.iloc[::-1]

    stock_ret = data.pct_change()  # stock returns

    mean_returns = stock_ret.mean()  # mean returns

    cov_matrix = stock_ret.cov()  # covariance matrix

    def sim():
        n = 5000
        sim_res = np.zeros((4 + len(tickers) - 1, n))

        for i in range(n):
            weights = np.array(np.random.random(size))
            weights /= np.sum(weights)

            portfolio_return = np.sum(mean_returns * weights)
            portfolio_std = np.sqrt(np.dot(weights.T, np.dot(cov_matrix, weights)))

            sim_res[0, i] = portfolio_return
            sim_res[1, i] = portfolio_std

            sim_res[2, i] = portfolio_return / portfolio_std
            for j in range(len(weights)):
                sim_res[j + 3, i] = weights[j]

        return sim_res

    col = ["ret", "std", "sharpe"]
    cols = np.concatenate((col, tickers))
    res = sim()
    frame1 = pd.DataFrame(res.T, columns=cols)
    res = sim()
    frame2 = pd.DataFrame(res.T, columns=cols)
    res = sim()
    frame3 = pd.DataFrame(res.T, columns=cols)
    max_risk_1 = frame1.iloc[frame1["std"].idxmin()]
    max_risk_2 = frame2.iloc[frame2["std"].idxmin()]
    max_risk_3 = frame3.iloc[frame3["std"].idxmin()]
    percents = []
    errors = []
    for ticker in tickers:
        error = (
            max(max_risk_1[ticker], max_risk_2[ticker], max_risk_3[ticker])
            - min(max_risk_1[ticker], max_risk_2[ticker], max_risk_3[ticker])
        ) / 2
        val = (max_risk_1[ticker] + max_risk_2[ticker] + max_risk_3[ticker]) / 3
        percents.append(val)
        errors.append(error)
    return jsonify({"success": True, "percents": percents, "errors": errors})
