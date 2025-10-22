// HomePage.jsx
import Footer from "../components/Footer";
import HeroSection from "../components/Sections/HeroSection";
import AboutSection from "../components/Sections/AboutSection";
import TournamentCategories from "../components/Sections/TournamentCategories";
import PriceDistribution from "../components/Sections/PriceDistribution";
import CallToAction from "../components/Sections/CallToAction";

const HomePage = () => {
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
        <CallToAction />
      </div>
     <Footer/>
    </div>
  );
};

export default HomePage;
