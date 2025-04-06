import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProblemsPage from "./pages/ProblemsPage";
import ProblemSolvingPage from "./pages/ProblemSolvingPage";
import HomePage from "./pages/HomePage";
import API from "./utils/api"; // Corrected import path

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problem/:id" element={<ProblemSolvingPage />} />
        <Route path="/problem-solving" element={<ProblemSolvingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
