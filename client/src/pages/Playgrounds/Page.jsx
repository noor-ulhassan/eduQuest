import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SkillCard from "./components/SkillCard";
import { getPlaygroundProgress, getCurriculumsMetadata } from "../../features/playground/playgroundApi";
import { Terminal } from "lucide-react";

export default function Playground() {
  const user = useSelector((state) => state.auth.user);
  const [progressData, setProgressData] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        const [{ progress }, { metadata }] = await Promise.all([
          getPlaygroundProgress(),
          getCurriculumsMetadata()
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
              progressMap[p.language].completed = p.completedProblems?.length || 0;
            } else {
              // fallback if metadata is somehow missing for an enrolled language
               progressMap[p.language] = {
                 enrolled: true,
                 completed: p.completedProblems?.length || 0,
                 total: 0
               }
            }
          });
        }
        setProgressData(progressMap);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProgress();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-sans pb-24 text-white">
      {/* Hero Banner Area */}
      <div className="relative border-b border-white/5 bg-[#111111] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-3xl bg-black border border-white/10 flex items-center justify-center shadow-2xl shrink-0">
            <Terminal className="w-12 h-12 lg:w-16 lg:h-16 text-red-500" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Code Playgrounds
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl">
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
            className="text-4xl font-hand font-bold tracking-tight text-white/90"
            style={{
              letterSpacing: "0.1rem",
            }}
          >
            Available Languages & Frameworks
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 justify-items-center">
          <SkillCard
            title="Html"
            img="/html1.png"
            href={
              progressData.html?.enrolled
                ? "/playground/html"
                : "/playground/html/topics"
            }
            progress={progressData.html}
            isLoading={isLoading}
          />
          <SkillCard
            title="Css"
            img="/css1.png"
            href={
              progressData.css?.enrolled
                ? "/playground/css"
                : "/playground/css/topics"
            }
            progress={progressData.css}
            isLoading={isLoading}
          />
          <SkillCard
            title="JavaScript"
            img="/js2.png"
            href={
              progressData.javascript?.enrolled
                ? "/playground/javascript"
                : "/playground/javascript/topics"
            }
            progress={progressData.javascript}
            isLoading={isLoading}
          />
          <SkillCard
            title="Python"
            img="/python1.png"
            href={
              progressData.python?.enrolled
                ? "/playground/python"
                : "/playground/python/topics"
            }
            progress={progressData.python}
            isLoading={isLoading}
          />
          <SkillCard
            title="React"
            img="/react.png"
            href={
              progressData.react?.enrolled
                ? "/playground/react"
                : "/playground/react/topics"
            }
            progress={progressData.react}
            isLoading={isLoading}
          />
          <SkillCard
            title="Data Structures & Algorithms"
            img="/dsa1.jpg"
            href={
              progressData.dsa?.enrolled
                ? "/playground/dsa"
                : "/playground/dsa/topics"
            }
            progress={progressData.dsa}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
