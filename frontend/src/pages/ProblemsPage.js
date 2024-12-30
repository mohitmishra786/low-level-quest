// frontend/src/pages/ProblemsPage.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ProblemsPage() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const response = await axios.get("/api/problems");
        setProblems(response.data);
      } catch (error) {
        console.error("Failed to fetch problems", error);
      }
    };

    fetchProblems();
  }, []);

  return (
    <div>
      <h1>Problems</h1>
      <ul>
        {problems.map((problem) => (
          <li key={problem.id}>
            <a href={`/problem/${problem.id}`}>{problem.title}</a>
            <span>{problem.difficulty}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProblemsPage;
