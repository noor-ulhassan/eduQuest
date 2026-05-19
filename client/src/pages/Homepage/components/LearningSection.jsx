import React from "react";

const LearningSection = () => {
  return (
    <section className="relative z-0 bg-[#0b0f1a] text-white py-20 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="bg-[#1e293b] rounded-lg shadow-2xl border border-gray-700 overflow-hidden max-w-2xl mx-auto lg:mx-0">
            <div className="bg-[#e2e8f0] p-3 flex gap-2 items-center">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
            </div>

            <div className="flex h-[400px]">
              <div className="w-1/3 bg-[#0f172a] p-4 border-r border-gray-800 text-[10px] md:text-xs">
                <p className="text-gray-400 uppercase tracking-widest mb-4">
                  Instructions
                </p>
                <h3 className="font-bold text-lg mb-2">02. Hello World</h3>
                <p className="text-blue-400 mb-2"># Print</p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  In Python, the print function is used to tell a computer to
                  "talk".
                </p>
                <div className="bg-[#1e293b] p-2 rounded border border-blue-500/30">
                  <code className="text-yellow-400">print('👋 Howdy')</code>
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-4 font-mono text-sm bg-[#0a0e17]">
                  <div className="flex gap-4">
                    <span className="text-gray-600">1</span>
                    <p className="text-green-400">
                      print(
                      <span className="text-yellow-200">'Hello world!'</span>)
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-gray-600">2</span>
                  </div>
                </div>

                <div className="h-1/3 bg-[#0a0e17] border-t border-gray-800 p-4 font-mono text-sm">
                  <p className="text-gray-500 text-xs mb-2 uppercase">
                    Terminal
                  </p>
                  <p className="text-white">Hello world!</p>
                  <div className="w-2 h-4 bg-white animate-pulse inline-block mt-1"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-12 left-80 z-10 pointer-events-none">
            <img
              src="/creatures.gif"
              alt="Pixel characters"
              className="w-64 md:w-80 h-auto object-contain"
            />
          </div>
        </div>

        <div className="lg:pl-10">
          <h2 className="text-4xl md:text-6xl font-jersey mb-6 tracking-tight">
            Level up your learning
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
            Gain XP and collect badges as you complete bite-sized lessons in
            Python, HTML, JavaScript, and more. Our beginner-friendly curriculum
            makes learning to code as motivating as completing your next quest.
          </p>
        </div>
      </div>
    </section>
  );
};

export default LearningSection;
