import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SkillCard from "./components/SkillCard";
import {
  getPlaygroundProgress,
  getCurriculumsMetadata,
} from "../../features/playground/playgroundApi";
import { Terminal } from "lucide-react";
import { DottedGlowBackground } from "../../components/ui/dotted-glow-background";

export default function Playground() {
  const user = useSelector((state) => state.auth.user);
  const [progressData, setProgressData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    if (activeCard) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [activeCard]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const [{ progress }, { metadata }] = await Promise.all([
          getPlaygroundProgress(),
          getCurriculumsMetadata(),
        ]);

        const progressMap = {};

        // Default init with total problems
        if (metadata) {
          metadata.forEach((m) => {
            progressMap[m.language] = {
              enrolled: false,
              completed: 0,
              total: m.totalProblems,
            };
          });
        }

        if (progress && Array.isArray(progress)) {
          progress.forEach((p) => {
            if (progressMap[p.language]) {
              progressMap[p.language].enrolled = true;
              progressMap[p.language].completed =
                p.completedProblems?.length || 0;
            } else {
              // fallback if metadata is somehow missing for an enrolled language
              progressMap[p.language] = {
                enrolled: true,
                completed: p.completedProblems?.length || 0,
                total: 0,
              };
            }
          });
        }
        setProgressData(progressMap);
      } catch (error) {
        console.error(error);
        setError("Failed to load progress. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans pb-24 text-white">
      {error && (
        <div className="bg-red-900/40 border-b border-red-500/30 text-red-300 text-sm text-center py-2 px-4">
          {error}
        </div>
      )}
      {/* Hero Banner Area */}
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
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent mix-blend-overlay"></div>
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
          </div>
        </div>
      </div>

      {/* Grid Area */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-16">
        <div className="flex items-center justify-between mb-10">
          <h2
            className="text-4xl font-hand font-bold tracking-tight text-metallic pb-2"
            style={{
              letterSpacing: "0.1rem",
            }}
          >
            Available Languages & Frameworks
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center">
          {[
            {
              title: "Html",
              img: "/html1.png",
              key: "html",
              href: "/playground/html",
            },
            {
              title: "Css",
              img: "/css1.png",
              key: "css",
              href: "/playground/css",
            },
            {
              title: "JavaScript",
              img: "/js2.png",
              key: "javascript",
              href: "/playground/javascript",
            },
            {
              title: "Python",
              img: "/python1.png",
              key: "python",
              href: "/playground/python",
            },
            {
              title: "React",
              img: "/react.png",
              key: "react",
              href: "/playground/react",
            },
            {
              title: "Data Structures & Algorithms",
              img: "/dsa1.jpg",
              key: "dsa",
              href: "/playground/dsa",
            },
          ].map(({ title, img, key, href }) => (
            <SkillCard
              key={title}
              title={title}
              img={img}
              href={href}
              progress={progressData[key]}
              isLoading={isLoading}
              active={activeCard === title}
              onOpen={() => setActiveCard(title)}
              onClose={() => setActiveCard(null)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
