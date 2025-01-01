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
    solved: 24,
    total: 40,
    easy: { solved: 12, total: 13 },
    medium: { solved: 10, total: 19 },
    hard: { solved: 2, total: 8 },
  });

  useEffect(() => {
    fetchProblems();
  }, [activeFilter]);

  const fetchProblems = async () => {
    try {
      const response = await API.get("/api/problems");
      setProblems(response.data);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
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
              onClick={() => setActiveFilter("all")}
            >
              🌐 All Problems
            </button>
            <button
              className={`filter-btn ${activeFilter === "top10" ? "active" : ""}`}
              onClick={() => setActiveFilter("top10")}
            >
              ⚡ Top 10 Problems
            </button>
            <button
              className={`filter-btn ${activeFilter === "top25" ? "active" : ""}`}
              onClick={() => setActiveFilter("top25")}
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
                  <th>Acceptance</th>
                  <th>Difficulty</th>
                  <th>Tags</th>
                  <th>Bookmark</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td>
                      <div className={`status-icon ${problem.status}`} />
                    </td>
                    <td>
                      <Link
                        to={`/problem/${problem.id}`}
                        className="problem-title"
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td>{problem.acceptance}%</td>
                    <td>
                      <span
                        style={{
                          color: getDifficultyColor(problem.difficulty),
                        }}
                      >
                        {problem.difficulty}
                      </span>
                    </td>
                    <td>
                      <div className="tags">
                        {problem.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <button
                        className={`bookmark-btn ${problem.bookmarked ? "active" : ""}`}
                      >
                        ★
                      </button>
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
