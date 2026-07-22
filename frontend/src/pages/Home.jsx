import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";


export default function Home() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950 transition-colors duration-300">
      <Sidebar darkMode={darkMode} setDarkMode={setDarkMode} />

      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}