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
      <h2 className="text-3xl mb-4 font-jersey">Explore More</h2>
      <div className="grid grid-cols-2 gap-5">
        {ExplorMoreOptions.map((option, index) => (
          <div
            key={index}
            className="flex items-center gap-4 mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800
"
          >
            <img src={option.icon} alt={option.title} width={80} height={80} />
            <div>
              <h2 className="font-jersey text-2xl">{option.title}</h2>
              <p className=" text-gray-800">{option.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExploreMore;
