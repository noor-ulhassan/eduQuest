import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2, Lock, Star } from "lucide-react";
import { getPlaygroundProgress } from "../../features/playground/playgroundApi";
import { PLAYGROUND_DATA } from "../../data/playgroundData";

export function DraggableCards() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Language to display name and image mapping
  const languageMap = {
    html: {
      title: "HTML",
      img: "/html5.png",
      color: "bg-orange-500",
      border: "border-orange-500",
    },
    css: {
      title: "CSS",
      img: "/csss.png",
      color: "bg-blue-500",
      border: "border-blue-500",
    },
    javascript: {
      title: "JavaScript",
      img: "/javascript.png",
      color: "bg-yellow-400",
      border: "border-yellow-400",
    },
    python: {
      title: "Python",
      img: "/python1.png",
      color: "bg-green-500",
      border: "border-green-500",
    }, // Added visual props
  };

  useEffect(() => {
    const fetchPlaygroundsData = async () => {
      // Always define all supported languages
      const allLanguages = ["html", "css", "javascript", "python"];
      let progressMap = {};

      if (user) {
        try {
          const { progress } = await getPlaygroundProgress();
          // Create a map for easy lookup: { 'html': progressObj, ... }
          progressMap = progress.reduce((acc, p) => {
            acc[p.language] = p;
            return acc;
          }, {});
        } catch (error) {
          console.error("Error fetching enrolled playgrounds:", error);
        }
      }

      // Generate cards for ALL languages
      const allCards = allLanguages
        .map((lang, index) => {
          const langData = PLAYGROUND_DATA[lang];
          const langInfo = languageMap[lang];
          const userProgress = progressMap[lang];

          if (!langData || !langInfo) return null;

          const totalChapters = langData.chapters.length;
          // Get first 2 chapter names for display
          const lessons = langData.chapters.slice(0, 2).map((ch) => ch.title);

          if (userProgress) {
            // ENROLLED STATE
            const completedChapters = langData.chapters.filter((ch) =>
              ch.problems.every((prob) =>
                userProgress.completedProblems.includes(prob.id),
              ),
            ).length;

            return {
              id: index + 1,
              language: lang,
              title: langInfo.title,
              level: `Chapter ${completedChapters}/${totalChapters}`,
              img: langInfo.img,
              lessons,
              isEnrolled: true,
              status: "Continue Learning",
              color: langInfo.color,
            };
          } else {
            // NOT ENROLLED (RECOMMENDED) STATE
            return {
              id: index + 1,
              language: lang,
              title: langInfo.title,
              level: "Beginner Friendly",
              img: langInfo.img,
              lessons,
              isEnrolled: false,
              status: "Start Learning",
              color: langInfo.color,
            };
          }
        })
        .filter(Boolean);

      setCards(allCards);
      setIsLoading(false);
    };

    fetchPlaygroundsData();
  }, [user]);

  const sendToBack = (id) => {
    setCards((prev) => {
      const cardToMove = prev.find((c) => c.id === id);
      const remaining = prev.filter((c) => c.id !== id);
      return [cardToMove, ...remaining];
    });
  };

  if (isLoading) {
    return (
      <div className="relative flex h-[700px] w-[600px] items-center justify-center overflow-hidden rounded-3xl bg-transparent">
        <div className="text-zinc-400 text-sm">Loading your playgrounds...</div>
      </div>
    );
  }

  // NOTE: No empty state check anymore since we always show cards

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
                    {card.isEnrolled ? (
                      <span className="text-xs font-bold text-white uppercase bg-indigo-600 tracking-tight border border-indigo-400 rounded-full px-2 py-1">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-white uppercase bg-purple-600 tracking-tight border border-purple-400 rounded-full px-2 py-1 flex w-fit items-center gap-1">
                        <Star size={10} fill="white" /> Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-center mb-4">
                    <h3 className="text-2xl font-black text-zinc-900 leading-tight tracking-tight">
                      {card.title}
                    </h3>
                    <p
                      className={`font-medium text-sm mt-2 ${card.isEnrolled ? "text-indigo-500" : "text-zinc-500"}`}
                    >
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
                          {/* Visual indicator for lessons */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                              card.isEnrolled && idx === 0
                                ? "border-indigo-500 bg-indigo-50/50"
                                : "border-zinc-200 bg-zinc-100" // Greyed out if not enrolled or later lesson
                            }`}
                          >
                            {card.isEnrolled && idx === 0 ? (
                              <div className="w-3 h-3 bg-indigo-500 rounded-sm rotate-45 animate-pulse" />
                            ) : card.isEnrolled ? (
                              <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                          <span
                            className={`text-md font-bold transition-colors ${card.isEnrolled && idx === 0 ? "text-zinc-900" : "text-zinc-400"}`}
                          >
                            {lesson}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() =>
                      card.isEnrolled
                        ? navigate(`/playground/${card.language}`)
                        : navigate(`/playground/${card.language}/topics`)
                    }
                    className={`w-full text-black font-bold mt-4 py-5 rounded-2xl border-b-4 flex items-center justify-center gap-3 text-sm group transition-all
                        ${
                          card.isEnrolled
                            ? "bg-yellow-400 hover:bg-yellow-500 border-yellow-600"
                            : "bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-900 hover:border-zinc-300"
                        }`}
                  >
                    {card.status}{" "}
                    <Play
                      className={`w-5 h-5 ${card.isEnrolled ? "fill-black" : "fill-zinc-400"}`}
                    />
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
