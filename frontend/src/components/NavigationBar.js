import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavigationBar.css";

function NavigationBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/" className="logo">
          Low-Level<span className="bytes-text">Quest</span>
        </Link>
      </div>
      <div className="navbar-right">
        <div className="nav-links">
          <Link to="/problems" className="nav-link">
            Problems
          </Link>
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/contact" className="nav-link">
            Contact Us
          </Link>
          <button onClick={handleLogout} className="nav-link logout">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default NavigationBar;
