import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { Play, CheckCircle2, Lock, Star } from "lucide-react";
import { usePlaygroundProgress, useCurriculumsMetadata } from "../../../features/playground/usePlayground";

const LANGUAGE_IMAGES = {
  html: "/html1.png",
  css: "/css1.png",
  javascript: "/js2.png",
  python: "/python1.png",
  react: "/react.png",
  cpp: "/c.png",
  typescript: "/ts.png",
  java: "/java.png",
};

const CARD_COLORS = [
  "bg-yellow-400",
  "bg-cyan-500",
  "bg-green-500",
  "bg-blue-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-red-500",
];

export function DraggableCards() {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const [cards, setCards] = useState([]);

  const { data: progressPayload, isLoading: progressLoading } = usePlaygroundProgress();
  const { data: metadataPayload, isLoading: metadataLoading } = useCurriculumsMetadata();
  const isLoading = progressLoading || metadataLoading;

  const computedCards = useMemo(() => {
    const metadata = metadataPayload?.metadata || [];
    const progress = user ? (progressPayload?.progress || []) : [];
    const progressMap = progress.reduce((acc, p) => { acc[p.language] = p; return acc; }, {});

    return metadata.map((langMeta, index) => {
      const { language, title, totalProblems, totalChapters, lessons } = langMeta;
      const userProgress = progressMap[language];
      const color = CARD_COLORS[index % CARD_COLORS.length];

      if (userProgress) {
        const completedChapters =
          Math.floor(
            (userProgress.completedProblems?.length || 0) /
              (totalProblems / totalChapters),
          ) || 0;
        const cappedCompleted = Math.min(completedChapters, totalChapters);
        return {
          id: index + 1, language, title,
          level: `Chapter ${cappedCompleted}/${totalChapters}`,
          lessons, isEnrolled: true,
          status: "Continue Learning", color,
        };
      }
      return {
        id: index + 1, language, title,
        level: "Beginner Friendly", lessons,
        isEnrolled: false, status: "Start Learning", color,
      };
    });
  }, [progressPayload, metadataPayload, user]);

  useEffect(() => {
    if (computedCards.length > 0) setCards(computedCards);
  }, [computedCards]);

  const sendToBack = (id) => {
    setCards((prev) => {
      const cardToMove = prev.find((c) => c.id === id);
      const remaining = prev.filter((c) => c.id !== id);
      return [cardToMove, ...remaining];
    });
  };

  if (isLoading) {
    return (
      <div className="relative flex h-[520px] w-[450px] items-center justify-center overflow-hidden rounded-3xl bg-transparent">
        <div className="text-zinc-400 text-sm">Loading playgrounds…</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-[520px] w-[450px] items-center justify-center">
      <div className="relative w-[450px] h-[460px]">
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
                <div className="w-full h-full bg-[#1a1730] rounded-[2rem] p-6 flex flex-col border border-white/[0.07] shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden relative">

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    {card.isEnrolled ? (
                      <span className="text-[10px] font-black text-metallic uppercase tracking-widest border border-white/[0.12] bg-white/[0.04] rounded-full px-2.5 py-0.5">
                        In Progress
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-metallic-orange uppercase tracking-widest border border-orange-500/25 bg-orange-500/[0.06] rounded-full px-2.5 py-0.5 flex w-fit items-center gap-1">
                        <Star size={9} className="fill-orange-500 text-orange-500" /> Recommended
                      </span>
                    )}
                  </div>

                  <div className="text-center mb-3">
                    <h3 className="text-xl font-black text-metallic leading-tight tracking-tight">
                      {card.title}
                    </h3>
                    <p
                      className={`font-bold text-xs mt-1 ${card.isEnrolled ? "text-metallic-orange" : "text-zinc-500"}`}
                    >
                      {card.level}
                    </p>
                  </div>

                  <div className="flex-1 flex items-center justify-center mb-3">
                    <motion.div
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`w-32 h-32 rounded-2xl flex items-center justify-center ${
                        LANGUAGE_IMAGES[card.language]
                          ? ""
                          : `${card.color} bg-opacity-80 shadow-lg`
                      }`}
                    >
                      {LANGUAGE_IMAGES[card.language] ? (
                        <img
                          src={LANGUAGE_IMAGES[card.language]}
                          alt={card.title}
                          className="w-28 h-28 object-contain select-none"
                          draggable={false}
                        />
                      ) : (
                        <span className="text-white text-4xl font-black tracking-tight select-none">
                          {card.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </motion.div>
                  </div>

                  <div className="space-y-2 mb-4 z-10 relative">
                    {card.lessons.map((lesson, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between group px-2"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
                              card.isEnrolled && idx === 0
                                ? "border-orange-500/50 bg-orange-500/10"
                                : "border-zinc-700/50 bg-transparent"
                            }`}
                          >
                            {card.isEnrolled && idx === 0 ? (
                              <div className="w-2 h-2 bg-orange-500 rounded-sm rotate-45 animate-pulse" />
                            ) : card.isEnrolled ? (
                              <CheckCircle2 className="w-4 h-4 text-orange-500/60" />
                            ) : (
                              <Lock className="w-3 h-3 text-zinc-600" />
                            )}
                          </div>
                          <span
                            className={`text-sm font-bold transition-colors ${card.isEnrolled && idx === 0 ? "text-metallic" : "text-zinc-600"}`}
                          >
                            {lesson}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => navigate(`/playground/${card.language}`)}
                    className={`w-full font-black mt-auto py-3 rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest group transition-all duration-200 z-10 ${
                      card.isEnrolled
                        ? "border border-orange-500/40 bg-orange-500/[0.08] hover:bg-orange-500/15 hover:border-orange-500/60 text-metallic-orange"
                        : "border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/15 text-metallic"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {card.status}
                      <Play
                        className={`w-3 h-3 transition-transform group-hover:translate-x-1 ${card.isEnrolled ? "fill-orange-500" : "fill-white/60"}`}
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
