import React, { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { useOutsideClick } from "@/hooks/use-outside-click";

const LANG_META = {
  Html: {
    desc: "Semantic markup & web structure",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    tags: ["Frontend", "Web"],
    banner: "/gladiator.jpg",
    detail:
      "Build the skeleton of every webpage. Learn tags, forms, semantics, accessibility and the full HTML5 spec through hands-on challenges.",
    learn: [
      "HTML5 semantic elements",
      "Forms & validation",
      "Accessibility practices",
      "SEO-friendly structure",
    ],
  },
  Css: {
    desc: "Styling, layouts & animations",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    tags: ["Frontend", "Design"],
    banner: "/space.jfif",
    detail:
      "Master Flexbox, Grid, custom properties, animations and responsive design. Make pixels obey you — completely.",
    learn: [
      "Flexbox & CSS Grid",
      "Custom properties",
      "Animations & transitions",
      "Responsive design",
    ],
  },
  JavaScript: {
    desc: "Dynamic scripting for the web",
    difficulty: "Intermediate",
    diffColor: "text-yellow-400",
    tags: ["Frontend", "Backend"],
    banner: "/hmm.jfif",
    detail:
      "From DOM manipulation to async/await and closures. Write JS that actually works under pressure — and passes every test case.",
    learn: [
      "ES6+ & closures",
      "Async/await & Promises",
      "DOM manipulation",
      "Error handling",
    ],
  },
  Python: {
    desc: "AI, data science & automation",
    difficulty: "Beginner",
    diffColor: "text-emerald-400",
    tags: ["Data", "AI", "Backend"],
    banner: "/mount.jfif",
    detail:
      "The language of machine learning, scripting and automation. Solve real problems with clean, expressive Python code.",
    learn: [
      "Data types & structures",
      "Functions & decorators",
      "File I/O & modules",
      "OOP in Python",
    ],
  },
  React: {
    desc: "Component-driven reactive UIs",
    difficulty: "Intermediate",
    diffColor: "text-yellow-400",
    tags: ["Framework", "Frontend"],
    banner: "/gladiator1.jpg",
    detail:
      "Hooks, state, context and performance patterns. Build UIs that re-render correctly, efficiently, every single time.",
    learn: [
      "useState & useEffect",
      "Context & reducers",
      "Performance patterns",
      "Component design",
    ],
  },
  "Data Structures & Algorithms": {
    desc: "Ace every technical interview",
    difficulty: "Advanced",
    diffColor: "text-red-400",
    tags: ["Interview", "CS Core"],
    banner: "/tree2.jfif",
    detail:
      "Arrays, trees, graphs, dynamic programming. Everything you need to crack FAANG interviews and think algorithmically.",
    learn: [
      "Arrays, stacks & queues",
      "Trees & graphs",
      "Dynamic programming",
      "Sorting algorithms",
    ],
  },
};

const SPRING = { type: "spring", stiffness: 300, damping: 30, mass: 0.85 };

export default function SkillCard({
  title,
  img,
  href,
  progress,
  isLoading,
  active,
  onOpen,
  onClose,
}) {
  const navigate = useNavigate();
  const expandRef = useRef(null);
  const id = useId();

  const isEnrolled = progress?.enrolled;
  const progressPct = progress?.total
    ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
    : 0;
  const meta = LANG_META[title] || {
    desc: "",
    difficulty: "",
    diffColor: "text-zinc-400",
    tags: [],
    banner: "/gladiator.jpg",
    detail: "",
    learn: [],
  };

  useEffect(() => {
    if (!active) return;
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [active, onClose]);

  useOutsideClick(expandRef, () => {
    if (active) onClose();
  });

  return (
    <>
      <AnimatePresence>
        {active && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/75 z-40"
              onClick={onClose}
            />

            <div className="fixed inset-0 grid place-items-center z-50 p-4 pointer-events-none">
              <motion.div
                layoutId={`card-${title}-${id}`}
                ref={expandRef}
                transition={SPRING}
                className="w-full max-w-[460px] flex flex-col bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl pointer-events-auto"
              >
                {/* Banner image */}
                <motion.div
                  layoutId={`banner-${title}-${id}`}
                  transition={SPRING}
                  className="relative shrink-0"
                >
                  <img
                    src={meta.banner}
                    alt={title}
                    className="w-full h-56 object-cover object-center"
                    draggable={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />
                  <button
                    onClick={onClose}
                    className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/60 border border-white/20 text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                </motion.div>

                {/* Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={img}
                        alt={title}
                        className="w-9 h-9 object-contain shrink-0"
                      />
                      <div>
                        <h3 className="text-white font-bold text-base font-inter leading-tight">
                          {title}
                        </h3>
                        <p className="text-zinc-500 text-[11px] font-inter">
                          {meta.desc}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider shrink-0 mt-1 ${meta.diffColor}`}
                    >
                      {meta.difficulty}
                    </span>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, delay: 0.1 }}
                  >
                    <p className="text-zinc-400 text-sm font-inter leading-relaxed mb-4">
                      {meta.detail}
                    </p>

                    <p className="text-[9px] font-inter font-bold uppercase tracking-widest text-orange-400 mb-2">
                      What you'll learn
                    </p>
                    <ul className="grid grid-cols-2 gap-1.5 mb-4">
                      {meta.learn.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-1.5 text-xs font-inter text-zinc-400"
                        >
                          <span className="text-orange-400 mt-0.5 shrink-0">
                            ✓
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {meta.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-400 border border-white/[0.08]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    {isEnrolled && !isLoading && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5">
                          <span className="font-mono text-zinc-400">
                            {progressPct}% done
                          </span>
                          <span>
                            {progress.completed}/{progress.total}
                          </span>
                        </div>
                        <Progress
                          value={progressPct}
                          className="h-1.5 bg-black/50"
                          indicatorClassName="bg-gradient-to-r from-red-500 to-orange-500"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => {
                        onClose();
                        if (href) setTimeout(() => navigate(href), 200);
                      }}
                      className={`w-full py-3 rounded-lg text-black text-sm font-bold font-inter tracking-wider transition-all duration-150 active:scale-95 ${
                        isEnrolled
                          ? "bg-yellow-500 hover:bg-yellow-400"
                          : "bg-red-600 hover:bg-red-500"
                      }`}
                    >
                      {isEnrolled ? "Continue Learning →" : "Start Learning →"}
                    </button>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* ── Grid card — ALWAYS in DOM, never leaves grid ── */}
      <motion.div
        layoutId={`card-${title}-${id}`}
        transition={SPRING}
        onClick={() => {
          if (!href || active) return;
          if (isEnrolled) {
            navigate(href);
          } else {
            onOpen();
          }
        }}
        className={`group relative w-full max-w-[270px] h-[340px] rounded-2xl overflow-hidden flex flex-col bg-[#111] border border-white/[0.08] shadow-lg ${href ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
        style={{ willChange: "transform" }}
      >
        <GlowingEffect
          spread={35}
          glow={false}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={2}
        />

        {/* Banner image — top half */}
        <motion.div
          layoutId={`banner-${title}-${id}`}
          transition={SPRING}
          className="relative h-[155px] shrink-0 overflow-hidden"
        >
          <img
            src={meta.banner}
            alt={title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />
          {isEnrolled && !isLoading && (
            <span className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/25 text-[8px] font-bold tracking-wider uppercase backdrop-blur-sm">
              <CheckCircle size={8} /> Enrolled
            </span>
          )}
        </motion.div>

        {/* Info — bottom half */}
        <div className="flex-1 flex flex-col px-4 pt-3 pb-3.5">
          {/* Icon + title + difficulty */}
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={img}
                alt={title}
                className="w-7 h-7 object-contain shrink-0"
              />
              <h3 className="text-[14px] font-bold text-white font-inter leading-tight truncate">
                {title}
              </h3>
            </div>
            <span
              className={`text-[8px] font-bold uppercase tracking-wider shrink-0 ${meta.diffColor}`}
            >
              {meta.difficulty}
            </span>
          </div>

          {/* Description */}
          <p className="text-[10px] text-zinc-400 font-inter leading-relaxed line-clamp-2 mb-2">
            {meta.desc}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {meta.tags.map((tag) => (
              <span
                key={tag}
                className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-600 border border-white/[0.07]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Progress line */}
          <div className="flex justify-between text-[9px] text-zinc-600 mb-2.5">
            {isLoading ? (
              <div className="h-3 w-16 bg-white/10 rounded animate-pulse" />
            ) : (
              <>
                <span className="font-mono">{progressPct}% done</span>
                <span>
                  {progress?.completed ?? 0}/{progress?.total ?? 0}
                </span>
              </>
            )}
          </div>

          {/* CTA — always full-width solid button */}
          <div className="mt-auto">
            {isLoading ? (
              <div className="h-9 bg-white/10 rounded-xl animate-pulse" />
            ) : (
              <div
                className={`w-full py-2.5 rounded-lg border-[1.4px] flex items-center justify-center  ${
                  isEnrolled
                    ? "bg-yellow-500 group-hover:bg-yellow-400 border-yellow-600"
                    : "bg-red-600 group-hover:bg-red-500 border-red-400"
                }`}
              >
                <span className="text-[11px] font-bold text-black font-inter tracking-wider">
                  {isEnrolled ? "Continue Learning →" : "Start Learning →"}
                </span>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
