import { BrowserRouter, Routes, Route } from "react-router-dom";

import Reports from "../pages/interview/Reports";
import Progress from "../pages/interview/Progress";
import Dashboard from "../pages/dashboard/Dashboard";
import Home from "../pages/Home";
import Interview from "../pages/interview/Interview";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="practice" element={<Interview />} />
          <Route path="reports" element={<Reports />} />
          <Route path="progress" element={<Progress />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;