import React, { useMemo } from "react";
import { LogOut, Menu, X } from "lucide-react";
import Tooltip from "./Tooltip";
import { MENU_ITEMS } from "../constants/menuItems";
import { IMAGES } from "../constants/images";

const Sidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  isDesktopCollapsed,
  setIsDesktopCollapsed,
}) => {
  const user = { name: "Nina Ergemia", userLevel: "Senior Developer" };
  const isExpanded = !isDesktopCollapsed;

  const linkClasses = useMemo(
    () =>
      "flex items-center gap-4 p-3 rounded-xl text-gray-700 " +
      "hover:bg-indigo-100 hover:text-indigo-700 " +
      "transition-all duration-300 ease-in-out transform hover:scale-[1.02] hover:shadow-md",
    []
  );

  const activeClasses = useMemo(
    () =>
      "flex items-center gap-4 p-3 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-300 transition-all duration-300 ease-in-out",
    []
  );

  const handleLogout = () => alert("Logged out!");

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ease-in-out ${
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />

      <aside
        className={`fixed top-0 left-0 h-screen z-40 flex flex-col bg-white border-r border-gray-200 shadow-xl
        transition-all duration-500 ease-[cubic-bezier(0.45,0.05,0.55,0.95)]
        transform-gpu
        ${isExpanded ? "w-72" : "w-20"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          {/* Collapse button */}
          <button
            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-300 ease-in-out md:block hidden"
            onClick={() => setIsDesktopCollapsed((prev) => !prev)}
          >
            <Menu
              className={`w-8 h-8 transform transition-transform duration-500 ease-in-out ${
                isExpanded ? "rotate-0" : "rotate-90"
              }`}
            />
          </button>

          {/* Logo/Title */}
          <h1
            className={`text-lg font-extrabold tracking-wider text-gray-800 transition-all duration-500 ease-in-out transform ${
              isExpanded
                ? "opacity-100 scale-100 translate-x-0"
                : "opacity-0 -translate-x-4 scale-95 hidden"
            }`}
          >
            ADMIN PANEL
          </h1>

          {/* Mobile close */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-all duration-300 ease-in-out"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col flex-1 px-3 py-4 gap-2 overflow-y-auto custom-scroll transition-all duration-500 ease-in-out">
          {MENU_ITEMS.map((item) => (
            <Tooltip key={item.id} content={item.name} showCondition={!isExpanded}>
              <button
                onClick={() => console.log(`Navigate to: ${item.to}`)}
                className={`${linkClasses} ${
                  item.to === "/dashboard" ? activeClasses : ""
                } ${isExpanded ? "justify-start" : "justify-center"}`}
              >
                <item.icon
                  className="w-6 h-6 shrink-0 transition-transform duration-300 group-hover:scale-110"
                />
                <span
                  className={`transition-all duration-500 ease-in-out transform ${
                    isExpanded
                      ? "opacity-100 translate-x-0 scale-100"
                      : "opacity-0 -translate-x-2 scale-95 hidden"
                  } font-medium`}
                >
                  {item.name}
                </span>
              </button>
            </Tooltip>
          ))}
        </nav>

        {/* Profile */}
        <Tooltip
          content={`${user.name}\n${user.userLevel}`}
          showCondition={!isExpanded}
        >
          <div className="border-t border-gray-200 p-4 cursor-pointer transition-all duration-500 ease-in-out hover:bg-indigo-50">
            <div
              className={`flex items-center transition-all duration-500 ease-in-out ${
                isExpanded ? "gap-4" : "justify-center"
              }`}
            >
              <img
                src={IMAGES.profileImage}
                alt="profile"
                className="w-12 h-12 rounded-full border-2 border-indigo-500 transition-all duration-500 ease-in-out hover:scale-[1.05]"
              />
              <div
                className={`transition-all duration-500 ease-in-out transform ${
                  isExpanded
                    ? "opacity-100 translate-x-0 scale-100"
                    : "opacity-0 -translate-x-3 scale-95 hidden"
                }`}
              >
                <h2 className="text-sm font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-xs text-indigo-600 italic">
                  {user.userLevel}
                </p>
              </div>
            </div>
          </div>
        </Tooltip>

        {/* Logout */}
        <div className="px-4 pb-4">
          <Tooltip content="Logout" showCondition={!isExpanded}>
            <button
              onClick={handleLogout}
              className={`${linkClasses} ${
                isExpanded ? "justify-start" : "justify-center"
              } text-red-600 hover:bg-red-100`}
            >
              <LogOut className="w-6 h-6 transition-transform duration-300 hover:scale-110" />
              <span
                className={`transition-all duration-500 ease-in-out transform ${
                  isExpanded
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-3 hidden"
                }`}
              >
                Logout
              </span>
            </button>
          </Tooltip>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
