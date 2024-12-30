// frontend/src/pages/ProblemSolvingPage.js
import React, { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { Link } from "react-router-dom";

function ProblemSolvingPage({ match }) {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

  const handleRunCode = async () => {
    try {
      const response = await axios.post("/api/execute", { code });
      setOutput(response.data.output);
    } catch (error) {
      console.error("Code execution failed", error);
    }
  };

  return (
    <div>
      <h1>Problem Solving Page</h1>
      <Editor
        height="400px"
        language="c"
        value={code}
        onChange={(value) => setCode(value)}
      />
      <button onClick={handleRunCode}>Run</button>
      <pre>{output}</pre>
    </div>
  );
}

export default ProblemSolvingPage;
