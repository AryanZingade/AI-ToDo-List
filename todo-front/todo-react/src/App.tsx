import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <h1>Task Management</h1>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />{" "}
        </Routes>
      </div>
    </Router>
  );
};

export default App;
