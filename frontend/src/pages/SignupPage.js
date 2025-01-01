import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthNavBar from "../components/AuthNavBar";
import api from "../utils/api";
import "./AuthPages.css";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/signup", { username, password });
      window.location.href = "/login";
    } catch (error) {
      setError(error.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <AuthNavBar />
      <div className="auth-content">
        <div className="auth-box">
          <h1>Sign Up</h1>
          <form onSubmit={handleSignup}>
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
            <button type="submit">Sign Up</button>
            {error && <p className="error">{error}</p>}
          </form>
          <p className="auth-link">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
