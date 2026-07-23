import { BrowserRouter, Routes, Route } from "react-router-dom";

import Entry from "../pages/Entry";
import Home from "../pages/Home";

import Dashboard from "../pages/dashboard/Dashboard";
import SetupInterview from "../pages/practice/SetupInterview";

import Interview from "../pages/interview/Interview";
import Reports from "../pages/interview/Reports";
import ReportDetail from "../pages/interview/ReportDetail";

import Speaking from "../pages/Speaking/Speaking";
import Progress from "../pages/Progress/Progress";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entry />} />

        <Route path="/dashboard" element={<Home />}>
          <Route index element={<Dashboard />} />

          <Route path="practice" element={<SetupInterview />} />
          <Route path="interview" element={<Interview />} />
          <Route path="speaking" element={<Speaking />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="progress" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;