// HeroSection.jsx
import React from "react";
import { Calendar, MapPin, IndianRupee, Trophy, ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative flex flex-col items-center justify-center text-center min-h-screen bg-gradient-to-b from-[#081425] via-[#0c1e38] to-[#0f223f] text-gray-100 overflow-hidden px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }

        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes floatPulse {
          0%, 100% { transform: translateY(0); opacity: 0.9; }
          50% { transform: translateY(-10px); opacity: 1; }
        }

        .animate-fadeUp { animation: fadeUp 1s ease-out forwards; }
        .animate-floatPulse { animation: floatPulse 6s ease-in-out infinite; }

        .shine-text {
          background: linear-gradient(90deg, #00E5FF, #80D8FF, #B39DDB, #00E5FF);
          background-size: 300% 300%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientMove 5s infinite ease-in-out;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Dynamic background glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-500/25 blur-[140px] rounded-full -z-10 animate-floatPulse"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/25 blur-[140px] rounded-full -z-10 animate-floatPulse"></div>
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-sky-400/15 blur-[120px] rounded-full -z-10"></div>

      {/* Tournament Tag */}
      <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-400/30 backdrop-blur-md px-6 py-2 rounded-full text-cyan-300 text-sm mt-24 shadow-md shadow-cyan-900/30 animate-fadeUp">
        <Trophy className="w-4 h-4" />
        <span>State Level Tournament</span>
      </div>

      {/* Main Title */}
      <h1 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight animate-fadeUp [animation-delay:0.2s] max-w-4xl">
        9<sup>th</sup> Lions Sivakasi Open{" "}
        {/* <span className="shine-text">Balamurugan Memorial Trophy</span> */}
      </h1>

      {/* Year */}
      <p className="text-lg md:text-xl text-cyan-300 tracking-wide mt-4 animate-fadeUp [animation-delay:0.4s] font-semibold">
        Badminton Championship 2025
      </p>

      {/* Tournament Info */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-8 text-gray-300 text-sm md:text-base animate-fadeUp [animation-delay:0.6s]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>28 Nov – 30 Nov 2025</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span>Anso sports Academy, Sivakasi</span>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="w-4 h-4 text-cyan-400" />
          <span>₹2.5 Lakhs Prize Pool</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap justify-center gap-6 mt-16 animate-fadeUp [animation-delay:0.8s]">
        <button className="px-10 py-3.5 rounded-full font-semibold bg-gradient-to-r from-cyan-600 to-sky-400 hover:from-cyan-500 hover:to-sky-300 text-white shadow-lg shadow-cyan-400/40 active:scale-95 transition-all duration-300">
          Register Now
        </button>
        <button className="px-10 py-3.5 rounded-full font-medium border border-gray-500/40 bg-transparent hover:bg-white/10 text-gray-300 hover:text-white hover:scale-105 transition-all duration-300">
          View Categories
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
        <a href="#about" className="flex flex-col items-center group">
          <span className="text-xs text-gray-400 mb-1 group-hover:text-cyan-300 transition-all">
            Scroll Down
          </span>
          <ArrowDown className="h-5 w-5 text-cyan-400 group-hover:text-cyan-300 transition-all" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
