import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

const SkillCard = ({ title, img, href, progress, isLoading }) => {
  const navigate = useNavigate();
  const isEnrolled = progress?.enrolled;
  const progressPercent = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div
      onClick={() => href && navigate(href)}
      className={`flex flex-col items-center justify-center w-full max-w-[240px] ${href ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
    >
      <div className="relative bg-white dark:bg-black p-8 rounded-[15px] border-2 hover:border-zinc-500 border-zinc-300 border-b-8 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <img src={img} alt={title} className="w-32 h-32 object-contain" />

        {/* Enrollment Badge */}
        {isEnrolled && !isLoading && (
          <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <CheckCircle size={12} />
            Enrolled
          </div>
        )}
      </div>

      <h3 className="mt-6 text-zinc-700 dark:text-white tracking-tight hover:text-yellow-500">
        {title}
      </h3>

      {/* Progress Bar */}
      {isEnrolled && !isLoading && (
        <div className="mt-2 w-full max-w-[200px]">
          <div className="flex justify-between text-[10px] text-zinc-600 mb-1">
            <span>
              {progress.completed}/{progress.total} completed
            </span>
            <span className="font-semibold">{progressPercent}%</span>
          </div>
          <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillCard;
