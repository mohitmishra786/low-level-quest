// frontend/src/pages/SignupPage.js
import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/api/auth/signup", { username, password });
      window.location.href = "/login";
    } catch (error) {
      console.error("Signup failed", error);
    }
  };

  return (
    <div className="center-content">
      <h1>Signup</h1>
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
        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default SignupPage;
