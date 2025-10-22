const AuthTabs = ({ activeTab, setActiveTab }) => (
  <div className="flex w-full mb-9 bg-transparent shadow-md rounded-xl overflow-hidden ring-1 ">
    <button
      className={`flex-1 py-3 font-semibold text-lg tracking-wide transition-all ${
        activeTab === "login"
          ? "bg-cyan-500 text-white shadow-md"
          : "bg-white/40 text-white hover:bg-cyan-100"
      }`}
      onClick={() => setActiveTab("login")}
    >
      Login
    </button>
    <button
      className={`flex-1 py-3 font-semibold text-lg tracking-wide transition-all ${
        activeTab === "register"
          ? "text-white bg-cyan-500 shadow-md"
          : "text-white bg-white/40 hover:bg-cyan-100"
      }`}
      onClick={() => setActiveTab("register")}
    >
      Register
    </button>
  </div>
);

export default AuthTabs;
