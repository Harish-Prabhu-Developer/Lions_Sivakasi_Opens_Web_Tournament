// CallToAction.jsx
import React from "react";
import { Trophy } from "lucide-react";
import {Link} from "react-router-dom";
const CallToAction = () => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      * { font-family: 'Poppins', sans-serif; }
    `}</style>
    <section className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="bg-gradient-to-b from-[#0a192f] via-[#11294a] to-[#2d3b60] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12 gap-8 border border-cyan-400/10">
        <div className="flex items-center gap-5">
          <span className="bg-cyan-400/15 rounded-full p-4 shadow-lg">
            <Trophy className="w-12 h-12 text-cyan-400 drop-shadow-md animate-bounce" />
          </span>
          <div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-1 drop-shadow-[0_2px_10px_rgba(0,174,255,0.14)]">
              Got your game face on?
            </h2>
            <span className="block text-lg md:text-xl font-medium text-cyan-300 mb-2 mt-2">
              Register for the Lions Sivakasi Open!
            </span>
            <p className="max-w-xl text-base md:text-lg text-gray-300">
              Be part of Tamil Nadu’s biggest state-level badminton event—show your passion, compete for trophies, and join the legacy.
            </p>
          </div>
        </div>
        <div className="mt-8 md:mt-0 flex-shrink-0">
          <Link to="/register">
            <button className="px-9 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 font-semibold text-white shadow-lg shadow-cyan-400/30 hover:scale-105 hover:bg-cyan-600 transition duration-300 focus:outline-none">
              Register Now
            </button>
          </Link>
        </div>
      </div>
    </section>
  </>
);

export default CallToAction;
