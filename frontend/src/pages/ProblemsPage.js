import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api"; // Corrected import path
import "./ProblemsPage.css";

function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await API.get("/api/problems");
        setProblems(response.data);
      } catch (error) {
        console.error("Failed to fetch problems", error);
        setError("Failed to fetch problems. Please try again later.");
      }
    };

    fetchProblems();
  }, []);

  if (error) {
    return (
      <div>
        <h1>Problems</h1>
        <p className="error">{error}</p>
      </div>
    );
  }

  return (
    <div className="problems-page">
      <h1 className="title">Problems</h1>
      <ul className="problem-list">
        {problems.map((problem) => (
          <li key={problem.id} className="problem-item">
            <Link to={`/problem/${problem.id}`} className="problem-link">
              {problem.title}
            </Link>
            <span className="difficulty">{problem.difficulty}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProblemsPage;
