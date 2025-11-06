// TournamentCategories.jsx
import React from "react";
import { Trophy, Users, Award, Star, Medal } from "lucide-react";

const categories = [
  {
    title: "U9 Boys & Girls Singles",
    description: "For players born on or after 2015. Separate singles and doubles events for boys and girls.",
    icon: <Trophy className="w-7 h-7 text-yellow-400" />,
    color: "from-cyan-600 to-yellow-400",
  },
  {
    title: "U11 Boys & Girls Singles",
    description: "For players born on or after 2015. Separate singles and doubles events for boys and girls.",
    icon: <Trophy className="w-7 h-7 text-yellow-400" />,
    color: "from-cyan-600 to-yellow-400",
  },
  {
    title: "U13 Boys & Girls Singles/Doubles",
    description: "For players born on or after 2013. Energetic singles and doubles events, both boys and girls.",
    icon: <Star className="w-7 h-7 text-pink-400" />,
    color: "from-pink-500 to-pink-300",
  },
  {
    title: "U15 Boys & Girls Singles/Doubles",
    description: "For players born on or after 2011. Separate events for boys and girls, singles and doubles.",
    icon: <Medal className="w-7 h-7 text-green-400" />,
    color: "from-green-600 to-green-400",
  },
  {
    title: "U17 Boys & Girls Singles/Doubles",
    description: "For competitors born on or after 2009. Singles and doubles for both boys and girls.",
    icon: <Users className="w-7 h-7 text-cyan-400" />,
    color: "from-cyan-600 to-cyan-400",
  },
  {
    title: "U19 Boys & Girls Singles/Doubles",
    description: "For experienced players born on or after 2007. Advanced singles and doubles matches.",
    icon: <Award className="w-7 h-7 text-indigo-400" />,
    color: "from-indigo-600 to-indigo-400",
  },
  {
    title: "U15 Mixed Doubles",
    description: "Mixed doubles event for players born on or after 2011. Boys and girls pair up for team play.",
    icon: <Users className="w-7 h-7 text-teal-300" />,
    color: "from-teal-600 to-teal-300",
  },
  {
    title: "U19 Mixed Doubles",
    description: "For athletes born on or after 2007, pairs of boys and girls compete together.",
    icon: <Users className="w-7 h-7 text-rose-400" />,
    color: "from-rose-600 to-rose-400",
  }
];

const TournamentCategories = () => {
  return (
    <section
      id="categories"
      className="relative py-24 px-6 md:px-12 bg-gradient-to-b from-[#0a192f] via-[#102a44] to-[#0f223f] text-gray-100"
    >
      <div className="text-center mb-14">
        <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
          Tournament Categories
        </h2>
        <p className="mt-3 text-gray-400 max-w-2xl mx-auto">
          All age-based singles, doubles, and mixed doubles events—just like in our previous tournaments!
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className={`group relative bg-[#11294a]/80 hover:bg-[#12345a]/90 border border-cyan-500/20 rounded-2xl shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden`}
          >
            <div
              className={`absolute inset-0 opacity-0 group-hover:opacity-80 transition-opacity duration-500 bg-gradient-to-tr ${cat.color} blur-2xl`}
            ></div>
            <div className="relative z-10 flex flex-col items-center text-center p-8 space-y-5">
              <div className="p-3 rounded-full bg-[#13294c] border border-cyan-500/20 group-hover:scale-105 transition-all duration-300">
                {cat.icon}
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">{cat.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{cat.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TournamentCategories;
