import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin/dashboard",
  },
  {
    title: "Universities",
    icon: GraduationCap,
    path: "/admin/universities",
  },
  {
    title: "Prompt Manager",
    icon: FileText,
    path: "/admin/prompts",
  },
  {
    title: "Users",
    icon: Users,
    path: "/admin/users",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/admin/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col bg-[#2149D8] text-white shadow-lg">
      {/* Logo */}
      <div className="px-5 pt-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-sm font-semibold">
            M
          </div>

          <h1 className="text-xl font-semibold tracking-tight">
            MockPrep
          </h1>
        </div>

        <p className="mt-7 text-[10px] font-semibold uppercase tracking-[2px] text-blue-200">
          Admin Panel
        </p>
      </div>

      {/* Navigation */}
      <nav className="mt-4 flex-1 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.title}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 font-semibold text-white"
                      : "font-medium text-blue-100 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={17} strokeWidth={2} />

                <span>{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-3">
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-blue-100 transition hover:bg-white/10 hover:text-white">
          <LogOut size={17} strokeWidth={2} />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
}