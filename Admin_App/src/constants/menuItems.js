// src/constants/menuItems.js
import { Home, ClipboardList, BarChart3, Users, Settings } from "lucide-react";

export const MENU_ITEMS = [
  { id: "dashboard", name: "Dashboard", icon: Home, to: "/dashboard" },
  { id: "entries", name: "Player Entries", icon: ClipboardList, to: "/tasks" },
  { id: "users", name: "Users", icon: Users, to: "/users" },
  { id: "reports", name: "Reports", icon: BarChart3, to: "/reports" },
  { id: "parnter", name: "Parnter Change Request", icon: Users, to: "/users" },
];
