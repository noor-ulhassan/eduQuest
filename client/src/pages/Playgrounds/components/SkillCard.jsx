import React from "react";

const SkillCard = ({ title, img }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-[240px]">
      <div className="bg-white dark:bg-black p-8 rounded-[15px] border-2 hover:border-zinc-500 hover:cursor-pointer border-zinc-300 border-b-8 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <img src={img} alt={title} className="w-32 h-32 object-contain" />
      </div>

      <h3 className="mt-6 text-zinc-700 dark:text-white tracking-tight hover:text-yellow-500 hover:cursor-pointer">
        {title}
      </h3>
    </div>
  );
};

export default SkillCard;
