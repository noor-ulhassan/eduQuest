import React from "react";

const PracticeSection = () => {
  return (
    <section className="relative z-0 bg-[#0b0f1a] text-white py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="order-2 lg:order-1">
          <h2 className="text-4xl md:text-6xl font-jersey mb-6 tracking-tight leading-tight">
            Practice your coding <br /> chops
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-lg">
            Take your skills further with code challenges and project tutorials
            designed to help you apply what you learned to real-world problems
            and examples.
          </p>
        </div>

        <div className="relative order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center lg:justify-end">
            <img
              src="/behind.gif"
              alt=""
              className="w-[120%] h-auto object-contain opacity-90 scale-110"
            />
          </div>

          <div className="relative z-10 bg-[#fffbeb] rounded-2xl p-6 w-full max-w-[340px] shadow-[0_0_40px_rgba(251,191,36,0.3)] border-4 border-[#fbbf24]">
            <div className="flex justify-between items-center mb-6">
              <span className="bg-[#dcfce7] text-[#15803d] px-3 py-1 rounded-full text-xs font-bold tracking-widest">
                PYTHON
              </span>
              <span className="text-[#1e293b] font-bold text-lg">Loops</span>
              <span className="text-gray-500 text-sm font-semibold tracking-tighter">
                10XP
              </span>
            </div>

            <div className="bg-gradient-to-b from-[#fef08a] to-[#fde047] rounded-xl h-40 flex items-center justify-center mb-6 overflow-hidden">
              <img
                src="/card.png"
                alt="Python Snake"
                className="w-32 h-32 object-contain"
              />
            </div>

            <div className="text-[#1e293b]">
              <p className="text-sm font-medium leading-snug mb-6">
                Practice while loops and for loops in Python.
              </p>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                    <span className="text-pink-600 text-xs">🎯</span>
                  </div>
                  <span className="text-sm font-bold">5 Challenges</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <span className="text-yellow-600 text-xs">🕒</span>
                  </div>
                  <span className="text-sm font-bold">40 Minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PracticeSection;
