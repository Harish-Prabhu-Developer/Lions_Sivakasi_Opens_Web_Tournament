// AuthContext.js
import React, { createContext, useState, useEffect } from "react";

// Create context
export const AuthContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
  user: null,
  setUser: () => {},
  logout: () => {},
});

// Provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // On mount, check localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Error parsing user from storage:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }

    // Listen for token/user changes (multi-tab sync)
    const handleStorage = () => {
      const newToken = localStorage.getItem("token");
      const newUser = localStorage.getItem("user");

      if (newToken && newUser) {
        setUser(JSON.parse(newUser));
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, user, setUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
