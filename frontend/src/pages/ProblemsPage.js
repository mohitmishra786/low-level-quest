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

  const getDifficultyColor = (difficulty) => {
    const colors = {
      Easy: "#00ff00",
      Medium: "#ffd700",
      Hard: "#ff0000",
    };
    return colors[difficulty] || "#fff";
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "solved":
        return <div className="status-icon solved" title="Solved" />;
      case "attempted":
        return <div className="status-icon attempted" title="Attempted" />;
      default:
        return <div className="status-icon" title="Not attempted" />;
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

  return (
    <div className="app-container">
      <NavigationBar />
      <div className="main-content">
        <div className="header">
          <h1>
            Low-Level<span className="bytes">Quest</span>
          </h1>
          <p className="tagline">
            Unleash Your Coding Power, One Byte at a Time!
          </p>
          {/* <p className="disclaimer">
            Disclaimer: This application is intended for personal
            experimentation and learning only. The application uses questions
            sourced directly from LeetCode platform and is subjected to their
            terms of use and copyright policies.
          </p> */}
          <p className="developer">Developed by Mohit Mishra</p>
        </div>

        <div className="filters">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => handleFilterChange("all")}
            >
              🌐 All Problems
            </button>
            <button
              className={`filter-btn ${
                activeFilter === "top10" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("top10")}
            >
              ⚡ Top 10 Problems
            </button>
            <button
              className={`filter-btn ${
                activeFilter === "top25" ? "active" : ""
              }`}
              onClick={() => handleFilterChange("top25")}
            >
              🌟 Top 25 Problems
            </button>
          </div>
          <button className="pick-any-btn">🎲 Pick Any</button>
        </div>

        <div className="content-wrapper">
          <div className="problems-table">
            <table>
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Attempts</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td>{getStatusIcon(problem.status)}</td>
                    <td>
                      <Link
                        to={`/problem/${problem.id}`}
                        className="problem-title"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td>
                      <span className="category-tag">
                        {problem.category || "Uncategorized"}
                      </span>
                    </td>
                    <td>
                      <span className={`difficulty ${problem.difficulty}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      {problem.attempts && problem.attempts > 0
                        ? problem.attempts
                        : "-"}
                    </td>
                    <td className="created-date">
                      {new Date(problem.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="stats-sidebar">
            <StatsCircle stats={userStats} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;
