import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MenuIcon, Menu } from "lucide-react";
import { IMAGES } from "../constants/images";

const Layout = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen w-full bg-white overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        isDesktopCollapsed={isDesktopCollapsed}
        setIsDesktopCollapsed={setIsDesktopCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isDesktopCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {/* Top Navbar */}
        <header className="flex items-center justify-between bg-white shadow-md px-4 py-3 sticky top-0 z-20 w-full">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden text-gray-700 hover:text-indigo-600 focus:outline-none shrink-0"
          >
            <Menu />
          </button>

          <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate px-2 flex-1 text-center md:text-left">
            Admin Dashboard
          </h1>

          {/* Right side (optional future icons or user info) */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <img
                src={IMAGES.profileImage}
                alt="profile"
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-indigo-500 transition-all duration-300 ease-in-out hover:scale-[1.05] object-cover"
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 transition-all w-full max-w-full duration-500 overflow-y-auto p-2 ">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;