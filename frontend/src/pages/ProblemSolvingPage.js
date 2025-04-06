// frontend/src/pages/ProblemSolvingPage.js
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import NavigationBar from "../components/NavigationBar";
import API from "../utils/api";
import "./ProblemSolvingPage.css";

function ProblemSolvingPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [showTestResults, setShowTestResults] = useState(false);

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/problems/${id}`);
      setProblem(response.data);
      setCode(response.data.initial_code || "// Write your code here\n#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\\n\");\n    return 0;\n}");
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch problem:", error);
      setError("Failed to load problem. Please try again later.");
      setLoading(false);
    }
  };

  const handleRunCode = async () => {
    try {
      setExecuting(true);
      setOutput("Running...");
      setExecutionResult(null);
      setTestResults(null);
      setShowTestResults(false);
      
      const response = await API.post("/api/execute", { code, problemId: id });
      
      if (response.data.error) {
        setExecutionResult({
          type: 'error',
          message: response.data.error,
          details: response.data.output
        });
        setOutput(response.data.output || "Error executing code");
      } else {
        setExecutionResult({
          type: 'success',
          message: 'Code executed successfully',
          details: response.data.output
        });
        setOutput(response.data.output || "No output");
      }
    } catch (error) {
      console.error("Code execution failed", error);
      setExecutionResult({
        type: 'error',
        message: 'Execution failed',
        details: error.response?.data?.output || error.message
      });
      setOutput(error.response?.data?.output || "Error executing code. Please try again.");
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitSolution = async () => {
    try {
      setExecuting(true);
      setOutput("Submitting solution...");
      setExecutionResult(null);
      setTestResults(null);
      setShowTestResults(false);
      
      const response = await API.post("/api/execute", { 
        code, 
        problemId: id,
        isSubmission: true 
      });
      
      if (response.data.error) {
        setExecutionResult({
          type: 'error',
          message: response.data.error,
          details: response.data.output
        });
        setOutput(response.data.output || "Error submitting solution");
      } else {
        setTestResults(response.data);
        setShowTestResults(true);
        
        if (response.data.passed) {
          setExecutionResult({
            type: 'success',
            message: 'All test cases passed!',
            details: 'Congratulations! Your solution is correct.'
          });
          setOutput("All test cases passed!");
        } else {
          setExecutionResult({
            type: 'error',
            message: 'Some test cases failed',
            details: 'Check the test results below for details.'
          });
          setOutput("Some test cases failed. Check the test results below.");
        }
      }
    } catch (error) {
      console.error("Solution submission failed", error);
      setExecutionResult({
        type: 'error',
        message: 'Submission failed',
        details: error.response?.data?.output || error.message
      });
      setOutput(error.response?.data?.output || "Error submitting solution. Please try again.");
    } finally {
      setExecuting(false);
    }
  };

  const renderTestResults = () => {
    if (!testResults || !showTestResults) return null;
    
    return (
      <div className="test-results">
        <h3>Test Results</h3>
        <div className={`test-summary ${testResults.passed ? 'passed' : 'failed'}`}>
          {testResults.passed ? 'All tests passed!' : 'Some tests failed'}
        </div>
        
        <div className="test-cases">
          {testResults.results.map((result, index) => (
            <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
              <div className="test-case-header">
                Test Case {index + 1} {result.passed ? '✓' : '✗'}
              </div>
              
              <div className="test-case-details">
                <div className="test-input">
                  <strong>Input:</strong>
                  <pre>{result.input}</pre>
                </div>
                
                {result.passed ? (
                  <div className="test-output">
                    <strong>Output:</strong>
                    <pre>{result.actualOutput}</pre>
                  </div>
                ) : (
                  <>
                    <div className="test-expected">
                      <strong>Expected Output:</strong>
                      <pre>{result.expectedOutput}</pre>
                    </div>
                    <div className="test-actual">
                      <strong>Your Output:</strong>
                      <pre>{result.actualOutput}</pre>
                    </div>
                    {result.error && (
                      <div className="test-error">
                        <strong>Error:</strong>
                        <pre>{result.error}</pre>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="problem-solving-container">
        <NavigationBar />
        <div className="loading">Loading problem...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="problem-solving-container">
        <NavigationBar />
        <div className="error">{error}</div>
        <Link to="/problems" className="back-link">Back to Problems</Link>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="problem-solving-container">
        <NavigationBar />
        <div className="error">Problem not found</div>
        <Link to="/problems" className="back-link">Back to Problems</Link>
      </div>
    );
  }

  return (
    <div className="problem-solving-container">
      <NavigationBar />
      <div className="problem-content">
        <div className="problem-description">
          <h1>{problem.title}</h1>
          <div className="problem-meta">
            <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
              {problem.difficulty}
            </span>
          </div>
          <div className="description">
            {problem.description}
          </div>
        </div>
        <div className="code-editor">
          <Editor
            height="500px"
            language="c"
            value={code}
            onChange={(value) => setCode(value)}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
          <div className="editor-controls">
            <button 
              className="run-button" 
              onClick={handleRunCode}
              disabled={executing}
            >
              {executing ? "Running..." : "Run Code"}
            </button>
            <button 
              className="submit-button"
              onClick={handleSubmitSolution}
              disabled={executing}
            >
              Submit Solution
            </button>
          </div>
          <div className="output-container">
            <h3>Output</h3>
            {executionResult && (
              <div className={`execution-result ${executionResult.type}`}>
                <div className="result-header">{executionResult.message}</div>
                {executionResult.details && (
                  <pre className="output">{executionResult.details}</pre>
                )}
              </div>
            )}
            {!executionResult && <pre className="output">{output}</pre>}
            
            {renderTestResults()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProblemSolvingPage;
