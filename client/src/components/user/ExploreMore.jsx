import React from "react";

const ExplorMoreOptions = [
  {
    id: 1,
    title: "Quiz Pack",
    desc: "Practice what you learned with bite-sized code challenges.",
    icon: "/tree.png",
  },
  {
    id: 2,
    title: "Video Courses",
    desc: "Learn with structured video lessons taught step-by-step.",
    icon: "/game.png",
  },
  {
    id: 3,
    title: "Community Project",
    desc: "Build real-world apps by collaborating with the community.",
    icon: "/growth.png",
  },
  {
    id: 4,
    title: "Talk with AI",
    desc: "Chat with AI to get help, explanations, and debugging tips.",
    icon: "/start-up.png",
  },
];

function ExploreMore() {
  return (
    <div className="mt-8">
      <h2 className="text-3xl mb-4 font-jersey text-white">Explore More</h2>
      <div className="grid grid-cols-2 gap-5">
        {ExplorMoreOptions.map((option, index) => (
          <div
            key={index}
            className="flex items-center gap-4 mb-4 p-3 rounded-xl 
            border border-white/10 bg-[#111111] hover:border-white/20 
            hover:bg-[#161616] transition-all cursor-pointer group"
          >
            <img src={option.icon} alt={option.title} width={80} height={80} />
            <div>
              <h2 className="font-jersey text-2xl text-white">
                {option.title}
              </h2>
              <p className="text-zinc-400 text-sm">{option.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreMore;
