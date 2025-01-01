import React from "react";
import "./StatsCircle.css";

function StatsCircle({ stats }) {
  const percentage = stats ? (stats.solved / stats.total) * 100 : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Convert to string to fix the NaN warning
  const strokeDashoffset = String(
    circumference - (percentage / 100) * circumference,
  );

  return (
    <div className="stats-circle-container">
      <h3 className="stats-header">Your Stats</h3>
      <div className="stats-circle">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#333"
            strokeWidth="5"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="5"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="stats-number">
          <span className="solved">{stats?.solved || 0}</span>
          <span className="total">/{stats?.total || 0}</span>
        </div>
      </div>
      <div className="difficulty-stats">
        <div className="stat-row easy">
          <span>Easy</span>
          <span>
            {stats?.easy?.solved || 0}/{stats?.easy?.total || 0}
          </span>
        </div>
        <div className="stat-row medium">
          <span>Medium</span>
          <span>
            {stats?.medium?.solved || 0}/{stats?.medium?.total || 0}
          </span>
        </div>
        <div className="stat-row hard">
          <span>Hard</span>
          <span>
            {stats?.hard?.solved || 0}/{stats?.hard?.total || 0}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatsCircle;
