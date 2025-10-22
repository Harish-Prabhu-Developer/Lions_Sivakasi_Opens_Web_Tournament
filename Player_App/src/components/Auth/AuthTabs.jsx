import React from "react";

const AuthTabs = ({ tabs = ["Login", "Register"], activeTab, setActiveTab }) => (
  <div
    className="flex w-full mb-8 rounded-2xl bg-[#181c1f] border border-white/10"
    role="tablist"
    aria-label="Authentication Tabs"
  >
    {tabs.map((tab, idx) => {
      const isActive = activeTab.toLowerCase() === tab.toLowerCase();
      return (
        <div
          key={tab}
          role="tab"
          aria-selected={isActive}
          tabIndex={isActive ? 0 : -1}
          onClick={() => setActiveTab(tab.toLowerCase())}
          className={
            `flex-1 py-3 font-bold text-base sm:text-lg text-center transition-all duration-150
            border-none outline-none focus-visible:ring-2 focus-visible:ring-cyan-400
            ${isActive
              ? "bg-cyan-500 text-white border-b-2 border-cyan-300 z-10"
              : "bg-transparent text-white opacity-90 hover:bg-[#181c1f] hover:opacity-100 border-b-2 border-transparent"
            }
            ${idx === 0 ? "rounded-l-2xl" : ""}
            ${idx === tabs.length - 1 ? "rounded-r-2xl" : ""}
            `
          }
        >
          {tab}
        </div>
      );
    })}
  </div>
);

export default AuthTabs;
