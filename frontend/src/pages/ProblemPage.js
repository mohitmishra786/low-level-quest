// frontend/src/pages/ProblemPage.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import NavigationBar from "../components/NavigationBar";
import API from "../utils/api";
import "./ProblemPage.css";

function ProblemPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [activeTab, setActiveTab] = useState("description");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [language] = useState("c");

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const response = await API.get(`/api/problems/${id}`);
        setProblem(response.data);
        setCode(response.data.starterCode || "// Write your C code here\n");
      } catch (error) {
        console.error("Failed to fetch problem:", error);
      }
    };
    fetchProblem();
  }, [id]);

  const handleRun = async () => {
    try {
      setOutput("Running...");
      const response = await API.post(`/api/problems/${id}/run`, {
        code,
        language,
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput(
        `Error: ${error.response?.data?.error || "Failed to run code"}`,
      );
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setOutput("Submitting...");
      const response = await API.post(`/api/problems/${id}/submit`, {
        code,
        language,
      });
      setOutput(response.data.message);
    } catch (error) {
      setOutput(
        `Error: ${error.response?.data?.error || "Failed to submit code"}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!problem) return <div>Loading...</div>;

  return (
    <div className="problem-page">
      <NavigationBar />
      <div className="problem-container">
        <div className="left-panel">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab ${activeTab === "submissions" ? "active" : ""}`}
              onClick={() => setActiveTab("submissions")}
            >
              Submissions
            </button>
          </div>

          <div className="tab-content">
            {activeTab === "description" ? (
              <div className="description">
                <h1>{problem.title}</h1>
                <div className="problem-info">
                  <span
                    className={`difficulty ${problem.difficulty.toLowerCase()}`}
                  >
                    {problem.difficulty}
                  </span>
                  <span>Acceptance Rate: {problem.acceptance}%</span>
                </div>
                <div className="problem-description">
                  <p>{problem.description}</p>

                  <h3>Examples:</h3>
                  {problem.examples?.map((example, index) => (
                    <div key={index} className="example">
                      <pre>Input: {example.input}</pre>
                      <pre>Output: {example.output}</pre>
                      {example.explanation && (
                        <pre>Explanation: {example.explanation}</pre>
                      )}
                    </div>
                  ))}

                  <h3>Constraints:</h3>
                  <ul>
                    {problem.constraints?.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="submissions">
                <h2>Your Submissions</h2>
                {/* Submissions table will be implemented later */}
              </div>
            )}
          </div>
        </div>

        <div className="right-panel">
          <div className="editor-header">
            <div className="language-selector">
              <span>Language: C</span>
            </div>
            <div className="editor-actions">
              <button onClick={handleRun} disabled={isSubmitting}>
                Run
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="submit-btn"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          <Editor
            height="70vh"
            language="c"
            value={code}
            onChange={setCode}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />

          <div className="output-panel">
            <h3>Output:</h3>
            <pre>{output}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemPage;
