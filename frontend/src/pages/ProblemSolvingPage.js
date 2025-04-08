// frontend/src/pages/ProblemSolvingPage.js
import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import Editor from "@monaco-editor/react";
import NavigationBar from "../components/NavigationBar";
import ProblemDescription from "../components/ProblemDescription";
import API from "../utils/api";
import "./ProblemSolvingPage.css";
import DiscussionSection from "../components/DiscussionSection";
import HintsSection from "../components/HintsSection";

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
  const [activeTab, setActiveTab] = useState("description"); // 'description', 'discussion', 'hints'
  const [isDragging, setIsDragging] = useState(false);
  const rightPanelRef = useRef(null);
  const [problemStatus, setProblemStatus] = useState("not_attempted");

  useEffect(() => {
    fetchProblem();
  }, [id]);

  const fetchProblem = async () => {
    try {
      setLoading(true);
      const response = await API.get(`/api/problems/${id}`);
      setProblem(response.data);
      setCode(
        response.data.initial_code ||
          '// Write your code here\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
      );
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch problem:", error);
      setError("Failed to load problem. Please try again later.");
      setLoading(false);
    }
  };

  const updateProblemStatus = async (status) => {
    try {
      const response = await API.post(`/api/problems/${id}/status`, { status });
      setProblemStatus(response.data.status);
    } catch (error) {
      console.error("Failed to update problem status:", error);
      setError("Failed to update problem status");
    }
  };

  // const handleRunCode = async () => {
  //   try {
  //     setExecuting(true);
  //     setOutput('');
  //     setExecutionResult(null);

  //     const response = await API.post(`/api/problems/${id}/run`, { code });

  //     setOutput(response.data.output);
  //     setExecutionResult({
  //       type: response.data.success ? 'success' : 'error',
  //       message: response.data.message,
  //       details: response.data.details
  //     });

  //     // Update status to attempted if not already solved
  //     if (problemStatus === 'not_attempted') {
  //       await updateProblemStatus('attempted');
  //     }
  //   } catch (error) {
  //     console.error('Failed to run code:', error);
  //     setExecutionResult({
  //       type: 'error',
  //       message: 'Failed to run code',
  //       details: error.response?.data?.error || error.message
  //     });
  //   } finally {
  //     setExecuting(false);
  //   }
  // };

  const handleRunCode = async () => {
    try {
      setExecuting(true);
      setOutput("");
      setExecutionResult(null);
      setShowTestResults(true);

      const response = await API.post(`/api/problems/${id}/run`, { code });

      console.log("Run code response:", response.data);

      // Normalize response structure
      const testResult = {
        passed: response.data.passed === true, // Convert to boolean if needed
        results: [
          {
            input: response.data.testCase?.input,
            expectedOutput: response.data.testCase?.expectedOutput,
            actualOutput: response.data.output,
            passed: response.data.passed === true, // Convert to boolean if needed
            error: response.data.error,
            description: response.data.testCase?.description,
          },
        ],
      };

      setTestResults(testResult);
      setExecutionResult({
        type: testResult.passed ? "success" : "error",
        message: testResult.passed
          ? "Execution Successful"
          : "Execution Failed",
        // Don't show details here to avoid duplication
      });

      // Only update status to 'attempted' if the problem is not already solved
      if (problemStatus === "not_attempted") {
        await updateProblemStatus("attempted");
      }
    } catch (error) {
      console.error("Failed to run code:", error);
      setExecutionResult({
        type: "error",
        message: "Failed to run code",
        details: error.response?.data?.error || error.message,
      });

      // Show test results even when there's an error
      setTestResults({
        passed: false,
        results: [
          {
            input: "",
            expectedOutput: "",
            actualOutput: "",
            passed: false,
            error: error.response?.data?.error || error.message,
          },
        ],
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmitSolution = async () => {
    try {
      setExecuting(true);
      setOutput("");
      setExecutionResult(null);
      setShowTestResults(false);

      const response = await API.post(`/api/problems/${id}/submit`, { code });

      setTestResults(response.data);
      setShowTestResults(true);

      // Update status based on test results
      if (response.data.passed) {
        await updateProblemStatus("solved");
        setExecutionResult({
          type: "success",
          message: "All test cases passed! Problem solved!",
        });
      } else {
        await updateProblemStatus("attempted");
        setExecutionResult({
          type: "error",
          message: "Some test cases failed. Keep trying!",
        });
      }
    } catch (error) {
      console.error("Failed to submit solution:", error);
      setExecutionResult({
        type: "error",
        message: "Failed to submit solution",
        details: error.response?.data?.error || error.message,
      });
    } finally {
      setExecuting(false);
    }
  };

  const renderTestResults = () => {
    if (!testResults || !showTestResults) return null;

    return (
      <div className="test-results">
        <h3>Test Result</h3>
        <div
          className={`test-summary ${testResults.passed ? "passed" : "failed"}`}
        >
          {testResults.passed ? "Test Passed!" : "Test Failed"}
        </div>

        <div className="test-cases">
          {testResults.results.map((result, index) => (
            <div
              key={index}
              className={`test-case ${result.passed ? "passed" : "failed"}`}
            >
              <div className="test-case-header">
                Sample Test Case {index + 1} {result.passed ? "✓" : "✗"}
                {result.error && <span className="error-badge">Error</span>}
              </div>

              {result.description && (
                <div className="test-description">
                  <em>{result.description}</em>
                </div>
              )}

              <div className="test-case-details">
                <div className="test-expected">
                  <strong>Expected Output:</strong>
                  <pre>{result.expectedOutput}</pre>
                </div>

                {result.error ? (
                  <div className="test-error">
                    <strong>Error:</strong>
                    <pre>{result.error}</pre>
                  </div>
                ) : (
                  <div className="test-actual">
                    <strong>Your Output:</strong>
                    <pre>{result.actualOutput || "No output"}</pre>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // const renderTestResults = () => {
  //   if (!testResults || !showTestResults) return null;

  //   return (
  //     <div className="test-results">
  //       <h3>Test Result</h3>
  //       <div className={`test-summary ${testResults.passed ? 'passed' : 'failed'}`}>
  //         {testResults.passed ? 'Test Passed!' : 'Test Failed'}
  //       </div>

  //       <div className="test-cases">
  //         {testResults.results.map((result, index) => (
  //           <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
  //             <div className="test-case-header">
  //               Sample Test Case {index + 1} {result.passed ? '✓' : '✗'}
  //             </div>

  //             <div className="test-case-details">
  //               {result.error ? (
  //                 <div className="test-error">
  //                   <strong>Error:</strong>
  //                   <pre>{result.error}</pre>
  //                 </div>
  //               ) : (
  //                 <>
  //                   {result.expectedOutput && (
  //                     <div className="test-expected">
  //                       <strong>Expected Output:</strong>
  //                       <pre>{result.expectedOutput}</pre>
  //                     </div>
  //                   )}
  //                   <div className="test-actual">
  //                     <strong>Your Output:</strong>
  //                     <pre>{result.actualOutput || 'No output'}</pre>
  //                   </div>
  //                 </>
  //               )}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  // const renderTestResults = () => {
  //   if (!testResults || !showTestResults) return null;

  //   return (
  //     <div className="test-results">
  //       <h3>Test Results</h3>
  //       <div className={`test-summary ${testResults.passed ? 'passed' : 'failed'}`}>
  //         {testResults.passed ? 'All tests passed!' : 'Some tests failed'}
  //       </div>

  //       <div className="test-cases">
  //         {testResults.results.map((result, index) => (
  //           <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
  //             <div className="test-case-header">
  //               Test Case {index + 1} {result.passed ? '✓' : '✗'}
  //               {result.error && <span className="error-badge">Error</span>}
  //             </div>

  //             <div className="test-case-details">
  //               {result.error ? (
  //                 <div className="test-error">
  //                   <strong>Error:</strong>
  //                   <pre>{result.error}</pre>
  //                 </div>
  //               ) : (
  //                 <>
  //                   <div className="test-expected">
  //                     <strong>Expected Output:</strong>
  //                     <pre>{result.expectedOutput}</pre>
  //                   </div>
  //                   <div className="test-actual">
  //                     <strong>Your Output:</strong>
  //                     <pre>{result.actualOutput || 'No output'}</pre>
  //                   </div>
  //                 </>
  //               )}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  // const renderTestResults = () => {
  //   if (!testResults || !showTestResults) return null;

  //   return (
  //     <div className="test-results">
  //       <h3>Test Results</h3>
  //       <div className={`test-summary ${testResults.passed ? 'passed' : 'failed'}`}>
  //         {testResults.passed ? 'All tests passed!' : 'Some tests failed'}
  //       </div>

  //       <div className="test-cases">
  //         {testResults.results.map((result, index) => (
  //           <div key={index} className={`test-case ${result.passed ? 'passed' : 'failed'}`}>
  //             <div className="test-case-header">
  //               Test Case {index + 1} {result.passed ? '✓' : '✗'}
  //             </div>

  //             <div className="test-case-details">
  //               <div className="test-input">
  //                 <strong>Input:</strong>
  //                 <pre>{result.input}</pre>
  //               </div>

  //               {result.passed ? (
  //                 <div className="test-output">
  //                   <strong>Output:</strong>
  //                   <pre>{result.actualOutput}</pre>
  //                 </div>
  //               ) : (
  //                 <>
  //                   <div className="test-expected">
  //                     <strong>Expected Output:</strong>
  //                     <pre>{result.expectedOutput}</pre>
  //                   </div>
  //                   <div className="test-actual">
  //                     <strong>Your Output:</strong>
  //                     <pre>{result.actualOutput}</pre>
  //                   </div>
  //                   {result.error && (
  //                     <div className="test-error">
  //                       <strong>Error:</strong>
  //                       <pre>{result.error}</pre>
  //                     </div>
  //                   )}
  //                 </>
  //               )}
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !rightPanelRef.current) return;

    const container = rightPanelRef.current.parentElement;
    const containerRect = container.getBoundingClientRect();
    const newWidth = containerRect.right - e.clientX;

    // Set minimum and maximum widths
    if (newWidth >= 400 && newWidth <= containerRect.width - 400) {
      rightPanelRef.current.style.width = `${newWidth}px`;
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
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
        <Link to="/problems" className="back-link">
          Back to Problems
        </Link>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="problem-solving-container">
        <NavigationBar />
        <div className="error">Problem not found</div>
        <Link to="/problems" className="back-link">
          Back to Problems
        </Link>
      </div>
    );
  }

  return (
    <div className="problem-solving-container">
      <NavigationBar />
      <div className="problem-header">
        <h1>{problem.title}</h1>
        <div className="problem-meta">
          <span className={`difficulty ${problem.difficulty.toLowerCase()}`}>
            {problem.difficulty}
          </span>
          {problemStatus === "solved" && (
            <span className="status-badge solved">Solved</span>
          )}
          {problemStatus === "attempted" && (
            <span className="status-badge attempted">Attempted</span>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="left-panel">
          <div className="tabs">
            <button
              className={`tab ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab ${activeTab === "discussion" ? "active" : ""}`}
              onClick={() => setActiveTab("discussion")}
            >
              Discussion
            </button>
            <button
              className={`tab ${activeTab === "hints" ? "active" : ""}`}
              onClick={() => setActiveTab("hints")}
            >
              Hints
            </button>
          </div>

          <div className="content-area">
            {activeTab === "description" && (
              <ProblemDescription description={problem.description} />
            )}

            {activeTab === "discussion" && <DiscussionSection problemId={id} />}

            {activeTab === "hints" && <HintsSection problemId={id} />}
          </div>
        </div>

        <div className="right-panel" ref={rightPanelRef}>
          <div className="resize-handle" onMouseDown={handleMouseDown} />
          <div className="code-editor">
            <div className="editor-header">
              <div className="button-group">
                <button
                  className="run-button"
                  onClick={handleRunCode}
                  disabled={executing}
                >
                  Run Code
                </button>
                <button
                  className="submit-button"
                  onClick={handleSubmitSolution}
                  disabled={executing}
                >
                  Submit Solution
                </button>
              </div>
            </div>
            <div className="editor-container">
              <Editor
                height="100%"
                defaultLanguage="c"
                value={code}
                onChange={setCode}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </div>

          {/* <div className="output-section">
            <div className="output-header">
              <h3>Output</h3>
            </div>
            <div className="output-content">
              {executing ? (
                <div className="execution-status">Executing code...</div>
              ) : (
                <>
                  {output && <pre className="output-log">{output}</pre>}
                  {executionResult && (
                    <div className={`execution-result ${executionResult.type}`}>
                      <div className="result-message">{executionResult.message}</div>
                      {executionResult.details && (
                        <pre className="error-details">
                          {executionResult.details}
                        </pre>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div> */}
          <div className="output-section">
            <div className="output-header">
              <h3>Output</h3>
            </div>
            <div className="output-content">
              {executing ? (
                <div className="execution-status">Executing code...</div>
              ) : (
                <>
                  {output && <pre className="output-log">{output}</pre>}
                  {executionResult && (
                    <div className={`execution-result ${executionResult.type}`}>
                      <div className="result-message">
                        {executionResult.message}
                      </div>
                      {/* {executionResult.details && (
                      <pre className="error-details">
                        {executionResult.details}
                      </pre>
                    )} */}
                    </div>
                  )}
                  {/* Move test results here */}
                  {showTestResults && renderTestResults()}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* {showTestResults && renderTestResults()} */}
    </div>
  );
}

export default ProblemSolvingPage;
