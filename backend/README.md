# Setting up on local machine
1. Make sure you have python installed
2. (Recommended) Install python virtual environment `pip install virtualenv`. Then create a new virtual environment in the backend folder `cd backend && python -m venv env`. Activate the virtual environment `env/Scripts/activate`. Install requirements `pip install -r requirements.txt`
3. If you do not want to use a virutal environment, simply install the requirements `pip install -r requirements.txt` from the backend folder

# Setting up on VLAB
1. Make sure you have python 3.7.3 or higher installed. The command `python3 --version` can be used to check the install version.  
2. (Optional but recommended) Install python virtual environment with `pip install virtualenv`. 
3. Create a virtual environment in the backend folder with `python3 -m venv env`, and activate it with `source env/bin/activate`
4. Upgrade pip using `python3 -m pip install --upgrade pip`, and upgrade setuptools with `python3 -m pip install --upgrade setuptools`
5. Install the required packages with `python3 -m pip install -r requirements.txt`

# Running the application
1. Run the frontend as described in the frontend README file
2. Open a new terminal and navigate to the backend folder
3. Run 'export FLASK_APP=app.py'
4. Run the flask backend `flask run --port=42069`. Changes to the python files will be refreshed.
