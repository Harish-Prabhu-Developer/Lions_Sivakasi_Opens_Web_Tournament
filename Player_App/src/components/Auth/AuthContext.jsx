// AuthContext.js
import React, { createContext, useState, useEffect } from "react";

// Create context
export const AuthContext = createContext({
  isLoggedIn: false,
  setIsLoggedIn: () => {},
});

// Provider component to wrap app root
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Listen to storage changes from other tabs
    const onStorage = () => {
      const newToken = localStorage.getItem("token");
      setIsLoggedIn(!!newToken);
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;