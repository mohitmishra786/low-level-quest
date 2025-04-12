import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavigationBar.css";

function NavigationBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log("Logging out");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    navigate("/problems");
  };

  return (
    <div className="navbar">
      <div className="navbar-left">
        <Link to="/problems" className="logo">
          Low-Level<span className="bytes-text">Quest</span>
        </Link>
      </div>
      <div className="navbar-right">
        <div className="nav-links">
          <Link to="/problems" className="nav-link">
            Problems
          </Link>
          <Link to="/problems" className="nav-link" onClick={handleHomeClick}>
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
