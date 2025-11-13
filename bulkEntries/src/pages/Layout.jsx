// pages/Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1f]">
      {/* Top Navigation Bar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1 mt-[70px] w-full ">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
