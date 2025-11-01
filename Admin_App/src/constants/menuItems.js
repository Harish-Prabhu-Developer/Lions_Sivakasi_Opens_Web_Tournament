// src/constants/menuItems.js
import { Home, ClipboardList, BarChart3, Users, Settings } from "lucide-react";

export const MENU_ITEMS = [
  { id: "dashboard", name: "Dashboard", icon: Home, to: "/dashboard" },
  { id: "entries", name: "Manage Entries", icon: ClipboardList, to: "/tasks" },
  { id: "users", name: "Manage Users", icon: Users, to: "/users" },
  { id: "reports", name: "Manage Reports", icon: BarChart3, to: "/reports" },
  { id: "parnter", name: "Manage Partner Request", icon: Users, to: "/users" },
];
