// PriceDistribution.jsx
import React from "react";
import { IndianRupee, Trophy } from "lucide-react";

const prizes = [
  {
    category: "Singles",
    first: "₹5,000",
    second: "₹2,500",
    color: "from-cyan-600 to-blue-400",
    icon: <Trophy className="w-7 h-7 text-cyan-400" />,
  },
  {
    category: "Doubles & Mixed Doubles",
    first: "₹6,000",
    second: "₹3,000",
    color: "from-yellow-400 to-orange-400",
    icon: <Trophy className="w-7 h-7 text-yellow-400" />,
  },
];

const PriceDistribution = () => (
  <section className="relative py-20 px-6 md:px-12 bg-gradient-to-b from-[#0a192f] via-[#102a44] to-[#0f223f] text-gray-100">
    {/* Section Header */}
    <div className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
        Prize Distribution
      </h2>
      <p className="mt-3 text-gray-300 max-w-xl mx-auto">
        Attractive cash prizes awarded for all categories — Singles, Doubles, and Mixed Doubles.
      </p>
    </div>

    {/* Prize Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
      {prizes.map((item, idx) => (
        <div
          key={item.category}
          className={`group relative bg-[#11294a]/80 hover:bg-[#124065]/90 border border-yellow-400/20 rounded-2xl shadow-md hover:shadow-yellow-400/20 transition-all duration-500 p-7 overflow-hidden`}
        >
          {/* Gradient Accent */}
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-65 transition-opacity duration-400 bg-gradient-to-tr ${item.color} blur-2xl`}
          ></div>
          <div className="relative flex flex-col items-center text-center space-y-5 z-10">
            <div className="p-3 rounded-full bg-[#1b3459] border border-yellow-400/30 group-hover:scale-105 transition-all duration-300">
              {item.icon}
            </div>
            <h3 className="text-xl font-semibold text-white">
              {item.category}
            </h3>
            <div className="flex flex-col gap-2 mt-3 w-full text-base font-medium">
              <span className="flex items-center justify-center gap-2 text-cyan-300">
                <IndianRupee className="w-5 h-5" />
                1<sup>st</sup> Prize: <span className="text-white font-bold">{item.first}</span>
              </span>
              <span className="flex items-center justify-center gap-2 text-yellow-400">
                <IndianRupee className="w-5 h-5" />
                2<sup>nd</sup> Prize: <span className="text-white font-bold">{item.second}</span>
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Summary Table */}
    <div className="max-w-2xl mx-auto rounded-xl overflow-hidden bg-[#14294b]/80 border border-cyan-500/10 shadow-lg">
      <table className="w-full text-left text-gray-200">
        <thead className="bg-cyan-500  text-white text-base">
          <tr>
            <th className="py-4 px-6">Category</th>
            <th className="py-4 px-6">1st Prize</th>
            <th className="py-4 px-6">2nd Prize</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-cyan-900/20">
          {prizes.map((item) => (
            <tr key={item.category}>
              <td className="py-3 px-6">{item.category}</td>
              <td className="py-3 px-6">{item.first}</td>
              <td className="py-3 px-6">{item.second}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Total Pool */}
    <div className="mt-8 text-center">
      <span className="text-2xl md:text-3xl font-bold text-cyan-400">Total Prize Pool</span>
      <span className="ml-3 text-yellow-400 font-extrabold text-3xl">₹2,00,000</span>
    </div>
  </section>
);

export default PriceDistribution;
