import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Dashboard from "./Pages/Dashboard/Dashboard";
import Analytics from "./Pages/Analytics/Analytics";
import Settings from "./Pages/Settings/Settings";



// import Universities from "./pages/Universities";
// import PromptManager from "./pages/PromptManager";
// import Users from "./pages/Users";

// import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
      

        {/* Admin Layout */}
        <Route element={<Home />}>
          <Route path="/dashboard" element={<Dashboard />} />
             <Route path="/analytics" element={<Analytics />} />
               <Route path="/settings" element={<Settings />} /> 
          
        
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;