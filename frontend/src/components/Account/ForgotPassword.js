import React, { useRef, useState } from "react";
import { Form, Button, Card, Alert } from "react-bootstrap";
import { useAuth } from "./AuthContext";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError("");
      setMessage("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("An email has been sent to your inbox");
    } catch (e) {
      setError("Failed to reset password, try again later");
    }
    setLoading(false);
  }

  return (
    <div className="login">
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Reset Password</h2>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" ref={emailRef} required/>
            </Form.Group>
            <Button disabled={loading} type="submit" className="w-100 mt-4">
              Reset Password
            </Button>
          </Form>
        </Card.Body>
        <div className="w-100 text-center mt-2">
          <Link to="/login">Return to login</Link>
        </div>
        <div className="w-100 text-center mt-2 mb-4">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </div>
      </Card>
    </div>
  );
}
