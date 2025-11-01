// src/constants/menuItems.js
import { Home, ClipboardList, BarChart3, Users, UserPlus } from "lucide-react";

export const MENU_ITEMS = [
  { id: "dashboard", name: "Dashboard", icon: Home, to: "/" },
  { id: "entries", name: "Manage Entries", icon: ClipboardList, to: "/entries" },
  { id: "users", name: "Manage Users", icon: Users, to: "/users" },
  { id: "reports", name: "Manage Reports", icon: BarChart3, to: "/reports" },
  { id: "partners", name: "Manage Partner Request", icon: UserPlus, to: "/partners" },
];
