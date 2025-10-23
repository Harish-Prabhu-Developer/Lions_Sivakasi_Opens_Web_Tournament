import React, { useContext, useEffect, useState } from "react";
import { Calendar, MapPin, IndianRupee, Trophy, ArrowDown, Clock } from "lucide-react";
import AuthContext from "../Auth/AuthContext";

// Tournament data from flyer
const TOURNEY = {
  name: "9 Lion’s Sivakasi Open",
  sub: "STATE LEVEL BADMINTON TOURNAMENT",
  dateRange: "28 Nov – 30 Nov 2025",
  venue: "ANSO Sports Academy, Sivakasi",
  prize: "3 Lakhs",
  entryDeadline: "2025-11-25",
  entryFee: "Singles ₹800, Doubles ₹1400",
};

function useCountdown(targetDate) {
  const [daysLeft, setDaysLeft] = useState(null);



  useEffect(() => {
    function updateCountdown() {
      const end = new Date(targetDate + "T23:59:59");
      const now = new Date();
      const diff = Math.max(
        Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        0
      );
      setDaysLeft(diff);
    }
    updateCountdown();
    const timer = setInterval(updateCountdown, 60 * 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return daysLeft;
}

const HeroSection = () => {
  const deadlineDays = useCountdown(TOURNEY.entryDeadline);
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
    <section className="relative flex flex-col items-center justify-center text-center min-h-screen bg-gradient-to-b from-[#071324] via-[#122344] to-[#1c2e44] text-gray-100 overflow-hidden px-4">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(40px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes floatPulse { 0%, 100% { transform: translateY(0); opacity: 0.90; } 50% { transform: translateY(-10px); opacity: 1; } }
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

      {/* Background glows */}
      <div className="absolute top-[28%] left-1/3 w-96 h-96 bg-cyan-400/25 blur-[140px] rounded-full -z-10 animate-floatPulse"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-400/25 blur-[140px] rounded-full -z-10 animate-floatPulse"></div>
      <div className="absolute top-0 right-1/3 w-72 h-72 bg-sky-300/15 blur-[120px] rounded-full -z-10"></div>

      {/* Tournament Tag */}
      <div className="flex items-center gap-2 bg-white/10 border border-cyan-400/30 backdrop-blur-lg px-4 py-2 rounded-full text-cyan-200 text-sm mt-20 md:mt-28 shadow-lg shadow-cyan-900/30 animate-fadeUp">
        <Trophy className="w-5 h-5" />
        <span className="tracking-wide font-medium">{TOURNEY.sub}</span>
      </div>

      {/* Main Title */}
      <h2 className="mt-8 text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight animate-fadeUp [animation-delay:0.2s] max-w-full drop-shadow-lg">
        <span className="relative inline-block">
          <span className="shine-text text-transparent">9<sup className="shine-text">th</sup> Lion’s Sivakasi Open</span>
        </span>
      </h2>
      <p className="text-lg md:text-2xl text-cyan-200 tracking-wide mt-3 animate-fadeUp [animation-delay:0.4s] font-semibold">
        Badminton Championship 2025
      </p>

      {/* Tournament Info */}
      <div className="flex flex-wrap items-center justify-center gap-8 mt-8 text-gray-200 text-[15px] md:text-base animate-fadeUp [animation-delay:0.6s] font-medium">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-300" />
          <span>{TOURNEY.dateRange}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-cyan-300" />
          <span>{TOURNEY.venue}</span>
        </div>
        <div className="flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-cyan-300" />
          <span className="font-bold tracking-wide">{TOURNEY.prize} Prize Pool</span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-300" />
          <span className="font-semibold">{TOURNEY.entryFee}</span>
        </div>
      </div>

      {/* LAST DATE and Countdown */}
      <div className="flex flex-wrap justify-center items-center gap-6 mt-8 animate-fadeUp [animation-delay:0.7s]">
        <div className="flex items-center gap-2 bg-cyan-700/15 border border-cyan-300/30 backdrop-blur-lg px-2 py-2 rounded-xl text-cyan-200 font-medium text-base shadow">
          <Clock className="w-6 h-6 text-cyan-400" />
          <span className="font-bold text-sm sm:text-md">Last Date for Entries:</span>
          <span className="text-white ml-1 font-semibold tracking-wide">{new Date(TOURNEY.entryDeadline).toLocaleDateString()}</span>
          {deadlineDays !== null && (
            <span className="ml-3 px-3 py-1 bg-cyan-400/10 text-cyan-200 rounded-lg text-xs font-bold tracking-wider">
              {deadlineDays > 0 ? `${deadlineDays} days left` : "Deadline Today!"}
            </span>
          )}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap justify-center gap-6 mt-16 animate-fadeUp [animation-delay:0.8s]">
        {!isLoggedIn && (<button
          className="px-10 py-3.5 rounded-full font-bold bg-gradient-to-r from-cyan-500 via-sky-400 to-blue-500 shadow-lg
            text-white border-0 outline-none transition-all duration-300
            hover:from-sky-500 hover:via-cyan-400 hover:to-cyan-400
            hover:shadow-cyan-300/30 active:scale-95 focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Register Now
        </button>)}
        <a href="#categories">
        <button
          className="px-10 py-3.5 rounded-full font-semibold border-2 border-cyan-300/60 bg-white/30
          text-cyan-100 hover:bg-cyan-300/20 hover:text-white
          active:scale-95 transition-all duration-300
          focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
          View Categories
        </button>
        </a>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute mt-10 -bottom-4 sm:bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce">
        <a href="#about" className="flex flex-col items-center group">
          <span className="text-xs text-gray-400 mb-1 group-hover:text-cyan-300 transition-all">
            Scroll Down
          </span>
          <ArrowDown className="h-6 w-6 text-cyan-400 group-hover:text-cyan-300 transition-all" />
        </a>
      </div>
    </section>
  );
};

export default HeroSection;
