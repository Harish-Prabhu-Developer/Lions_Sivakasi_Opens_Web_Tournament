// HomePage.jsx
import React from "react";
import HeroSection from "../components/Sections/HeroSection";
import AboutSection from "../components/Sections/AboutSection";
import TournamentCategories from "../components/Sections/TournamentCategories";
import PriceDistribution from "../components/Sections/PriceDistribution";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-start w-full bg-gradient-to-b from-[#0a192f] to-[#0f223f] text-gray-200">
      {/* Hero */}
      <section className="w-full">
        <HeroSection />
      </section>

      {/* About */}
      <section className="w-full">
        <AboutSection />
      </section>

      {/* Tournaments Categories */}
      <section className="w-full">
        <TournamentCategories />
      </section>

      {/* Price Distribution */}
      <section className="w-full">
        <PriceDistribution />
      </section>
    </div>
  );
};

export default HomePage;
