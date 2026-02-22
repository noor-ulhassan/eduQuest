import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SkillCard from "./components/SkillCard";
import { getPlaygroundProgress } from "../../features/playground/playgroundApi";
import { PLAYGROUND_DATA } from "../../data/playgroundData";

const Playground = () => {
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
        const { progress } = await getPlaygroundProgress();

        // Transform progress array into a map for easy lookup
        const progressMap = {};
        progress.forEach((p) => {
          const langData = PLAYGROUND_DATA[p.language];
          if (langData) {
            const totalProblems = langData.chapters.reduce(
              (sum, ch) => sum + ch.problems.length,
              0,
            );
            progressMap[p.language] = {
              enrolled: true,
              completed: p.completedProblems.length,
              total: totalProblems,
              xpEarned: p.totalXpEarned,
            };
          }
        });

        setProgressData(progressMap);
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 md:gap-10 mt-20 sm:mt-24 md:mt-28 px-4 sm:px-6 md:px-12 mb-6 sm:mb-8 md:mb-12">
        <img
          src="/cs.png"
          alt="cs"
          height={70}
          width={70}
          className="border-r-full rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-xl sm:text-2xl">
            Foundations of Development
          </h1>
          <p className="mt-2 sm:mt-4 text-sm text-zinc-600">
            Strengthen your fundamentals
          </p>
        </div>
      </div>
      <div className="mt-8 sm:mt-12 md:mt-18 flex bg-zinc-100 border rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-12 py-6 sm:py-8 md:py-12 mx-4 sm:mx-6 my-4 sm:my-6 gap-4 sm:gap-6 items-start overflow-x-auto pb-6 sm:pb-8 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
        <SkillCard
          title="Html"
          img="/html5.png"
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
          img="/css.png"
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
          img="/javascript.png"
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
          img="/python.png"
          href={
            progressData.python?.enrolled
              ? "/playground/python"
              : "/playground/python/topics"
          }
          progress={progressData.python}
          isLoading={isLoading}
        />
        <SkillCard
          title="Data Structures & Algorithms"
          img="/dsa.png"
          href="/Problems"
        />
        <SkillCard title="React" img="/react.png" />
      </div>
    </div>
  );
};

export default Playground;
