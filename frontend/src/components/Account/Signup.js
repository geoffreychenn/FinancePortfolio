import React, { useEffect, useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function Signup() {
  const { signup } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordMinLen, setPasswordMinLen] = useState(false);
  const [passwordCapital, setPasswordCapital] = useState(false);
  const [passwordNumber, setPasswordNumber] = useState(false);
  const [passwordSpecial, setPasswordSpecial] = useState(false);

  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const history = useHistory();

  //user credential regex
  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  const capitalLetter = /(?=.*?[A-Z])/;
  const digit = /^(?=.*?[0-9])/;
  const special = /^(?=.*?[#?!@$%^&*-])/;

  useEffect(() => {
    if (password.length < 8) {
      setPasswordMinLen(false);
    } else {
      setPasswordMinLen(true);
    }
    if (!capitalLetter.test(password)) {
      setPasswordCapital(false);
    } else {
      setPasswordCapital(true);
    }
    if (!digit.test(password)) {
      setPasswordNumber(false);
    } else {
      setPasswordNumber(true);
    }
    if (!special.test(password)) {
      setPasswordSpecial(false);
    } else {
      setPasswordSpecial(true);
    }
  }, [password]);

  async function handleSubmit(e) {
    e.preventDefault();

    // checking regex and returning errors where applicable
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      return setError("Passwords do not match");
    }
    if (!emailRegex.test(emailRef.current.value)) {
      return setError("Invalid Email Address");
    }
    if (
      !(passwordSpecial && passwordCapital && passwordMinLen && passwordNumber)
    ) {
      return setError("Password must meet all the requirements");
    }
    try {
      setError("");
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      //api call migrated to AuthContext.js, mutliple awaits were causing issues
      history.push("/");
    } catch (e) {
      if (
        e.toString() ===
        "FirebaseError: Firebase: The email address is already in use by another account. (auth/email-already-in-use)."
      ) {
        setError("That email address is already in use by another account.");
      } else {
        //in case of unknown error
        setError("Failed to sign up, try again later");
      }
    }
    setLoading(false);
  }

  return (
    <div class="update-account">
      <div class="row">
        <div class="col-3"/>

        <div class="col-6">
          <Card className="signup-form">
            <Card.Body>
              <h2 className="text-center mb-4">Sign Up</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form
                onSubmit={handleSubmit}
                onChange={() => setPassword(passwordRef.current.value)}
              >
                <Form.Group id="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    ref={emailRef}
                    required
                  />
                </Form.Group>
                <Form.Group id="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={passwordRef}
                    required
                  />
                </Form.Group>
                <Form.Group id="confirmPassword">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={confirmPasswordRef}
                    required
                  />
                </Form.Group>
                <Button disabled={loading} type="submit" className="w-100 mt-4">
                  Sign Up
                </Button>
              </Form>
            </Card.Body>
            <div className="text-center mt-2 mb-4">
              Already have an account? <Link to="/login">Log In</Link>
            </div>
          </Card>
        </div>

        <div class="col-3">
          <Card className="signup-requirements">
            <Card.Body>
              <div>
                <p>Password Requirements: </p>
                <p className={!passwordMinLen ? "error" : "valid"}>
                  Minimum 8 characters
                </p>
                <p className={!passwordCapital ? "error" : "valid"}>
                  Contains a capital letter
                </p>
                <p className={!passwordNumber ? "error" : "valid"}>
                  Contains a number
                </p>
                <p className={!passwordSpecial ? "error" : "valid"}>
                  Contains a special character
                </p>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
