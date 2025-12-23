import React from "react";

const PortfolioSection = () => {
  return (
    <section className="relative z-0 bg-[#0b0f1a] text-white py-20 px-6 md:px-12 overflow-hidden mb-5">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative mb-10 lg:mb-0">
          <div className="rounded-lg overflow-hidden shadow-2xl relative z-0">
            <div className="bg-[#e9f8c6] p-3 flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-[#a1a1aa]"></div>
              <div className="w-3 h-3 rounded-full bg-[#a1a1aa]"></div>
              <div className="w-3 h-3 rounded-full bg-[#a1a1aa]"></div>
            </div>

            <img
              src="/minesweper.gif"
              alt="Minesweepers pixel game screenshot showing title and buttons"
              className="w-full h-auto object-cover bg-[#bbf770] min-h-[300px]"
            />
          </div>

          <img
            src="/rocket.gif"
            alt="Pixel character riding a rocket"
            className="absolute -bottom-12 -right-4 lg:-right-20 w-40 md:w-56 lg:w-72 z-10 pointer-events-none"
          />
        </div>

        <div className="lg:pl-10 relative z-10">
          <h2 className="text-4xl md:text-6xl font-jersey mb-8 tracking-tight leading-tight">
            Build an awesome portfolio
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
            Create your own interactive websites, mini-games, mobile apps, data
            visualizations, and show them off to friends or the world—all on Edu
            Quest 🏆
          </p>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
