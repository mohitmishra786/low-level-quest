import React from "react";
import "./ProblemFilters.css";

function ProblemFilters({ activeFilter, onFilterChange }) {
  return (
    <div className="filter-container">
      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
          onClick={() => onFilterChange("all")}
        >
          <span className="globe-icon">🌐</span> All Problems
        </button>
        <button
          className={`filter-btn ${activeFilter === "top10" ? "active" : ""}`}
          onClick={() => onFilterChange("top10")}
        >
          <span className="lightning-icon">⚡</span> Top 10 Problems
        </button>
        <button
          className={`filter-btn ${activeFilter === "top25" ? "active" : ""}`}
          onClick={() => onFilterChange("top25")}
        >
          <span className="star-icon">🌟</span> Top 25 Problems
        </button>
      </div>
      <button className="pick-any-btn">
        <span className="random-icon">🎲</span> Pick Any
      </button>
    </div>
  );
}

export default ProblemFilters;
