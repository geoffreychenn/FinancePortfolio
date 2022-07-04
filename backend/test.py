import os
from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import requests
import io
import yfinance as yf
from datetime import datetime

pd.set_option("display.max_columns", 500)
pd.set_option("display.max_rows", 500)

TOKEN = os.getenv("ALPHAV_TOKEN")


def getIntradayData(symbol: str, interval: int) -> pd.DataFrame:
    function = "TIME_SERIES_INTRADAY"
    url = (
        f"https://www.alphavantage.co/query?function={function}&symbol={symbol}&interval={interval}min&apikey="
        f"{TOKEN}&datatype=csv"
    )
    result = requests.get(url).text
    data = pd.read_csv(io.StringIO(result))
    data["timestamp"] = pd.to_datetime(data["timestamp"])
    return data


def getDayData(symbol: str) -> pd.DataFrame:
    if "." in symbol:
        stock = yf.Ticker(symbol)
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
        url = f"https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol={symbol}&apikey={TOKEN}&datatype=csv&outputsize=full"
        result = requests.get(url).text
        data = pd.read_csv(io.StringIO(result))
        data = data.iloc[::-1]
    return data


def getNews():
    url = "https://mboum-finance.p.rapidapi.com/ne/news"
    host = "mboum-finance.p.rapidapi.com"
    key = "6bc5ac738emsh341da8bb9afec7ap1dd2d2jsn679fbb6bc010"
    result = requests.get(
        url, headers={"X-RapidAPI-Host": host, "X-RapidAPI-Key": key}
    ).text
    data = pd.read_json(io.StringIO(result))
    return data


def getCompanyNews(symbol: str) -> pd.DataFrame:
    stock = yf.Ticker(symbol)

    df = pd.DataFrame(stock.news)
    df.drop(["uuid"], axis=1, inplace=True)
    df.drop(["providerPublishTime"], axis=1, inplace=True)
    df.drop(["type"], axis=1, inplace=True)
    return df


def getCompanyInfo(symbol: str) -> pd.DataFrame:
    stock = yf.Ticker(symbol)
    info = stock.info
    df = pd.DataFrame.from_dict(info, orient="index")
    df["description"] = df.index
    df.rename(columns={0: "value"}, inplace=True)
    return df


def getCompanyHolders(symbol: str) -> pd.DataFrame:
    stock = yf.Ticker(symbol)
    holders = stock.institutional_holders
    return holders


def getCompanyEvents(symbol: str) -> pd.DataFrame:
    stock = yf.Ticker(symbol)
    events = stock.calendar
    events = events.T
    return events


def main():
    # df = getNews()
    # print(df.head())
    # print(df.info())
    print(getCompanyEvents("AMZN").info())


main()
