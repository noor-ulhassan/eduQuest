import React from "react";

const CommunitySection = () => {
  return (
    <section className="bg-[#0b0f1a] text-white py-20 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl md:text-6xl font-jersey mb-8 tracking-tight leading-tight uppercase">
            Make friends along <br /> the way
          </h2>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed max-w-xl">
            Building is so much better together than alone. Join our community
            forum and Discord to give and receive help, collaborate on projects,
            and connect over shared passions.
          </p>
        </div>

        <div className="relative flex flex-col gap-6">
          <div className="flex items-center gap-4 self-end">
            <div className="bg-[#7c3aed] p-6 md:p-8 rounded-[2.5rem] rounded-tr-none max-w-sm shadow-lg">
              <p className="text-sm md:text-base font-medium leading-snug">
                I've been learning JavaScript and i wanna make a game with
                Phaser.js!! Anyone want to work together?
              </p>
            </div>

            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-green-400 shrink-0">
              <img
                src="/pengu.jpeg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 self-start">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-yellow-400 shrink-0">
              <img
                src="/amongus.jpeg"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="bg-[#f1f5f9] p-6 md:p-8 rounded-[2.5rem] rounded-tl-none max-w-sm shadow-lg">
              <p className="text-gray-900 text-sm md:text-base font-medium leading-snug">
                super interested!! just messaged you :))
              </p>
            </div>
          </div>

          <div className=" self-end relative">
            <img
              src="/party.gif"
              alt="Pixel characters gathered around a table"
              className="w-64 md:w-80 h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
