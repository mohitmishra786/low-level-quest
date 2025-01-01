import React from "react";
import { Link } from "react-router-dom";
import "./HomePage.css";

function HomePage() {
  return (
    <div className="home-container">
      <div className="navbar">
        <div className="navbar-left">
          <Link to="/" className="logo">
            Low-Level<span className="bytes-text">Quest</span>
          </Link>
        </div>
        <div className="navbar-right">
          <div className="nav-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/login" className="nav-link">
              Login
            </Link>
            <Link to="/signup" className="nav-link">
              Signup
            </Link>
            <Link to="/contact" className="nav-link">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
      <div className="home-content">
        <h1 className="main-title">
          Low-Level<span className="bytes-text">Quest</span>
        </h1>
        <p className="quote">
          "Mastering low-level programming is like understanding the DNA of
          computing."
        </p>
      </div>
    </div>
  );
}

export default HomePage;
