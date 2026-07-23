import { BrowserRouter, Routes, Route } from "react-router-dom";
import Entry from "../pages/Entry";
import Home from "../pages/Home";
import Dashboard from "../pages/dashboard/Dashboard";
import Reports from "../pages/interview/Reports";
import Progress from "../pages/Progress/Progress";
import Speaking from "../pages/Speaking/Speaking";
import Interview from "../pages/interview/Interview";
import ReportDetail from "../pages/interview/ReportDetail";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entry />}></Route>
        <Route path="/dashboard" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="practice" element={<SetupInterview />} />
          <Route path="interview" element={<Interview />} />
          <Route path="reports" element={<Reports />} />
          <Route path="progress" element={<Progress />} />
          <Route path="speaking" element={<Speaking />} />
         <Route
  path="/reports/:id"
  element={<ReportDetail />}
/>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;