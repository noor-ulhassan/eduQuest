import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MagicCard } from "@/components/ui/magic-card";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SkillCard({ title, img, href, progress, isLoading }) {
  const navigate = useNavigate();
  const isEnrolled = progress?.enrolled;
  const progressPercent = progress?.total
    ? Math.min(100, Math.round((progress.completed / progress.total) * 100))
    : 0;

  return (
    <div
      onClick={() => href && navigate(href)}
      className={`group w-full max-w-[320px] h-[360px] cursor-pointer transition-transform duration-300 hover:-translate-y-2 ${!href && "cursor-not-allowed opacity-60"}`}
    >
      <MagicCard
        className="w-full h-full rounded-2xl bg-[#1a1a1a] shadow-2xl border-none"
        gradientColor="#ff4d4d"
        gradientOpacity={0.12}
        gradientSize={250}
        backgroundColor="#1c1c1c"
      >
        <Card className="flex flex-col relative z-20 w-full h-full bg-transparent border-0 shadow-none text-white p-6 justify-between overflow-hidden">
          
          {/* Header Row */}
          <div className="w-full flex justify-end min-h-[30px]">
            {isEnrolled && !isLoading && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-xs font-bold tracking-wider uppercase backdrop-blur-sm">
                <CheckCircle size={14} />
                <span>Enrolled</span>
              </div>
            )}
          </div>

          {/* Centered Logo & Title */}
          <CardContent className="flex flex-col items-center justify-center flex-1 p-0">
            <div className="w-24 h-24 mb-6 transition-transform duration-500 group-hover:scale-110 flex items-center justify-center">
              <img
                src={img}
                alt={title}
                className="max-w-full max-h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
              />
            </div>
            <CardTitle className="text-2xl font-bold tracking-wide text-white/90 group-hover:text-white transition-colors">
              {title}
            </CardTitle>
          </CardContent>

          {/* Footer - Progress */}
          <CardFooter className="w-full p-0 flex flex-col pt-6">
            {isLoading ? (
              <div className="w-full space-y-2">
                <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
                <div className="h-2 bg-white/10 rounded animate-pulse" />
              </div>
            ) : isEnrolled ? (
              <div className="w-full">
                <div className="flex justify-between items-center mb-3 text-sm text-gray-400 font-medium">
                  <span>{progressPercent}% <span className="text-gray-500 text-xs uppercase ml-1">Completed</span></span>
                  <span className="text-white font-mono">{progress.completed} / {progress.total}</span>
                </div>
                <Progress
                  value={progressPercent}
                  className="h-2 bg-black/50"
                  indicatorClassName="bg-gradient-to-r from-red-500 to-orange-500"
                />
              </div>
            ) : (
              <div className="w-full py-3 flex items-center justify-center bg-red-500/10 rounded-xl border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                <span className="text-[11px] font-bold text-red-500 tracking-widest uppercase">
                  Start Learning
                </span>
              </div>
            )}
          </CardFooter>
        </Card>
      </MagicCard>
    </div>
  );
}
