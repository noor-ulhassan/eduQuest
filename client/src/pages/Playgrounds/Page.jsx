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
      <div className="flex gap-10 mt-28 px-12 mb-12">
        <img
          src="/cs.png"
          alt="cs"
          height={70}
          width={70}
          className="border-r-full rounded-lg "
        />
        <h1 className="font-bold text-2xl mt-6">Foundations of Development</h1>
        <p className="mt-8 text-sm text-zinc-600 text-1xl">
          Strengthen your fundamentals
        </p>
      </div>
      <div className="mt-18 flex bg-zinc-100 border rounded-3xl px-12 py-12 mx-6 my-6 gap-6 items-start overflow-x-auto pb-8 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
        <SkillCard
          title="Html"
          img="/html5.png"
          href="/playground/html"
          progress={progressData.html}
          isLoading={isLoading}
        />
        <SkillCard
          title="Css"
          img="/css.png"
          href="/playground/css"
          progress={progressData.css}
          isLoading={isLoading}
        />

        <SkillCard
          title="JavaScript"
          img="/javascript.png"
          href="/playground/javascript"
          progress={progressData.javascript}
          isLoading={isLoading}
        />
        <SkillCard
          title="Python"
          img="/python.png"
          href="/playground/python"
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
