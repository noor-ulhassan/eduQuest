import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const SkillCard = ({ title, img, href, progress, isLoading }) => {
  const navigate = useNavigate();
  const isEnrolled = progress?.enrolled;
  const progressPercent = progress
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div
      onClick={() => href && navigate(href)}
      className={`flex-shrink-0 flex flex-col items-center justify-center w-[220px] ${href ? "cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
    >
      <div className="relative w-full bg-white dark:bg-black p-5 rounded-[20px] border-2 hover:border-zinc-500 border-zinc-300 border-b-8 dark:border-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.08)] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col items-center h-[300px] justify-between z-0">
        {isEnrolled && !isLoading && (
          <div className="absolute top-2 right-2 bg-green-100 text-green-700 text-[9px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm border border-green-200">
            <CheckCircle
              size={10}
              fill="currentColor"
              className="text-green-600"
            />
            Enrolled
          </div>
        )}

        <div className="flex-1 flex items-center justify-center w-full mt-2">
          <img
            src={img}
            alt={title}
            className="w-24 h-24 object-contain drop-shadow-sm"
          />
        </div>

        <div className="w-full mt-3 flex flex-col items-center">
          <h3 className="text-lg font-bold text-zinc-800 dark:text-white tracking-tight hover:text-yellow-600 mb-3 text-center leading-tight">
            {title}
          </h3>

          {/* Progress Bar inside card */}
          {isEnrolled && !isLoading ? (
            <div className="w-full bg-zinc-50 p-2.5 rounded-lg border border-zinc-100">
              <div className="flex justify-between text-[10px] text-zinc-500 mb-1.5 font-medium">
                <span>
                  {progress.completed}/{progress.total} Done
                </span>
                <span className="text-zinc-900 font-bold">
                  {progressPercent}%
                </span>
              </div>
              <Progress
                value={progressPercent}
                className="h-2 bg-zinc-200"
                indicatorClassName="bg-gradient-to-r from-green-500 to-emerald-600"
              />
            </div>
          ) : (
            <div className="h-[54px] w-full flex items-center justify-center">
              <span className="text-[10px] font-medium text-zinc-400 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100 group-hover:bg-zinc-100 transition-colors">
                Under Development
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
