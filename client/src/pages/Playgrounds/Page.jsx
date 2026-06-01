import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import SkillCard from "./components/SkillCard";
import {
  usePlaygroundProgress,
  useCurriculumsMetadata,
} from "../../features/playground/usePlayground";
import { Terminal } from "lucide-react";
import { DottedGlowBackground } from "../../components/ui/dotted-glow-background";

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
const IMG_FALLBACK = "/code.png";

export default function Playground() {
  const user = useSelector((state) => state.auth.user);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    if (activeCard) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeCard]);

  const {
    data: progressPayload,
    isLoading: progressLoading,
    isError: progressError,
  } = usePlaygroundProgress();
  const {
    data: metadataPayload,
    isLoading: metadataLoading,
    isError: metadataError,
  } = useCurriculumsMetadata();

  const error =
    progressError || metadataError
      ? "Failed to load progress. Please refresh the page."
      : null;

  const progressData = useMemo(() => {
    const map = {};
    const metadata = metadataPayload?.metadata;
    const progress = progressPayload?.progress;

    if (metadata) {
      metadata.forEach((m) => {
        map[m.language] = {
          enrolled: false,
          completed: 0,
          total: m.totalProblems,
        };
      });
    }
    if (progress && Array.isArray(progress)) {
      progress.forEach((p) => {
        if (map[p.language]) {
          map[p.language].enrolled = true;
          map[p.language].completed = p.completedProblems?.length || 0;
        } else {
          map[p.language] = {
            enrolled: true,
            completed: p.completedProblems?.length || 0,
            total: 0,
          };
        }
      });
    }
    return map;
  }, [progressPayload, metadataPayload]);

  // Split metadata into enrolled vs not
  const allMetadata = metadataPayload?.metadata || [];
  const enrolledMetadata = allMetadata.filter(
    ({ language }) => progressData[language]?.enrolled,
  );
  const unenrolledMetadata = allMetadata.filter(
    ({ language }) => !progressData[language]?.enrolled,
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans pb-24 text-white">
      {error && (
        <div className="bg-red-900/40 border-b border-red-500/30 text-red-300 text-sm text-center py-2 px-4">
          {error}
        </div>
      )}

      {/* ── Hero Banner ── */}
      <div className="relative border-b border-white/5 bg-[#111111] overflow-hidden">
        <DottedGlowBackground
          className="pointer-events-none mask-radial-to-90% mask-radial-at-center opacity-60"
          opacity={1}
          gap={10}
          radius={1.6}
          color="#525252"
          darkColor="#525252"
          glowColor="#a3a3a3"
          darkGlowColor="#a3a3a3"
          backgroundOpacity={0}
          speedMin={0.3}
          speedMax={1.6}
          speedScale={1}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent mix-blend-overlay" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-14 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-black border border-white/10 flex items-center justify-center shadow-2xl shrink-0">
            <Terminal className="w-12 h-12 lg:w-16 lg:h-16 text-red-500" />
          </div>
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-3 pb-2">
              <h1 className="text-5xl lg:text-5xl text-metallic font-extrabold tracking-tight pb-2">
                Code Playgrounds
              </h1>
              <img
                src="/machine.webp"
                alt="robot"
                className="w-20 h-20 lg:w-12 lg:h-12 object-contain drop-shadow-lg"
              />
            </div>
            <p className="text-lg text-gray-300 font-hand font-bold max-w-2xl">
              Master programming languages through interactive, test-driven
              coding challenges. Practice your fundamentals, earn XP, and level
              up your skills.
            </p>
            <div className="flex items-center gap-5 mt-6 flex-wrap justify-center md:justify-start">
              {[
                {
                  label: "Languages",
                  value:
                    metadataPayload?.metadata?.length ||
                    Object.keys(progressData).length ||
                    "9+",
                },
                {
                  label: "Enrolled",
                  value: Object.values(progressData).filter((p) => p.enrolled)
                    .length,
                  color: "#2cf09d",
                },
                {
                  label: "Lessons Solved",
                  value: Object.values(progressData).reduce(
                    (s, p) => s + (p.completed || 0),
                    0,
                  ),
                  color: "#f97316",
                },
                {
                  label: "Total Lessons",
                  value:
                    Object.values(progressData).reduce(
                      (s, p) => s + (p.total || 0),
                      0,
                    ) || "500+",
                },
              ].map(({ label, value, color }) => (
                <div
                  key={label}
                  className="flex flex-col items-start min-w-[68px]"
                >
                  <span
                    className="text-2xl font-black tabular-nums leading-none"
                    style={{ color: color || "#ffffff" }}
                  >
                    {value}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-[0.18em] font-bold mt-1">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-14">
        {/* ── Continue Learning (enrolled) ── */}
        {(progressLoading || enrolledMetadata.length > 0) && (
          <section className="mb-16">
            {/* Section header */}
            <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
              <div>
                <h2
                  className="text-4xl font-hand font-bold tracking-tight text-metallic pb-2"
                  style={{ letterSpacing: "0.1rem" }}
                >
                  Continue Learning
                </h2>
                <p className="text-sm text-zinc-500 max-w-xl">
                  Pick up where you left off.
                </p>
              </div>
              {!progressLoading && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  {enrolledMetadata.length} enrolled
                </span>
              )}
            </div>

            {/* Enrolled cards — slightly larger grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
              {progressLoading
                ? Array.from({ length: 3 }, (_, i) => (
                    <div
                      key={i}
                      className="w-full max-w-[270px] h-[370px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
                    />
                  ))
                : enrolledMetadata.map(({ language, title }) => (
                    <SkillCard
                      key={language}
                      language={language}
                      title={title}
                      img={LANGUAGE_IMAGES[language] || IMG_FALLBACK}
                      href={`/playground/${language}`}
                      progress={progressData[language]}
                      isLoading={progressLoading}
                      active={activeCard === language}
                      onOpen={() => setActiveCard(language)}
                      onClose={() => setActiveCard(null)}
                    />
                  ))}
            </div>
          </section>
        )}

        {/* ── Divider ── */}
        {enrolledMetadata.length > 0 && unenrolledMetadata.length > 0 && (
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-zinc-600 uppercase tracking-widest font-semibold">
              All Languages
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>
        )}

        {/* ── All / Unenrolled courses ── */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
            <div>
              <h2
                className="text-4xl font-hand font-bold tracking-tight text-metallic pb-2"
                style={{ letterSpacing: "0.1rem" }}
              >
                {enrolledMetadata.length > 0
                  ? "Explore More"
                  : "Available Languages & Frameworks"}
              </h2>
              <p className="text-sm text-zinc-500 max-w-xl">
                {enrolledMetadata.length > 0
                  ? "New languages to add to your journey."
                  : "Click any card to preview — enrolled languages open directly into their workspace."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center">
            {metadataLoading
              ? Array.from({ length: 6 }, (_, i) => (
                  <div
                    key={i}
                    className="w-full max-w-[270px] h-[370px] rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse"
                  />
                ))
              : (enrolledMetadata.length > 0
                  ? unenrolledMetadata
                  : allMetadata
                ).map(({ language, title }) => (
                  <SkillCard
                    key={language}
                    language={language}
                    title={title}
                    img={LANGUAGE_IMAGES[language] || IMG_FALLBACK}
                    href={`/playground/${language}`}
                    progress={progressData[language]}
                    isLoading={progressLoading}
                    active={activeCard === language}
                    onOpen={() => setActiveCard(language)}
                    onClose={() => setActiveCard(null)}
                  />
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
