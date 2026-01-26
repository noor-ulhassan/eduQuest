import React from "react";
import { useNavigate } from "react-router-dom";

const SkillCard = ({ title, img, href }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(href)}
      className="flex flex-col items-center justify-center w-full max-w-[240px] cursor-pointer"
    >
      <div className="bg-white dark:bg-black p-8 rounded-[15px] border-2 hover:border-zinc-500 border-zinc-300 border-b-8 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <img src={img} alt={title} className="w-32 h-32 object-contain" />
      </div>

      <h3 className="mt-6 text-zinc-700 dark:text-white tracking-tight hover:text-yellow-500">
        {title}
      </h3>
    </div>
  );
};

export default SkillCard;
