<h1 align="center">A Simple Stock Management App</h1>

# Table of contents

- [Overview](#overview)
  - [Product description](#product-description)
  - [Architecture and design](#architecture-and-design)
- [Installation](#installation)
  - [Backend](#backend)
    - [Recommended](#recommended)
    - [Alternative](#alternative)
    - [Running the backend](#running-the-backend)
  - [Frontend](#frontend)
    - [Installing Node](#installing-node)
    - [Setup](#setup)
    - [Running the frontend](#running-the-frontend)

## Overview
### Product description
The project concluded in a product that is capable of tracking multiple user’s stock information including their portfolios, watchlists of interesting stocks, source news and company information, along with calculating financial information and metrics. Stock information and prices can be sourced both locally in Australia and overseas from the United States. 

### Architecture and design
Broadly, the project is a React/Python based web application that offers a browser agnostic stock management application. The backend of the project, which handles calling external APIs for real-world data and managing the database for storing user data is comprised of Python and SQLite. React provides a frontend that handles the user experience and routing for the application. These two halves interact via a Python based Flask application. A strong use of modular React modules help provide discrete, reusable components throughout the web application. 
Up-to-date, real-world information such as stock prices allow the application to be competitive in the market of data rich stock applications. This was achieved using multiple API interfaces allowing the use of several data pools simultaneously. Data can be rendered in various visual forms and formats to allow for more intuitive interactions. Utilizing common interface elements with other services on the market and the human preference for pictorial interfaces allows for more user-friendly and approachable interfaces.

### Backend
```bash
# Go to the backend folder
cd ./backend/
```
Make sure you have python 3.7.3 or higher installed. The command `python3 --version` can be used to check the install version. 
#### Recommended

1. Create a new virtual environment in the backend folder using `python3 -m venv env`
2. Activate the virtual environment by typing `env/Scripts/activate` or `env/bin/activate`
3. Upgrade pip using `python3 -m pip install --upgrade pip`
4. Upgrade setup tools using `python3 -m pip install -upgrade setuptools`
5. Install project dependencies using `python3 -m pip install -r requirements.txt`

#### Alternative
If you do not want to use a virtual environment, run the commands listed from steps 3 to 5 in the backend folder.

#### Running the backend
```bash
# Create a .env file that directs Flask to the correct app file (you only have to do this once)
export FLASK_APP=app.py
# Run this line to start the backend
flask run --port=42069
```

### Frontend
```bash
# Go to the frontend folder
cd ./frontend/
```
#### Installing Node
If running on the UNSW CSE machines or a machine with npm already installed, please skip this step.

1. Install NVM by following the instructions on the official [NVM Github](https://github.com/nvm-sh/nvm)
2. Install Node.js v16.10.0
```bash
nvm install 16.10.0
```

#### Setup
Delete the existing `node_modules` folder if it already exists.

Run the following commands
```bash
npm install
# Install an extra package called react-virtualized
npm install react-virtualized --legacy-peer-deps
```

#### Running the frontend
```bash
npm start
```
