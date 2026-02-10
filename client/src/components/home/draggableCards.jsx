import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2 } from "lucide-react";
export function DraggableCards() {
  const [cards, setCards] = useState([
    {
      id: 1,
      title: "Python",
      level: "Beginner",
      img: "/python1.png",
      lessons: ["Writing Programs", "Using Variables"],
    },
    {
      id: 2,
      title: "React",
      level: "Level 2",
      img: "/react.png",
      lessons: ["Warm Up", "Sequencing Commands"],
    },
    {
      id: 3,
      title: "Algorithms",
      level: "Level 1",
      img: "/code.png",
      lessons: ["Conditional Logic", "Looping"],
    },
    {
      id: 4,
      title: "Html",
      level: "Level 3",
      img: "/html5.png",
      lessons: ["Advanced Logic", "Final Challenge"],
    },
    {
      id: 5,
      title: "Cascading Style Sheets",
      level: "Level 3",
      img: "/csss.png",
      lessons: ["Advanced Logic", "Final Challenge"],
    },
  ]);

  const sendToBack = (id) => {
    setCards((prev) => {
      const cardToMove = prev.find((c) => c.id === id);
      const remaining = prev.filter((c) => c.id !== id);
      return [cardToMove, ...remaining];
    });
  };

  return (
    <div className="relative flex h-[700px] w-[600px] items-center justify-center overflow-hidden rounded-3xl bg-transparent ">
      <div className="relative w-[560px] h-[520px] ">
        <AnimatePresence>
          {cards.map((card, index) => {
            const isTop = index === cards.length - 1;
            return (
              <motion.div
                key={card.id}
                drag={isTop ? true : false}
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={0.6}
                onDragEnd={(e, info) => {
                  if (
                    Math.abs(info.offset.x) > 120 ||
                    Math.abs(info.offset.y) > 120
                  ) {
                    sendToBack(card.id);
                  }
                }}
                animate={{
                  scale: 1 - (cards.length - 1 - index) * 0.04,
                  y: (cards.length - 1 - index) * -20,
                  opacity: 1,
                  rotate: isTop ? 0 : index % 2 === 0 ? 2 : -2,
                }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                className="absolute inset-0 cursor-pointer active:cursor-pointer"
                style={{ zIndex: index }}
              >
                <div
                  className="w-full h-full bg-zinc-50 rounded-2xl p-8 flex flex-col border-[2px] border-zinc-300 border-t-2  
                border-r-4 shadow-sm"
                >
                  <div>
                    <span className="text-xs font-bold text-white uppercase bg-purple-700 tracking-tight border border-purple-400 rounded-full p-1">
                      Recommended
                    </span>
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-black text-zinc-900 leading-tight tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-indigo-500 font-medium text-sm mt-2">
                      {card.level}
                    </p>
                  </div>
                  <div className="flex-1 flex items-center justify-center mb-4 overflow-hidden">
                    <img
                      src={card.img}
                      alt="Course Illustration"
                      className="max-h-40 w-40 object-cover rounded-4xl "
                    />
                  </div>
                  <div className="space-y-3 mb-6">
                    {card.lessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between group px-2"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${idx === 0 ? "border-indigo-500 bg-indigo-50/50" : "border-zinc-100 bg-zinc-50"}`}
                          >
                            {idx === 0 ? (
                              <div className="w-3 h-3 bg-indigo-500 rounded-sm rotate-45 animate-pulse" />
                            ) : (
                              <div className="w-3 h-3 bg-zinc-200 rounded-full" />
                            )}
                          </div>
                          <span
                            className={`text-md font-bold transition-colors ${idx === 0 ? "text-zinc-900" : "text-zinc-300"}`}
                          >
                            {lesson}
                          </span>
                        </div>
                        <CheckCircle2
                          className={`w-5 h-5 ${idx === 0 ? "text-zinc-200" : "text-zinc-100"}`}
                        />
                      </div>
                    ))}
                  </div>
                  <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold mt-4 py-5 rounded-2xl border-b-4 border-yellow-600 flex items-center justify-center gap-3 text-sm group">
                    Start <Play className="w-5 h-5 fill-current " />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default DraggableCards;
