import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import API from "../../API";
import { AppContext } from "../../Context";

export default function UserProfile() {
  const { currentUser, loading, setLoading } = useContext(AppContext);

  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const { updateEmail, updatePassword } = useAuth();
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const [passwordMinLen, setPasswordMinLen] = useState(false);
  const [passwordCapital, setPasswordCapital] = useState(false);
  const [passwordNumber, setPasswordNumber] = useState(false);
  const [passwordSpecial, setPasswordSpecial] = useState(false);
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

  async function handleEmailSubmit(e) {
    e.preventDefault();

    if (!emailRegex.test(emailRef.current.value)) {
      return setError("Invalid Email Address");
    }

    if (emailRef.current.value === currentUser.email) {
      return setError("New email cannot be same as current email");
    }

    try {
      setError("");
      setLoading(true);
      await API.updateEmail(currentUser.email, emailRef.current.value);
      await updateEmail(emailRef.current.value);
    } catch (e) {
      setError("Failed to update email address, try again later");
    }
    setLoading(false);
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (passwordRef.current.value !== confirmPasswordRef.current.value) {
      return setError("Passwords do not match");
    }
    if (
      !(passwordSpecial && passwordCapital && passwordMinLen && passwordNumber)
    ) {
      return setError("Password must meet all the requirements");
    }

    if (passwordRef.current.value) {
      await updatePassword(passwordRef.current.value);
    }

    try {
      setError("");
      setLoading(true);
    } catch (e) {
      setError("Failed to update password, try again later");
    }
    setLoading(false);
  }

  return (
    <div class="update-account">
      <div class="row">
        <div class="col-3"/>

        <div class="col-6">
          <Card>
            <Card.Body>
              <h2 className="text-center mb-4">Change Email</h2>
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={handleEmailSubmit}>
                <Form.Group id="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    ref={emailRef}
                    required
                    defaultValue={currentUser.email}
                  />
                </Form.Group>
                <Button disabled={loading} type="submit" className="w-100 mt-4">
                  Update Email
                </Button>
              </Form>

              <h2 className="text-center mb-2 mt-4">Change Password</h2>
              <Form
                onSubmit={handlePasswordSubmit}
                onChange={() => setPassword(passwordRef.current.value)}
              >
                <Form.Group id="password">
                  <Form.Label className="mt-2">Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={passwordRef}
                    placeholder="Leave blank to not change"
                  />
                </Form.Group>
                <Form.Group id="confirmPassword">
                  <Form.Label className="mt-4">Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    ref={confirmPasswordRef}
                    placeholder="Leave blank to not change"
                  />
                </Form.Group>
                <Button disabled={loading} type="submit" className="w-100 mt-4">
                  Update Password
                </Button>
              </Form>
            </Card.Body>
            <div className="w-100 text-center mt-2 mb-4">
              <Link to="/">Return to dashboard</Link>
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
