import { Home, ClipboardList, BarChart3, Users, UserPlus, GraduationCap } from "lucide-react";

export const MENU_ITEMS = [
  { id: "dashboard", name: "Dashboard", icon: Home, to: "/", type: "single" },
  { 
    id: "entries", 
    name: "Manage Entries", 
    icon: ClipboardList, 
    type: "group",
    items: [
      { id: "playerEntries", name: "Player Entries", to: "/entries", icon: ClipboardList },
      { id: "academyEntries", name: "Academy Entries", to: "/academyEntries", icon: GraduationCap }
    ]
  },
  { id: "users", name: "Manage Users", icon: Users, to: "/users", type: "single" },
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
  { id: "partners", name: "Manage Partner Request", icon: UserPlus, to: "/partners", type: "single" },
];