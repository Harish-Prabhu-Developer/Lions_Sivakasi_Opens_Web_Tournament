// Footer.jsx
import { Facebook, Instagram } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiWhatsappLogoLight } from "react-icons/pi";

const IsLoggedIn = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

const Footer = () => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(IsLoggedIn());
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <footer className="flex flex-col bg-gradient-to-r from-[#0a192f]/90 to-[#0f223f]/90 items-center justify-around w-full py-14 text-sm text-gray-300">
        {/* Navigation Links */}
        <div className="flex items-center gap-8">
          <Link to="/">
            <span className="font-medium text-gray-200 hover:text-cyan-400 transition-all">
              Home
            </span>
          </Link>
          {!loggedIn && (
            <Link to="/register">
              <span className="font-medium text-gray-200 hover:text-cyan-400 transition-all">
                Register
              </span>
            </Link>
          )}
          {loggedIn && (
            <Link to="/dashboard">
              <span className="font-medium text-gray-200 hover:text-cyan-400 transition-all">
                Dashboard
              </span>
            </Link>
          )}
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-4 mt-8 text-cyan-400">
          <a
            href="https://www.facebook.com/lionssportsfoundation"
            target="_blank"
            className="hover:-translate-y-0.5 transition-all duration-300"
            rel="noreferrer"
          >
            <Facebook className="text-gray-200 hover:text-indigo-500" />
          </a>
          <a
            href="https://www.instagram.com/lionssportsfoundation"
            className="hover:-translate-y-0.5 transition-all duration-300"
          >
            <Instagram className="text-gray-200 hover:text-pink-500" />
          </a>
          <a
            href="#"
            className="hover:-translate-y-0.5 transition-all duration-300"
          >
            <PiWhatsappLogoLight
              size={28.5}
              className="font-bold text-gray-200 hover:text-green-400"
            />
          </a>
        </div>

        {/* Copyright */}
        <p className="mt-8 text-center text-gray-200">
          {`Copyright © ${new Date().getFullYear()} `}
          <a
            href="https://lionssportsfoundation.org"
            target="_blank"
            rel="noreferrer"
          >
            <span className="text-cyan-400 font-semibold hover:underline">
              Lions Sports Foundation , Sivakasi
            </span>
          </a>
          . All rights reserved.
        </p>

        {/* Designer Credit */}
        <p className="mt-2 text-center text-sm text-gray-200">
          Designed by{" "}
          <a href="https://harishprabhu.netlify.app/#services">
            <span className="text-cyan-400 font-medium hover:underline">
              Harish Prabhu
            </span>
          </a>
        </p>
      </footer>
    </>
  );
};

export default Footer;
