import {
  LayoutDashboard,
  BookOpen,
  FileText,
  TrendingUp,
  Moon,
  Sun,
  LogOut,
} from "lucide-react";

import { useNavigate, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Sidebar({
  darkMode,
  setDarkMode,
}) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const menus = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      name: "Practice",
      path: "/dashboard/practice",
      icon: <BookOpen size={18} />,
    },
    {
      name: "My Reports",
      path: "/dashboard/reports",
      icon: <FileText size={18} />,
    },
    {
      name: "Progress",
      path: "/dashboard/progress",
      icon: <TrendingUp size={18} />,
    },
  ];

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <aside className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between px-5 py-6">
      <div>
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
            M
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            MockPrep
          </h1>
        </div>

        <nav className="space-y-2">
          {menus.map((menu) => (
            <NavLink
              key={menu.name}
              to={menu.path}
              end={menu.path === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`
              }
            >
              {menu.icon}
              {menu.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? (
            <Sun size={18} />
          ) : (
            <Moon size={18} />
          )}

          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>

        <div className="border-t border-gray-200 dark:border-gray-700 my-6" />

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center font-semibold text-blue-600 dark:text-white">
            {getInitials(user?.fullName)}
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.fullName || "User"}
            </h2>

            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role || "Student"}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-6 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-red-500 transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}