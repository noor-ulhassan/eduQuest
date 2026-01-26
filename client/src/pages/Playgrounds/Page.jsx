import React from "react";
import SkillCard from "./components/SkillCard";

const Playground = () => {
  return (
    <div>
      <h1 className="mt-28 font-bold text-3xl px-8">Learning Paths</h1>
      <p className="px-8 text-zinc-600 text-xl">
        Step-by-step paths to Mastery
      </p>
      <div className="flex gap-10 mt-20 px-12 mb-12">
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
      <div className="mt-18 flex bg-zinc-100 border rounded-3xl px-12 py-12 mx-6 my-6 gap-4 items-center">
        <SkillCard title="Html" img="/html5.png" />
        <SkillCard title="Css" img="/css.png" />
        <SkillCard title="React" img="/react.png" />
        <SkillCard title="Python" img="/python1.png" />
        <SkillCard
          title="Data Structures & Algorithms"
          img="/dsa.png"
          href="/Problems"
        />
      </div>
    </div>
  );
};

export default Playground;
