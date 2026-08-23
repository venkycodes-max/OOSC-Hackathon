import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Help from "./pages/Help.jsx";
import Welcome from "./pages/Welcome.jsx";
import Assessment from "./pages/Assessment.jsx";
import AimSelection from "./pages/AimSelection.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WeeklyQuizPage from "./pages/WeeklyQuizPage.jsx";
import LearningTrailPage from "./pages/LearningTrailPage.jsx";
import SubjectProgress from "./components/SubjectPage.jsx";
import DoubtSolver from "./pages/DoubtSolver.jsx";
import WeeklyTests from "./pages/WeeklyTests.jsx";
import Analytics from "./pages/Analytics.jsx";
import Resources from "./pages/Resources.jsx";
import ResourceDetail from "./pages/ResourceDetail.jsx";
import Settings from "./pages/Settings.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/help" element={<Help />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
      <Route path="/aim" element={<ProtectedRoute><AimSelection /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/subjects/:slug/quiz" element={<ProtectedRoute><WeeklyQuizPage /></ProtectedRoute>} />
      {/* Backward-compatible redirect; quizzes are only launched from an individual subject. */}
      <Route path="/weekly-quiz" element={<Navigate to="/subjects/mathematics" replace />} />
      <Route path="/learning-trail" element={<ProtectedRoute><LearningTrailPage /></ProtectedRoute>} />
      <Route path="/subjects/:slug" element={<ProtectedRoute><SubjectProgress /></ProtectedRoute>} />
      <Route path="/doubt-solver" element={<ProtectedRoute><DoubtSolver /></ProtectedRoute>} />
      <Route path="/weekly-tests" element={<ProtectedRoute><WeeklyTests /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><Resources /></ProtectedRoute>} />
      <Route path="/resources/:type" element={<ProtectedRoute><ResourceDetail /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
