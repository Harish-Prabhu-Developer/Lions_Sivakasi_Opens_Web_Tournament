// AboutSection.jsx
import React from "react";
import { Award, Users, Handshake, Sparkles } from "lucide-react";
import AboutImage from "../../assets/AboutImage.png";

const AboutSection = () => {
  return (
    <section
      id="about"
      className="relative w-full bg-gradient-to-b from-[#0a192f] via-[#102a44] to-[#0f223f] text-gray-200 py-24 px-6 md:px-12 overflow-hidden"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif }
        
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeUp { animation: fadeUp 1s ease-out forwards; }
      `}</style>

      {/* Background Glows */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-16 left-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[150px] animate-pulse"></div>
      </div>

      {/* Section Header */}
      <div className="text-center">
        {/* <div className="flex justify-center mb-3">
          <Sparkles className="text-cyan-400 w-5 h-5 animate-pulse" />
        </div> */}
        <h2 className="text-3xl md:text-4xl font-semibold text-cyan-300 animate-fadeUp">
          About the Tournament
        </h2>
        <p className="text-base text-gray-400 mt-3 max-w-3xl mx-auto animate-fadeUp [animation-delay:0.3s]">
          The Lions Sports Foundation proudly presents the 9
          <sup>th</sup>{" "}
          <span className="text-cyan-300 font-semibold">
            Statelevel Badminton Championship
          </span>
          — an elite state-level badminton championship sanctioned by TNBA.
        </p>
      </div>

      {/* Main Content */}
      <div className="mt-16 flex flex-col lg:flex-row items-center justify-between gap-16 max-w-7xl mx-auto px-4 md:px-8">
        {/* Image Section */}
        <div className="relative group w-full lg:w-1/2">
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-700"></div>
          <img
            src={AboutImage}
            alt="Badminton Players"
            className="w-full rounded-3xl shadow-xl border border-cyan-400/20 group-hover:scale-[1.03] transition-transform duration-500"
          />
        </div>

        {/* Text + Features */}
        <div className="w-full lg:w-1/2 space-y-6 animate-fadeUp [animation-delay:0.5s]">
          <h3 className="text-2xl md:text-3xl font-semibold text-white">
            Celebrating Passion, Precision & Unity
          </h3>
          <p className="text-gray-400  text-justify  leading-relaxed">
            Lions Sivakasi Open, bringing together exceptional badminton talent across Tamil Nadu in
            the spirit of sportsmanship and excellence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            {[
              {
                icon: <Award className="text-cyan-300 w-5 h-5" />,
                title: "State-Level Prestige",
                desc: "Proudly sanctioned by TNBA ensuring competitive authenticity."
              },
              {
                icon: <Users className="text-cyan-300 w-5 h-5" />,
                title: "500+ Participants",
                desc: "Bringing together the best athletes from across Tamil Nadu."
              },
              {
                icon: <Handshake className="text-cyan-300 w-5 h-5" />,
                title: "Community Spirit",
                desc: "Building bonds through shared passion and unity in play."
              },
              {
                icon: <Sparkles className="text-cyan-300 w-5 h-5" />,
                title: "₹3 Lakh Total Rewards",
                desc: "Encouraging excellence with significant recognition and prizes."
              },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 bg-[#0d2945]/40 rounded-xl p-5 border border-cyan-400/20 hover:border-cyan-300/40 hover:bg-[#12345a]/40 transition-all duration-500 shadow-md hover:shadow-cyan-400/10"
              >
                <div className="p-3 bg-[#102642] rounded-lg">{item.icon}</div>
                <div>
                  <h4 className="font-medium text-cyan-300 text-base">{item.title}</h4>
                  <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <button className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-indigo-500 text-white font-medium rounded-full shadow-lg hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
