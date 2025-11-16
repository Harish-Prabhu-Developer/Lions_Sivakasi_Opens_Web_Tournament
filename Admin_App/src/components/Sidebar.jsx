import React, { useMemo, useState, useEffect } from "react";
import { LogOut, Menu, X, ChevronDown, ChevronRight, Home, ClipboardList, BarChart3, Users, UserPlus, GraduationCap } from "lucide-react";
import Tooltip from "./Tooltip";
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
  const [openGroups, setOpenGroups] = useState({
    entries: false,
    reports: false
  });
  const isExpanded = !isDesktopCollapsed;
  const navigate = useNavigate();
  const location = useLocation();

  // Grouped menu items
  const groupedMenuItems = useMemo(() => [
    { 
      id: "dashboard", 
      name: "Dashboard", 
      icon: Home, 
      to: "/", 
      type: "single" 
    },
    {
      id: "entries",
      name: "Manage Entries",
      icon: ClipboardList,
      type: "group",
      items: [
        { id: "playerEntries", name: "Player Entries", to: "/entries", icon: Users },
        { id: "academyEntries", name: "Academy Entries", to: "/academyEntries", icon: GraduationCap }
      ]
    },
    { 
      id: "users", 
      name: "Manage Users", 
      icon: Users, 
      to: "/users", 
      type: "single" 
    },
    {
      id: "reports",
      name: "Manage Reports",
      icon: BarChart3,
      type: "group",
      items: [
        { id: "playerReports", name: "Player Reports", to: "/reports", icon: BarChart3 },
        { id: "academyReports", name: "Academy Reports", to: "/academyReports", icon: BarChart3 }
      ]
    },
    { 
      id: "partners", 
      name: "Manage Partner Request", 
      icon: UserPlus, 
      to: "/partners", 
      type: "single" 
    },
  ], []);

  // Auto-open groups based on current route
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath === '/entries' || currentPath === '/academyEntries') {
      setOpenGroups(prev => ({ ...prev, entries: true }));
    }
    if (currentPath === '/reports' || currentPath === '/academyReports') {
      setOpenGroups(prev => ({ ...prev, reports: true }));
    }
  }, [location.pathname]);

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
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Logout failed. Please try again.");
    }
  };

  const toggleGroup = (groupId) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleNavigation = (to) => {
    navigate(to);
    setIsMobileOpen(false);
  };

  const isItemActive = (item) => {
    if (item.type === "group") {
      return item.items.some(subItem => subItem.to === location.pathname);
    }
    return item.to === location.pathname;
  };

  const isSubItemActive = (to) => to === location.pathname;

  const renderMenuItem = (item) => {
    if (item.type === "group") {
      const isActive = isItemActive(item);
      
      return (
        <div key={item.id} className="mb-1 ">
          <Tooltip content={item.name} showCondition={!isExpanded}>
            <button
              onClick={() => toggleGroup(item.id)}
              className={`
                flex items-center w-full p-3 rounded-lg transition-all duration-200
                ${isExpanded ? 'justify-between' : 'justify-center'}
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-6 h-6 shrink-0" />
                <span
                  className={`
                    font-medium whitespace-nowrap transition-all duration-200
                    ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'}
                  `}
                >
                  {item.name}
                </span>
              </div>
              
              {isExpanded && (
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    openGroups[item.id] ? 'rotate-180' : ''
                  }`}
                />
              )}
            </button>
          </Tooltip>

          {/* Submenu Items */}
          {isExpanded && openGroups[item.id] && (
            <div className="mt-1 ml-2 space-y-1 border-l-2 border-indigo-100 pl-2">
              {item.items.map((subItem) => (
                <Tooltip 
                  key={subItem.id} 
                  content={subItem.name} 
                  showCondition={!isExpanded}
                >
                  <button
                    onClick={() => handleNavigation(subItem.to)}
                    className={`
                      flex items-center w-full p-2 rounded-lg transition-all duration-200
                      ${isExpanded ? 'justify-start gap-3' : 'justify-center'}
                      ${isSubItemActive(subItem.to)
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700'
                      }
                    `}
                  >
                    <subItem.icon className="w-5 h-5 shrink-0" />
                    <span
                      className={`
                        text-sm font-medium whitespace-nowrap transition-all duration-200
                        ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'}
                      `}
                    >
                      {subItem.name}
                    </span>
                  </button>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Single menu item
    const isActive = isItemActive(item);
    
    return (
      <Tooltip key={item.id} content={item.name} showCondition={!isExpanded}>
        <button
          onClick={() => handleNavigation(item.to)}
          className={`
            flex items-center w-full p-3 rounded-lg transition-all duration-200 mb-1
            ${isExpanded ? 'justify-start gap-3' : 'justify-center'}
            ${isActive
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
            }
          `}
        >
          <item.icon className="w-6 h-6 shrink-0" />
          <span
            className={`
              font-medium whitespace-nowrap transition-all duration-200
              ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'}
            `}
          >
            {item.name}
          </span>
        </button>
      </Tooltip>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
      />
      
      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col bg-white border-r border-gray-200 shadow-xl
          transition-all duration-300 ease-in-out
          ${isExpanded ? "w-72" : "w-16"}
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-100">
          {isExpanded ? (
            <>
              <button
                onClick={() => setIsDesktopCollapsed(true)}
                className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-lg font-bold text-gray-800 ml-3 flex-1">
                LSP ADMIN
              </h1>
            </>
          ) : (
            <button
              onClick={() => setIsDesktopCollapsed(false)}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors mx-auto"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-3 overflow-y-auto">
          {groupedMenuItems.map(renderMenuItem)}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4 space-y-3">
          {/* User Profile */}
          <Tooltip content={`${user.name}\n${user.role}`} showCondition={!isExpanded}>
            <div className={`flex items-center ${isExpanded ? 'gap-3' : 'justify-center'}`}>
              <img
                src={IMAGES.profileImage}
                alt="Profile"
                className="w-8 h-8 rounded-full border-2 border-indigo-500 object-cover"
              />
              {isExpanded && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-indigo-600 truncate">
                    {user.role}
                  </p>
                </div>
              )}
            </div>
          </Tooltip>

          {/* Logout Button */}
          <Tooltip content="Logout" showCondition={!isExpanded}>
            <button
              onClick={handleLogout}
              className={`
                flex items-center w-full p-2 rounded-lg text-red-600 hover:bg-red-50 
                transition-all duration-200
                ${isExpanded ? 'justify-start gap-3' : 'justify-center'}
              `}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span
                className={`
                  font-medium whitespace-nowrap transition-all duration-200
                  ${isExpanded ? 'opacity-100 block' : 'opacity-0 hidden'}
                `}
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