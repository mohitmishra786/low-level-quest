import React, { useState, useEffect } from "react";
import api from "../utils/api";
import "./HintsSection.css";

const HintsSection = ({ problemId }) => {
  const [hints, setHints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revealedHints, setRevealedHints] = useState(new Set());

  useEffect(() => {
    if (problemId) {
      fetchHints();
    }
  }, [problemId]);

  const fetchHints = async () => {
    try {
      const response = await api.get(`/api/problems/${problemId}/hints`);
      setHints(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching hints:", err);
      setError(err.response?.data?.error || "Failed to load hints");
      setLoading(false);
    }
  };

  const toggleHint = (hintId) => {
    setRevealedHints((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(hintId)) {
        newSet.delete(hintId);
      } else {
        newSet.add(hintId);
      }
      return newSet;
    });
  };

  if (loading) return <div className="loading">Loading hints...</div>;
  if (error) return <div className="error">{error}</div>;
  if (hints.length === 0)
    return <div className="no-hints">No hints available for this problem.</div>;

  return (
    <div className="hints-section">
      <h3>Problem Hints</h3>
      <div className="hints-container">
        <div className="hints-list">
          {hints.map((hint, index) => (
            <div key={hint.id} className="hint-item">
              <div className="hint-header">
                <span>Hint {index + 1}</span>
                <button
                  className={`reveal-hint-button ${
                    revealedHints.has(hint.id) ? "revealed" : ""
                  }`}
                  onClick={() => toggleHint(hint.id)}
                >
                  {revealedHints.has(hint.id) ? "Hide Hint" : "Show Hint"}
                </button>
              </div>
              {revealedHints.has(hint.id) && (
                <div className="hint-content">{hint.content}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HintsSection;
