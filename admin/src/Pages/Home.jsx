
import { Outlet } from "react-router-dom";
import Sidebar from "../Component/Layout/Sidebar";

export default function Home() {
  return (
    <div className="flex h-screen bg-[#F5F7FB]">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-10">
        <Outlet />
      </main>
    </div>
  );
}