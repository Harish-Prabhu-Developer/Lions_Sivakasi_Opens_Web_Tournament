// HomePage.jsx
import Footer from "../components/Footer";
import HeroSection from "../components/Sections/HeroSection";
import AboutSection from "../components/Sections/AboutSection";
import TournamentCategories from "../components/Sections/TournamentCategories";
import PriceDistribution from "../components/Sections/PriceDistribution";
import CallToAction from "../components/Sections/CallToAction";

import {  useEffect, useState } from "react";
import { IsLoggedIn } from "../utils/authHelpers";

const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(IsLoggedIn()); // ✅ initialize from helper

  useEffect(() => {
    // ✅ Re-check login status on localStorage change or navigation
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "user") {
        setIsLoggedIn(IsLoggedIn());
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("focus", () => setIsLoggedIn(IsLoggedIn())); // recheck when tab focused

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("focus", () => setIsLoggedIn(IsLoggedIn()));
    };
  }, []);
  return (
    <div className="flex flex-col items-center justify-start w-full bg-gradient-to-b from-[#0a192f] to-[#0f223f] text-gray-200">

      {/* Hero */}
      <div className="w-full">
        <HeroSection />
      {/* About */}
        <AboutSection />
      {/* Tournaments Categories */}
        <TournamentCategories />
      {/* Price Distribution */}
        <PriceDistribution />
      {/* Call To Action */}
        {!isLoggedIn && <CallToAction />}
      </div>
     <Footer/>
    </div>
  );
};

export default HomePage;
