import "./App.css";
import React from "react";
import { AuthProvider } from "./components/Account/AuthContext";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Signup from "./components/Account/Signup";
import Login from "./components/Account/Login";
import Dashboard from "./components/Dashboard/Dashboard";
import ForgotPass from "./components/Account/ForgotPassword.js";
import PrivateRoute from "./components/Account/PrivateRoute";

function App() {
  document.title = "WereBadAtNames";
  return (
    <React.Fragment>
      <Router>
        <AuthProvider>
          <Switch>
            <Route path="/signup" component={Signup} />
            <Route path="/login" component={Login} />
            <Route path="/forgot-password" component={ForgotPass} />
            <PrivateRoute path="/" component={Dashboard} />
          </Switch>
        </AuthProvider>
      </Router>
    </React.Fragment>
  );
}

export default App;
