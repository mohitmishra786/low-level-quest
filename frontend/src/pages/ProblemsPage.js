import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import StatsCircle from "../components/StatsCircle";
import API from "../utils/api";
import "./ProblemsPage.css";

function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [userStats, setUserStats] = useState({
    solved: 0,
    total: 0,
    easy: { solved: 0, total: 0 },
    medium: { solved: 0, total: 0 },
    hard: { solved: 0, total: 0 },
  });

  useEffect(() => {
    const loadData = async () => {
      console.log("Loading data...");
      try {
        console.log("Fetching problems...");
        await fetchProblems();
        console.log("Fetching user stats...");
        await fetchUserStats();
        console.log("Data loading complete");
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  const fetchProblems = async () => {
    try {
      const response = await API.get("/api/problems");
      console.log("Problems data:", response.data);
      setProblems(response.data);

      // Only set total counts, don't override solved counts
      const total = response.data.length;
      const easy = response.data.filter((p) => p.difficulty === "Easy").length;
      const medium = response.data.filter(
        (p) => p.difficulty === "Medium"
      ).length;
      const hard = response.data.filter((p) => p.difficulty === "Hard").length;

      setUserStats((prevStats) => ({
        ...prevStats,
        total: total,
        easy: { ...prevStats.easy, total: easy },
        medium: { ...prevStats.medium, total: medium },
        hard: { ...prevStats.hard, total: hard },
      }));
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await API.get("/api/problems/user/stats");
      console.log("User stats:", response.data);
      setUserStats(response.data);
    } catch (error) {
      console.error("Failed to fetch user stats:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "solved":
        return <div className="status-icon solved" title="Solved"></div>;
      case "attempted":
        return <div className="status-icon attempted" title="Attempted"></div>;
      default:
        return <div className="status-icon not-attempted" title="Not attempted"></div>;
    }
  };

  const handleFilterChange = (filter) => {
    console.log("Changing filter to:", filter);
    setActiveFilter(filter);

    // Reload data with new filter
    const loadData = async () => {
      try {
        await fetchProblems();
        await fetchUserStats();
      } catch (error) {
        console.error("Error loading data with new filter:", error);
      }
    };

    loadData();
  };

  const handlePickAny = () => {
    if (problems.length > 0) {
      const randomIndex = Math.floor(Math.random() * problems.length);
      const randomProblem = problems[randomIndex];
      window.location.href = `/problem/${randomProblem.id}`;
    }
  };

  return (
    <div className="app-container">
      <NavigationBar />
      <div className="main-content">
        <div className="page-layout">
          <div className="left-section">
            <div className="header-section">
              <h1>
                Low-<span className="level-text">Level</span>
                <span className="quest-text">Quest</span>
              </h1>
              <p className="tagline">
                Unleash Your Coding Power, One Byte at a Time!
              </p>
              <p className="developer">Developed by Mohit Mishra</p>
            </div>
            
            <div className="filter-section">
              <button
                className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                onClick={() => handleFilterChange("all")}
              >
                <span className="filter-icon">🌐</span>
                <span>All Problems</span>
              </button>
              <button
                className={`filter-btn ${activeFilter === "top10" ? "active" : ""}`}
                onClick={() => handleFilterChange("top10")}
              >
                <span className="filter-icon">⚡</span>
                <span>Top 10 Problems</span>
              </button>
              <button
                className={`filter-btn ${activeFilter === "top25" ? "active" : ""}`}
                onClick={() => handleFilterChange("top25")}
              >
                <span className="filter-icon">🌟</span>
                <span>Top 25 Problems</span>
              </button>
              <button
                className="filter-btn pick-any"
                onClick={handlePickAny}
              >
                <span className="filter-icon">🎲</span>
                <span>Pick Any</span>
              </button>
            </div>
          </div>
          
          <div className="right-section">
            <div className="table-container">
              <table className="problems-table">
                <thead>
                  <tr>
                    <th className="status-col">Status</th>
                    <th className="title-col">Title</th>
                    <th className="category-col">Category</th>
                    <th className="difficulty-col">Difficulty</th>
                    <th className="attempts-col">Attempts</th>
                    <th className="created-col">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {problems.map((problem) => (
                    <tr key={problem.id}>
                      <td className="status-col">{getStatusIcon(problem.status)}</td>
                      <td className="title-col">
                        <Link to={`/problem/${problem.id}`} className="problem-link">
                          {problem.title}
                        </Link>
                      </td>
                      <td className="category-col">
                        <span className="category-badge">
                          {problem.category || "Uncategorized"}
                        </span>
                      </td>
                      <td className="difficulty-col">
                        <span className={`difficulty-badge ${problem.difficulty.toLowerCase()}`}>
                          {problem.difficulty}
                        </span>
                      </td>
                      <td className="attempts-col">
                        {problem.attempts > 0 ? problem.attempts : "-"}
                      </td>
                      <td className="created-col">
                        {new Date(problem.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="stats-container">
              <StatsCircle stats={userStats} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;