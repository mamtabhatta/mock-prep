import { BrowserRouter, Routes, Route } from "react-router-dom";

import Entry from "../pages/Entry";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import GoogleCallback from "../pages/auth/GoogleCallback";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Home from "../pages/Home";
import Dashboard from "../pages/dashboard/Dashboard";

import SetupInterview from "../pages/practice/SetupInterview";
import Interview from "../pages/interview/Interview";
import Reports from "../pages/interview/Reports";
import ReportDetail from "../pages/interview/ReportDetail";

import Speaking from "../pages/Speaking/Speaking";
import SpeakingDetail from "../pages/Speaking/SpeakingDetail";

import Progress from "../pages/Progress/Progress";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
    path="/forgot-password"
    element={<ForgotPassword />}
/>

<Route
    path="/reset-password"
    element={<ResetPassword />}
/>
        <Route
          path="/auth/google/callback"
          element={<GoogleCallback />}
        />

        <Route path="/dashboard" element={<Home />}>
          <Route index element={<Dashboard />} />
          <Route path="practice" element={<SetupInterview />} />
          <Route
            path="interview/:sessionId"
            element={<Interview />}
          />
          <Route path="reports" element={<Reports />} />
          <Route
            path="reports/:id"
            element={<ReportDetail />}
          />
          <Route path="progress" element={<Progress />} />
          <Route path="speaking" element={<Speaking />} />
          <Route
            path="speaking-detail/:sessionId"
            element={<SpeakingDetail />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;