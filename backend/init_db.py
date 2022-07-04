import sqlite3
import db_api as db

connection = sqlite3.connect('database/database.db')


with open('database/schema.sql') as f:
    connection.executescript(f.read())

# Default database initialisation
db.addUser("HsxuGqfzgvYSNuUovGkkJpqYcTB3", "123@gmail.com")
db.addUser("pHKobC449qbHCLB9h9iFYkqX0Kn1", "geoffreychenn@gmail.com")
db.addUser("jan4VhAZ3OdNeT4nMw7d1tkidBB2", "callants@live.com.au")
db.addUser("4DTijQkLnOfji1wFA5JSZI3bBlj1", "noah@test.com")
db.addUser("Bw1MiV4v3SebdYMR5jy8zR64j6v1", "test@test.com")