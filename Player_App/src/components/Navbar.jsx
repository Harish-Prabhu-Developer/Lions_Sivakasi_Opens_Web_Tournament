import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../assets/logo.png";
import AuthContext from "./Auth/AuthContext";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  // Improve loggedIn tracking with storage event and location change
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    const checkLoggedIn = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    checkLoggedIn();

    const storageListener = (e) => {
      if (e.key === "token") {
        checkLoggedIn();
      }
    };

    window.addEventListener("storage", storageListener);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("storage", storageListener);
    };
  }, [location, setIsLoggedIn]);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const navLinks = [
    { name: "Home", path: "/" },
    ...(isLoggedIn ? [{ name: "Dashboard", path: "/dashboard" }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b border-white/10 backdrop-blur-lg ${
        scrolled
          ? "bg-[#0a192f]/95 shadow-md"
          : "bg-gradient-to-r from-[#0a192f]/90 to-[#0f223f]/90"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-[70px]">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src={Logo} className="w-8 h-8" alt="Lions Sivakasi Open Logo" />
          <span className="text-white font-semibold text-lg md:text-xl tracking-wide">
            <span className="hidden md:inline">Lions Sivakasi Open</span>
            <span className="md:hidden">LSO</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <li key={link.name}>
                <Link
                  to={link.path}
                  className={`relative transition-all duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-cyan-400 after:transition-all after:duration-300 ${
                    isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                  }`}
                >
                  <span
                    className={`text-sm font-medium tracking-wide ${
                      isActive
                        ? "text-cyan-300 after:w-full"
                        : "text-gray-200 hover:text-cyan-200"
                    }`}
                  >
                    {link.name}
                  </span>
                </Link>
              </li>
            );
          })}
          {!isLoggedIn && (
            <Link
              to="/register"
              className="hidden md:inline-flex items-center justify-center w-36 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 tracking-wide shadow-md hover:from-cyan-500 hover:to-cyan-300 active:scale-95 transition-all duration-300"
            >
              <span className="text-white font-semibold text-sm">Register</span>
            </Link>
          )}
        </ul>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden text-white transition-transform duration-300 active:scale-90"
        >
          {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col items-center bg-[#0a192f]/95 py-6 space-y-6 border-t border-white/10">
          <ul className="flex flex-col items-center space-y-4 text-white text-lg">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`relative transition-all duration-300 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:bg-cyan-400 after:transition-all after:duration-300 ${
                      isActive ? "after:w-full" : "after:w-0 hover:after:w-full"
                    }`}
                  >
                    <span
                      className={`text-sm font-medium${
                        isActive
                          ? "text-white after:w-full"
                          : "text-white hover:text-cyan-200"
                      }`}
                    >
                      {link.name}
                    </span>
                  </Link>
                </li>
              );
            })}
            {!isLoggedIn && (
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="w-40 h-11 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 flex items-center justify-center shadow-md hover:from-cyan-500 hover:to-cyan-300 active:scale-95 transition-all duration-300"
              >
                <span className="text-white font-semibold text-sm">
                  Register
                </span>
              </Link>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
