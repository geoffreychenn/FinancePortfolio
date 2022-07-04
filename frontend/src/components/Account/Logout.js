import React, { useState } from "react";
import { useAuth } from "../Account/AuthContext";
import { Button } from "react-bootstrap";
import LogoutIcon from "@mui/icons-material/Logout";

export default function Logout() {
  const { logout } = useAuth();
  const [error, setError] = useState("");

  async function handleLogOut() {
    setError("");
    try {
      await logout();
      this.props.history.push("/login");
    } catch (e) {
      setError("Could not log out, try again later");
    }
  }

  return (
    <div>
      <Button
        variant="outline-light"
        onClick={handleLogOut}
        className="logout-button"
      >
        <LogoutIcon className="logout-icon" />
        Log Out
      </Button>
      {error && alert(error)}
    </div>
  );
}
