// frontend/src/pages/HomePage.js
import React from "react";
import { Link } from "react-router-dom";

function HomePage() {
  return (
    <div className="center-content">
      <h1>Welcome to LowLevelQuest</h1>
      <nav>
        <a href="/login">Login</a>
        <a href="/signup">Signup</a>
        <a href="/problems">Problems</a>
      </nav>
    </div>
  );
}

export default HomePage;
