import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Dashboard from "./components/Dashboard";
import CompanyAnalysis from "./components/CompanyAnalysis";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/stock/:symbol" element={<CompanyAnalysis />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;