import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reports from "../pages/interview/Reports";

import Dashboard from "../pages/dashboard/Dashboard";
import Home from "../pages/Home";
import Interview from "../pages/interview/Interview";
import Speaking from "../pages/Speaking/Speaking";
import Progress from "../pages/Progress/Progress";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="practice" element={<Interview />} />
          <Route path="reports" element={<Reports />} />
          <Route path="progress" element={<Progress />} />
          <Route path="speaking" element={<Speaking />} />
      
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;