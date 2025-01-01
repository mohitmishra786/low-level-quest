import React from "react";
import { Link } from "react-router-dom";
import "./AuthNavBar.css";

function AuthNavBar() {
  return (
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
          <Link to="/contact" className="nav-link">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthNavBar;
