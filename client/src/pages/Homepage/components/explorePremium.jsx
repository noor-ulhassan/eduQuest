import React from "react";

const ExplorePremium = () => {
  return (
    <div className="bg-[#f4f7ff] rounded-[2rem] p-6 border border-zinc-300 border-b-4 relative overflow-hidden w-full max-w-[340px]">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
          <div className="w-6 h-6 border-4 border-white/30 rounded-full" />
        </div>

        <div className="min-w-0">
          <h3 className="text-lg font-extrabold text-zinc-900 leading-tight break-words">
            Unlock all learning with Premium
          </h3>
          <p className="text-zinc-500 text-xs mt-1">to get smarter, faster</p>
        </div>
      </div>

      <button className="w-full bg-gradient-to-r from-[#b399ff] via-[#d191ff] to-[#ffb38a] text-zinc-900 font-bold py-3 rounded-2xl shadow-sm hover:opacity-95 transition-opacity whitespace-nowrap text-sm">
        Explore Premium
      </button>
    </div>
  );
};

export default ExplorePremium;
