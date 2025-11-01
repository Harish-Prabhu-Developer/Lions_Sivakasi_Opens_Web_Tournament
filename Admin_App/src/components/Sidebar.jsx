import React, { useMemo, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import Tooltip from "./Tooltip";
import { MENU_ITEMS } from "../constants/menuItems";
import { IMAGES } from "../constants/images";
import { useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../../../Player_App/src/constants";
import axios from "axios";
import { toast } from "react-hot-toast";
import { getUser } from "../utils/authHelpers";
const Sidebar = ({
  isMobileOpen,
  setIsMobileOpen,
  isDesktopCollapsed,
  setIsDesktopCollapsed,
}) => {
  const [user, setUser] = useState(getUser());
  const isExpanded = !isDesktopCollapsed;
  const navigate = useNavigate();
  const location = useLocation();

  const linkClasses = useMemo(
    () =>
      "flex items-center gap-4 p-3 rounded-lg text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-300 ease-in-out",
    []
  );

  const activeClasses = useMemo(
    () =>
      "flex items-center gap-4 p-3 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-300 transition-all duration-300 ease-in-out",
    []
  );

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${API_URL}/api/v1/auth/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
      toast.success("Logout Successful", { duration: 2000 });
      localStorage.removeItem("token");
      // window.location.reload();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 min-h-screen bg-black/60 z-30 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />
      <aside
        className={`fixed top-0 left-0 min-h-screen z-40 flex flex-col bg-white border-r border-gray-200 shadow-xl
        transition-[width,transform] duration-500 ease-in-out transform-gpu
        ${isExpanded ? "sidebar-expanded" : "sidebar-collapsed"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100">
          <button
            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all duration-300 md:block hidden"
            onClick={() => setIsDesktopCollapsed((prev) => !prev)}
          >
            <Menu
              className={`w-8 h-8 transform transition-transform duration-500 ${
                isExpanded ? "rotate-0" : "rotate-180"
              }`}
            />
          </button>

          {/* Logo/Title */}
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden flex-1`}
            style={{
              opacity: isExpanded ? 1 : 0,
              transform: isExpanded
                ? "translateX(0px) scale(1)"
                : "translateX(-10px) scale(0.98)",
              transition:
                "opacity 0.3s ease, transform 0.4s ease, width 0.4s ease",
              width: isExpanded ? "auto" : "0px",
            }}
          >
            <h1 className="text-lg font-extrabold text-center tracking-wider text-gray-800 whitespace-nowrap">
              LSP ADMIN PANEL
            </h1>
          </div>

          {/* Mobile close */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-200 transition-all duration-300"
            onClick={() => setIsMobileOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex flex-col flex-1 px-3 py-4 gap-2 overflow-y-auto overflow-x-hidden custom-scroll transition-all duration-400 ease-in-out min-w-[280px] max-w-[260px]">
          {MENU_ITEMS.map((item) => (
            <Tooltip
              key={item.id}
              content={item.name}
              showCondition={!isExpanded}
            >
              <button
                onClick={() => {
                  navigate(item.to);
                  setIsMobileOpen(false);
                }}
                className={`${linkClasses} ${
                  item.to === location.pathname ? activeClasses : ""
                } ${
                  isExpanded ? "justify-start" : "justify-center"
                } items-center`}
              >
                <item.icon className="w-6 h-6 shrink-0 transition-transform duration-300" />
                <span
                  className={`
              transition-[opacity,transform] duration-350 delay-75 ease-in-out
              ${
                isExpanded
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-3 hidden"
              }
              font-medium whitespace-nowrap
            `}
                >
                  {item.name}
                </span>
              </button>
            </Tooltip>
          ))}
        </nav>
        {/* Profile Section */}
        <div
          className={`border-t border-gray-200 px-4 py-4 transition-all duration-400 ease-in-out
            ${isExpanded ? "space-y-2" : "space-y-0"} hover:bg-indigo-50`}
        >
          <Tooltip
            content={`${user.name}\n${user.role}`}
            showCondition={!isExpanded}
          >
            <div
              className={`flex items-center transition-all duration-400 ease-in-out
                ${isExpanded ? "gap-4" : "justify-center"}`}
            >
              <img
                src={IMAGES.profileImage}
                alt="profile"
                className="w-12 h-12 rounded-full border-2 border-indigo-500 transition-all duration-300 ease-in-out hover:scale-[1.05]"
              />
              <div
                className={`transition-[opacity,transform] duration-350 delay-75 ease-in-out
                  ${
                    isExpanded
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-3 hidden"
                  }`}
              >
                <h2 className="text-sm font-semibold text-gray-900">
                  {user.name}
                </h2>
                <p className="text-xs text-indigo-600 italic">
                  {user.role}
                </p>
              </div>
            </div>
          </Tooltip>
        </div>

        {/* Logout */}
        <div className="px-4 pb-4 transition-all duration-400 ease-in-out">
          <Tooltip content="Logout" showCondition={!isExpanded}>
            <button
              onClick={handleLogout}
              className={`${linkClasses} ${
                isExpanded ? "justify-start" : "justify-center"
              } text-red-600 hover:bg-red-100`}
            >
              <LogOut className="w-6 h-6 transition-transform duration-300 hover:scale-110" />
              <span
                className={`transition-[opacity,transform] duration-350 delay-75 ease-in-out
                  ${
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

      {/* Inline CSS for width animation */}
      <style>{`
        .sidebar-expanded {
          width: 18rem; /* w-72 */
        }
        .sidebar-collapsed {
          width: 5rem; /* w-20 */
        }
        aside {
          transition: width 0.45s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
