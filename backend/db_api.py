import sqlite3
import re
from datetime import datetime


# Executes command
# Should only use for one-off database manipulation
def executeCmd(cmd) -> bool:
    conn = getConnection()
    conn.execute(cmd)
    conn.commit()
    conn.close()
    return


# ===================== DATABASE FUNCTIONS ===================== #

# Converts a row to dict
def row2dict(row) -> dict:
    if row is None:
        return {}
    d = {}
    for k in row.keys():
        d[k] = row[k]
    return d


# Converts list of rows to list of dicts
def rows2list(rows) -> list:
    if rows is None:
        return []
    list = []
    for row in rows:
        list.append(row2dict(row))
    return list


# Get connection to database
def getConnection() -> sqlite3.Connection:
    conn = sqlite3.connect("database/database.db")
    conn.row_factory = sqlite3.Row
    return conn


def clearDB(areyousure=False):
    if not areyousure:
        return
    conn = getConnection()
    conn.execute(
        """DELETE
                    FROM users"""
    )
    conn.execute(
        """DELETE
                    FROM sqlite_sequence
                    WHERE name=(?)""",
        ("users",),
    )

    conn.execute(
        """DELETE
                    FROM portfolios"""
    )
    conn.execute(
        """DELETE
                    FROM sqlite_sequence
                    WHERE name=(?)""",
        ("portfolios",),
    )

    conn.execute(
        """DELETE
                    FROM stocks"""
    )
    conn.execute(
        """DELETE
                    FROM sqlite_sequence
                    WHERE name=(?)""",
        ("stocks",),
    )

    conn.execute(
        """DELETE
                    FROM watchlists"""
    )
    conn.execute(
        """DELETE
                    FROM sqlite_sequence
                    WHERE name=(?)""",
        ("watchlists",),
    )

    conn.execute(
        """DELETE
                    FROM watchlistStocks"""
    )
    conn.execute(
        """DELETE
                    FROM sqlite_sequence
                    WHERE name=(?)""",
        ("watchlistStocks",),
    )

    conn.commit()
    conn.close()


# ===================== USER FUNCTIONS ===================== #

# Returns the users id number from given email
def getUserID(email) -> int:
    conn = getConnection()
    user = conn.execute(
        """SELECT *
                        FROM users
                        WHERE email = ?""",
        (email,),
    ).fetchone()
    conn.close()
    if user is None:
        return -1
    return user["user_id"]


# Adds user with email to database
def addUser(uid, email) -> bool:
    conn = getConnection()
    try:
        conn.execute(
            """INSERT INTO users (user_id, email) 
                     VALUES (?, ?)""",
            (uid, email),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        # Email not unique
        conn.close()
        return False
    conn.close()
    return True


def getUser(email) -> dict:
    conn = getConnection()
    user = conn.execute(
        """SELECT users.email, portfolios.name
                        FROM users
                        LEFT JOIN portfolios
                        ON users.user_id = portfolios.user_id
                        WHERE email = ?""",
        (email,),
    ).fetchone()
    conn.close()
    return row2dict(user)


def updateEmail(oldEmail, newEmail) -> bool:
    conn = getConnection()
    uid = getUserID(oldEmail)
    if uid != -1:
        conn.execute(
            """UPDATE users SET email = ? WHERE user_id = ?""", (newEmail, uid)
        )
        conn.commit()
    else:
        return False
    conn.close()
    return True


def getLastLogout(uid):
    conn = getConnection()
    logout = conn.execute(
        """SELECT *
                    FROM users
                    WHERE user_id = ?""",
        (uid,),
    ).fetchone()
    conn.close()
    if logout is None:
        return -1
    return logout["logout"]


def setLastLogout(uid):
    date = datetime.now()
    # date = b = datetime(2017, 11, 28, 23, 55, 59, 342380)
    date = date.strftime("%Y-%m-%d %H:%M:%S")
    conn = getConnection()
    if uid != -1:
        conn.execute("""UPDATE users SET logout = ? WHERE user_id = ?""", (date, uid))
        conn.commit()
    else:
        return False
    conn.close()
    return True


# ===================== PORTFOLIO FUNCTIONS ===================== #

# Returns list of all portfolios of given user
def getUserPortfolios(userid) -> list:
    if userid == "" or userid is None:
        # Invalid user id
        return None
    conn = getConnection()
    portfolios = conn.execute(
        """SELECT * 
                              FROM portfolios
                              WHERE user_id = ?
                              ORDER BY portfolio_id""",
        (userid,),
    ).fetchall()
    conn.close()
    return rows2list(portfolios)


# Adds portfolio with given name to given user
# Returns true if successful otherwise false
def addPortfolio(userid, name) -> int:
    if userid == "" or userid is None:
        # Invalid user id
        return False, "Could not find user"
    pattern = re.compile("^([a-zA-Z0-9()\[\]<>/?\"'!@#$%^&*_ ]{1,32})$")
    if not pattern.match(name):
        # Portfolio name is invalid
        return False, "Portfolio name is invalid"
    conn = getConnection()
    try:
        conn.execute(
            """INSERT INTO portfolios (user_id, name) 
                     VALUES (?, ?)""",
            (userid, name.strip()),
        )
        conn.commit()
        pfid = conn.execute(
            """SELECT portfolio_id 
                          FROM portfolios
                          WHERE user_id = ?
                          AND name = ?""",
            (userid, name),
        ).fetchone()
    except sqlite3.IntegrityError:
        # Portfolio name not unique
        conn.close()
        return -1, "Portfolio with that name already exists"
    conn.close()
    return pfid["portfolio_id"], ""


# Deletes portfolio with given name to given user
# Returns true if successful otherwise false
def deletePortfolio(userid, pfid) -> int:
    if userid == "" or userid is None:
        # Invalid user id
        return False, "Could not find user"

    conn = getConnection()
    try:
        count1 = conn.execute(
            """SELECT COUNT(*) FROM portfolios 
                     WHERE user_id = ? AND portfolio_id = ?""",
            (userid, pfid),
        ).fetchone()
        conn.execute(
            """DELETE FROM portfolios 
                     WHERE user_id = ? AND portfolio_id = ?""",
            (userid, pfid),
        )
        conn.commit()
        count2 = conn.execute(
            """SELECT COUNT(*) FROM portfolios 
                     WHERE user_id = ? AND portfolio_id = ?""",
            (userid, pfid),
        ).fetchone()
        conn.commit()
    except sqlite3.IntegrityError:
        # Portfolio name not unique
        conn.close()
        return False
    if count1["COUNT(*)"] == 0:
        # Entry does not exist
        conn.close()
        return False
    if count2["COUNT(*)"] == 0:
        # Successfully deleted portfolio
        # Now delete stocks in the portfolio if any
        conn.execute(
            """DELETE FROM stocks 
                     WHERE portfolio_id = ?""",
            (pfid,),
        )
        conn.commit()
        conn.close()
        return True
    else:
        # Entry exist but not deleted for some reason
        return False


def getPortfolio(userid, pfid) -> dict:
    if pfid < 1:
        return {}
    conn = getConnection()
    portfolio = conn.execute(
        """SELECT * 
                          FROM portfolios
                          WHERE user_id = ?
                          AND portfolio_id = ?""",
        (userid, pfid),
    ).fetchone()
    conn.close()
    return row2dict(portfolio)


def getPortfolioName(userid, pfid) -> str:
    if pfid < 1:
        return {}
    conn = getConnection()
    name = conn.execute(
        """SELECT (name) 
                          FROM portfolios
                          WHERE user_id = ?
                          AND portfolio_id = ?""",
        (userid, pfid),
    ).fetchone()
    conn.close()
    # print(name["name"])
    return name["name"]


# ===================== STOCKS FUNCTIONS ===================== #


def addStock(portfolioid, number, ticker, price, ex_rate, frank, region):
    if number <= 0:
        return False
    if portfolioid < -1:
        return False

    date = datetime.now()
    date = date.strftime("%Y-%m-%d %H:%M:%S")

    conn = getConnection()
    try:
        conn.execute(
            """INSERT INTO stocks (portfolio_id, ticker, quantity, price, time, region, franked, exchange_rate) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                portfolioid,
                ticker.strip(),
                number,
                price,
                date,
                region.strip(),
                frank,
                ex_rate,
            ),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        conn.close()
        return False
    conn.close()
    return True


def deleteStocks(stock_id):
    if stock_id <= -1:
        return False

    conn = getConnection()
    try:
        before = conn.execute(
            """SELECT COUNT(*) FROM stocks WHERE stock_id = ?""", (stock_id,)
        ).fetchone()

        conn.execute("""DELETE FROM stocks WHERE stock_id = ?""", (stock_id,))
        conn.commit()
        after = conn.execute(
            """SELECT COUNT(*) FROM stocks WHERE stock_id = ?""", (stock_id,)
        ).fetchone()
    except sqlite3.IntegrityError:
        conn.close()
        return False

    if before["COUNT(*)"] == 0:
        conn.close()
        return False
    if after["COUNT(*)"] != 0:
        conn.close()
        return False
    conn.close()
    return True


def getStocks(portfolio_id) -> list:
    if int(portfolio_id) < 1:
        return []

    conn = getConnection()
    stocks = conn.execute(
        """SELECT * 
                              FROM stocks
                              WHERE portfolio_id = ?
                              ORDER BY stock_id""",
        (portfolio_id,),
    ).fetchall()
    conn.close()
    return rows2list(stocks)


def updateStocks(stock_id, quantity):
    if stock_id <= -1:
        return False
    conn = getConnection()
    try:
        conn.execute(
            """UPDATE stocks SET quantity = ? WHERE stock_id = ?""",
            (quantity, stock_id),
        )
        conn.commit()
        after = conn.execute(
            """SELECT COUNT(*) FROM stocks WHERE stock_id = ? AND quantity = ?""",
            (stock_id, quantity),
        ).fetchone()
    except sqlite3.IntegrityError:
        conn.close()
        return False

    if after["COUNT(*)"] == 0:
        conn.close()
        return False

    conn.close()
    return True


# ===================== WATCHLIST FUNCTIONS ===================== #

# Adds watchlist with given name to given user
# Returns true if successful otherwise false
def addWatchlist(userid, name) -> int:
    if userid == "" or userid is None:
        # Invalid user id
        return False, "Could not find user"
    pattern = re.compile("^([a-zA-Z0-9()\[\]<>/?\"'!@#$%^&*_ ]{1,32})$")
    if not pattern.match(name):
        # Watchlist name is invalid
        return False, "Watchlist name is invalid"
    conn = getConnection()
    try:
        conn.execute(
            """INSERT INTO watchlists (user_id, name) 
                     VALUES (?, ?)""",
            (userid, name.strip()),
        )
        conn.commit()
        wlid = conn.execute(
            """SELECT watchlist_id 
                          FROM watchlists
                          WHERE user_id = ?
                          AND name = ?""",
            (userid, name),
        ).fetchone()
    except sqlite3.IntegrityError:
        # Watchlist name not unique
        conn.close()
        return -1, "Watchlist with that name already exists"
    conn.close()
    return wlid["watchlist_id"], ""


# Returns list of all watchlists of given user
def getUserWatchlists(userid) -> list:
    if userid == "" or userid is None:
        # Invalid user id
        return None
    conn = getConnection()
    watchlists = conn.execute(
        """SELECT * 
                              FROM watchlists
                              WHERE user_id = ?
                              ORDER BY watchlist_id""",
        (userid,),
    ).fetchall()
    conn.close()
    return rows2list(watchlists)


# Returns watchlist information
def getWatchlist(userid, wlid) -> dict:
    if wlid < 1:
        return {}
    conn = getConnection()
    watchlist = conn.execute(
        """SELECT * 
                          FROM watchlists
                          WHERE user_id = ?
                          AND watchlist_id = ?""",
        (userid, wlid),
    ).fetchone()
    conn.close()
    return row2dict(watchlist)


def getWatchlistStocks(wlid) -> list:
    if int(wlid) < 1:
        return []

    conn = getConnection()
    stocks = conn.execute(
        """SELECT * 
                              FROM watchlistStocks
                              WHERE watchlist_id = ?
                              ORDER BY stock_id""",
        (wlid,),
    ).fetchall()
    conn.close()
    return rows2list(stocks)


def addStockWatchlist(wlid, ticker, region):
    if int(wlid) < 1:
        return False

    conn = getConnection()
    before = conn.execute(
        """SELECT COUNT(*) FROM watchlistStocks WHERE watchlist_id = ? AND ticker = ? AND region = ?""",
        (wlid, ticker, region),
    ).fetchone()
    if before["COUNT(*)"] != 0:
        conn.close()
        return False

    conn.execute(
        """INSERT INTO watchlistStocks (watchlist_id, ticker, region) 
                                VALUES (?, ?, ?)""",
        (wlid, ticker.strip(), region.strip()),
    )
    conn.commit()
    conn.close()
    return True


def removeStockWatchlist(wlid, ticker, region) -> bool:
    if int(wlid) < 1:
        return False

    conn = getConnection()
    try:
        before = conn.execute(
            """SELECT COUNT(*) FROM watchlistStocks WHERE watchlist_id = ? AND ticker = ? AND region = ?""",
            (wlid, ticker, region),
        ).fetchone()

        conn.execute(
            """DELETE FROM watchlistStocks WHERE watchlist_id = ? AND ticker = ? AND region = ?""",
            (wlid, ticker, region),
        )
        conn.commit()
        after = conn.execute(
            """SELECT COUNT(*) FROM watchlistStocks WHERE watchlist_id = ? AND ticker = ? AND region = ?""",
            (wlid, ticker, region),
        ).fetchone()
    except sqlite3.IntegrityError:
        conn.close()
        return False

    if before["COUNT(*)"] == 0:
        conn.close()
        return False
    if after["COUNT(*)"] != 0:
        conn.close()
        return False
    conn.close()
    return True


# Deletes watchlist with given name to given user
# Returns true if successful otherwise false
def deleteWatchlist(userid, wlid) -> int:
    if userid == "" or userid is None:
        # Invalid user id
        return False, "Could not find user"

    conn = getConnection()
    try:
        count1 = conn.execute(
            """SELECT COUNT(*) FROM watchlists 
                     WHERE user_id = ? AND watchlist_id = ?""",
            (userid, wlid),
        ).fetchone()
        conn.execute(
            """DELETE FROM watchlists 
                     WHERE user_id = ? AND watchlist_id = ?""",
            (userid, wlid),
        )
        conn.commit()
        count2 = conn.execute(
            """SELECT COUNT(*) FROM watchlists 
                     WHERE user_id = ? AND watchlist_id = ?""",
            (userid, wlid),
        ).fetchone()
        conn.commit()
    except sqlite3.IntegrityError:
        # Portfolio name not unique
        conn.close()
        return False
    if count1["COUNT(*)"] == 0:
        # Entry does not exist
        conn.close()
        return False
    if count2["COUNT(*)"] == 0:
        # Successfully deleted watchlist
        # Now delete stocks in the watchlist if any
        conn.execute(
            """DELETE FROM watchlistStocks 
                     WHERE watchlist_id = ?""",
            (wlid,),
        )
        conn.commit()
        conn.close()
        return True
    else:
        # Entry exist but not deleted for some reason
        return False


# ===================== TAX FUNCTIONS ===================== #


def updateDividends(pfid, stkid, price):
    if int(pfid) < 1:
        return False
    p = float(price)

    conn = getConnection()
    res = conn.execute(
        """UPDATE stocks
                          SET dividend_price = ?
                          WHERE portfolio_id = ? AND stock_id = ?""",
        (p, pfid, stkid),
    ).fetchone()
    # print(res)

    # conn.execute('''INSERT INTO watchlistStocks (watchlist_id, ticker)
    #                             VALUES (?, ?)''', (wlid, ticker.strip()))
    conn.commit()
    conn.close()
    return True
