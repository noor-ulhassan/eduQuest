import React from "react";

const Leaderboard = () => {
  return (
    <div className="bg-white rounded-[2rem] p-8 border border-zinc-200 shadow-sm text-center w-full max-w-[340px]">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-orange-100 rounded-[2rem] flex items-center justify-center">
          <div className="w-12 h-12 bg-orange-500 rounded-2xl rotate-45 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full -rotate-45" />
          </div>
        </div>
      </div>

      <h3 className="text-xl font-black text-zinc-900 mb-2">
        Ready to bounce back?
      </h3>

      <p className="text-zinc-500 text-sm font-medium mb-8 leading-relaxed px-2">
        You finished #29 and kept your spot in the Hydrogen League
      </p>

      <button className="w-full py-4 border-2 border-zinc-200 rounded-2xl font-bold text-zinc-900 hover:bg-zinc-50 transition-colors">
        Continue
      </button>
    </div>
  );
};

export default Leaderboard;
