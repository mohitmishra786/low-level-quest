import React, { useEffect, useState } from "react";
import "./StatsCircle.css";

function StatsCircle({ stats }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const percentage = stats ? (stats.solved / stats.total) * 100 : 0;
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = String(
    circumference - (animatedPercentage / 100) * circumference
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const formatNumber = (num) => {
    return num || 0;
  };

  return (
    <div className="stats-circle-container">
      <h3 className="stats-header">Your Progress</h3>
      <div className="stats-circle">
        <svg width="120" height="120" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#2c2c2c"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <div className="stats-number">
          <span className="solved">{formatNumber(stats?.solved)}</span>
          <span className="total">/{formatNumber(stats?.total)}</span>
        </div>
      </div>
      <div className="difficulty-stats">
        <div className="stat-row easy">
          <span>Easy</span>
          <span>
            {formatNumber(stats?.easy?.solved)}/{formatNumber(stats?.easy?.total)}
          </span>
        </div>
        <div className="stat-row medium">
          <span>Medium</span>
          <span>
            {formatNumber(stats?.medium?.solved)}/{formatNumber(stats?.medium?.total)}
          </span>
        </div>
        <div className="stat-row hard">
          <span>Hard</span>
          <span>
            {formatNumber(stats?.hard?.solved)}/{formatNumber(stats?.hard?.total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatsCircle;
