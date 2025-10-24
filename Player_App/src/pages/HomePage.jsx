// HomePage.jsx
import Footer from "../components/Footer";
import HeroSection from "../components/Sections/HeroSection";
import AboutSection from "../components/Sections/AboutSection";
import TournamentCategories from "../components/Sections/TournamentCategories";
import PriceDistribution from "../components/Sections/PriceDistribution";
import CallToAction from "../components/Sections/CallToAction";
import AuthContext from "../components/Auth/AuthContext";
import { useContext, useEffect } from "react";

const HomePage = () => {
    const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);
  
    // Improve loggedIn tracking with storage event and location change
    useEffect(() => {
  
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
        window.removeEventListener("storage", storageListener);
      };
    }, [setIsLoggedIn]);
  return (
    <div className="flex flex-col items-center justify-start w-full bg-gradient-to-b from-[#0a192f] to-[#0f223f] text-gray-200">
     {/* Background glows */}
<div className="pointer-events-none select-none absolute top-[28%] left-1/3 w-96 h-96 bg-white/20 blur-[140px] rounded-full -z-10 animate-floatPulse"></div>
<div className="pointer-events-none select-none absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/25 blur-[140px] rounded-full -z-10 animate-floatPulse"></div>
<div className="pointer-events-none select-none absolute top-0 right-1/3 w-72 h-72 bg-sky-300/20 blur-[120px] rounded-full -z-10"></div>

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
