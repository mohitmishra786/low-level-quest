import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthNavBar from "../components/AuthNavBar";
import api from "../utils/api";
import "./AuthPages.css";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/auth/login", {
        username,
        password,
      });
      console.log(
        "Login successful, received token:",
        response.data.token.substring(0, 10) + "..."
      );
      localStorage.setItem("token", response.data.token);
      console.log(
        "Token stored in localStorage:",
        localStorage.getItem("token").substring(0, 10) + "..."
      );
      window.location.href = "/problems";
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  return (
    <div className="auth-container">
      <AuthNavBar />
      <div className="auth-content">
        <div className="auth-box">
          <h1>Login</h1>
          <form onSubmit={handleLogin}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Login</button>
          </form>
          <p className="auth-link">
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
