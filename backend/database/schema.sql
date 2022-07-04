DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS portfolios;
DROP TABLE IF EXISTS watchlists;
DROP TABLE IF EXISTS stocks;
DROP TABLE IF EXISTS watchlistStocks;

CREATE TABLE users (
    user_id     TEXT        NOT NULL PRIMARY KEY,
    email       TEXT        NOT NULL UNIQUE,
    logout      DATETIME    NOT NULL DEFAULT 0 
);

CREATE TABLE portfolios (
    portfolio_id    INTEGER         PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT            NOT NULL,
    name            TEXT            NOT NULL,
    FOREIGN KEY     (user_id)       REFERENCES users(user_id),
    UNIQUE          (user_id, name)
);

CREATE TABLE stocks (
    stock_id        INTEGER                 PRIMARY KEY AUTOINCREMENT,
    portfolio_id    INTEGER                 NOT NULL,
    ticker          TEXT                    NOT NULL,
    quantity        INTEGER                 NOT NULL,
    price           FLOAT                   NOT NULL,
    time            DATETIME                NOT NULL,
    region          TEXT                    NOT NULL,
    franked         FLOAT                   NOT NULL,
    exchange_rate   FLOAT                   NOT NULL,
    dividend_price  FLOAT                   NOT NULL DEFAULT 0,
    FOREIGN KEY     (portfolio_id)          REFERENCES portfolios(portfolio_id),
    UNIQUE          (portfolio_id, ticker, stock_id)
);

CREATE TABLE watchlists (
    watchlist_id    INTEGER         PRIMARY KEY AUTOINCREMENT,
    user_id         TEXT            NOT NULL,
    name            TEXT            NOT NULL,
    FOREIGN KEY     (user_id)       REFERENCES users(user_id),
    UNIQUE          (user_id, name)
);

CREATE TABLE watchlistStocks (
    stock_id        INTEGER                 PRIMARY KEY AUTOINCREMENT,
    watchlist_id    INTEGER                 NOT NULL,
    ticker          TEXT                    NOT NULL,
    region          TEXT            NOT NULL,
    FOREIGN KEY     (watchlist_id)          REFERENCES watchlists(watchlist_id),
    UNIQUE          (watchlist_id, ticker, stock_id)
);
