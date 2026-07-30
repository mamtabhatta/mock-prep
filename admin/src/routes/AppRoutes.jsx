import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "../Pages/Home";
import Dashboard from "../Pages/Dashboard/Dashboard";
import Universities from "../Pages/University/Universities";
import Users from "../Pages/Users/Users";
import PromptManager from "../Pages/Promptmanager/PromptManager";
import Analytics from "../Pages/Analytics/Analytics";
import Settings from "../Pages/Settings/Settings";

function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/admin" replace />} />

                <Route path="/admin" element={<Home />}>
                    <Route index element={<Dashboard />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="universities" element={<Universities />} />
                    <Route path="prompts" element={<PromptManager />} />
                     <Route path="users" element={<Users />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRoutes;