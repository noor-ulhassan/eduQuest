import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2, Lock, Star } from "lucide-react";
import { getPlaygroundProgress, getCurriculumsMetadata } from "../../features/playground/playgroundApi";

export function DraggableCards() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Language to display name and image mapping
  const languageMap = {
    react: {
      title: "React",
      img: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg",
      color: "bg-cyan-500",
    },
    javascript: {
      title: "JavaScript",
      img: "/javascript.png",
      color: "bg-yellow-400",
    },
    python: {
      title: "Python",
      img: "/python1.png",
      color: "bg-green-500",
    },
    css: {
      title: "CSS",
      img: "/csss.png",
      color: "bg-blue-500",
    },
    html: {
      title: "HTML",
      img: "/html5.png",
      color: "bg-orange-500",
    },
  };

  useEffect(() => {
    const fetchPlaygroundsData = async () => {
      // Always define all supported languages
      const allLanguages = ["react", "javascript", "python", "css", "html"];
      let progressMap = {};

      let curriculumMetaMap = {};

      try {
        const [{ progress }, { metadata }] = await Promise.all([
           user ? getPlaygroundProgress() : { progress: [] },
           getCurriculumsMetadata()
        ]);
        
        if (metadata) {
          curriculumMetaMap = metadata.reduce((acc, m) => {
            acc[m.language] = m;
            return acc;
          }, {});
        }

        if (progress && Array.isArray(progress)) {
          progressMap = progress.reduce((acc, p) => {
            acc[p.language] = p;
            return acc;
          }, {});
        }
      } catch (error) {
        console.error("Error fetching playgrounds data:", error);
      }

      // Generate cards for ALL languages
      const allCards = allLanguages
        .map((lang, index) => {
          const langMeta = curriculumMetaMap[lang];
          const langInfo = languageMap[lang];
          const userProgress = progressMap[lang];

          if (!langMeta || !langInfo) return null;

          const totalChapters = langMeta.totalChapters;
          const lessons = langMeta.lessons;

          if (userProgress) {
            // ENROLLED STATE
            // We just use a rough chapter count based on completed problems vs total problems
            // Because calculating exact chapters requires the full curriculum
            // A simple approximation for the card:
            const completedChapters = Math.floor((userProgress.completedProblems?.length || 0) / (langMeta.totalProblems / totalChapters)) || 0;
            const cappedCompleted = Math.min(completedChapters, totalChapters);

            return {
              id: index + 1,
              language: lang,
              title: langInfo.title,
              level: `Chapter ${cappedCompleted}/${totalChapters}`,
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
    <div className="relative flex h-[700px] w-[600px] items-center justify-center overflow-hidden rounded-3xl bg-white dark:bg-[#1a1730]">
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
                initial={false}
                animate={{
                  scale: 1 - (cards.length - 1 - index) * 0.05,
                  y: (cards.length - 1 - index) * -25,
                  opacity: 1,
                  rotate: isTop ? 0 : index % 2 === 0 ? 3 : -3,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="absolute inset-0 cursor-grab active:cursor-grabbing hover:-translate-y-2 transition-transform duration-300 ease-out"
                style={{ zIndex: index }}
              >
                <div className="w-full h-full bg-white dark:bg-[#1a1730] rounded-[2rem] p-8 flex flex-col border border-zinc-200 dark:border-zinc-800 shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] overflow-hidden relative group">
                  <div
                    className={`absolute -top-32 -right-32 w-64 h-64 ${card.color} opacity-10 dark:opacity-20 rounded-full blur-[80px] pointer-events-none group-hover:opacity-20 transition-all duration-700`}
                  />
                  <div
                    className={`absolute -bottom-32 -left-32 w-64 h-64 ${card.color} opacity-10 dark:opacity-20 rounded-full blur-[80px] pointer-events-none group-hover:opacity-20 transition-all duration-700`}
                  />

                  <div className="flex justify-between items-start mb-6 relative z-10">
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
                    <motion.img
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
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
                    className={`w-full font-bold mt-auto py-4 rounded-xl flex items-center justify-center gap-3 text-sm group transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md
                        ${
                          card.isEnrolled
                            ? "bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-400 hover:to-orange-400 text-black border-none"
                            : "bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 dark:text-black text-white border-none"
                        }`}
                  >
                    <span className="relative z-10 flex items-center gap-2 tracking-wide uppercase">
                      {card.status}
                      <Play
                        className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${card.isEnrolled ? "fill-black" : "fill-white dark:fill-black"}`}
                      />
                    </span>
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
