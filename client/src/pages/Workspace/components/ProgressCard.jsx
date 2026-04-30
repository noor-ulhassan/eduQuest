import { GlowingEffect } from "@/components/ui/glowing-effect";
import api from "@/features/auth/authApi";
import { Book } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const bannerImages = [
 "/gif5.gif",
 "/gif6.gif",
 "/gif4.gif",
 "/gif7.gif",
 "/gif8.gif",
 "/gif9.gif",
];

function ProgressCard({ course, progress }) {
 const { user } = useSelector((state) => state.auth);
 const navigate = useNavigate();

 const courseLayout = course?.courseOutput;

 const identifier = course?.courseId || course?.name || "default";

 const bannerImage =
  bannerImages[
   Math.abs(
    String(identifier)
     .split("")
     .reduce((acc, char) => acc + char.charCodeAt(0), 0)
   ) % bannerImages.length
  ];

 const onEnrollClick = async (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
   const response = await api.post(
    "http://localhost:8080/api/v1/ai/enroll-course",
    {
     courseId: course?.courseId,
     userEmail: user?.email,
    }
   );

   if (response.data.success) {
    navigate(`/course/${course?.courseId}`);
   }
  } catch (error) {
   console.error("Enrollment failed:", error);
  }
 };

 const handleCardClick = () => {
  if (progress !== undefined) {
    navigate(`/course/${course?.courseId}`);
  } else if (course?.courseOutput) {
    onEnrollClick(new Event("click"));
  } else {
    navigate(`/course/${course?.courseId}`);
  }
 };

 return (
  <div
   onClick={handleCardClick}
   className="group relative w-full h-[340px] rounded-2xl overflow-hidden flex flex-col bg-[#111] border border-white/[0.08] shadow-lg cursor-pointer"
   style={{ willChange: "transform" }}
  >
   <GlowingEffect
    spread={35}
    glow={false}
    disabled={false}
    proximity={64}
    inactiveZone={0.01}
    borderWidth={2}
   />

   {/* Banner image — top half */}
   <div className="relative h-[155px] shrink-0 overflow-hidden">
    <img
     src={bannerImage}
     alt={course?.name || "Course Image"}
     className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
     draggable={false}
     onError={(e) => {
      e.target.src = "/gif4.gif";
     }}
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/20 to-transparent" />
   </div>

   {/* Info — bottom half */}
   <div className="flex-1 flex flex-col px-4 pt-3 pb-3.5 z-10">
    {/* Icon + title + difficulty */}
    <div className="flex items-center justify-between gap-2 mb-1.5">
     <div className="flex items-center gap-2 min-w-0">
      <div className="w-7 h-7 bg-emerald-500 flex items-center justify-center shrink-0">
       <Book className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-[14px] font-bold text-metallic font-inter leading-tight truncate">
       {course?.name || "Untitled Course"}
      </h3>
     </div>
     <span className="text-[8px] font-bold uppercase tracking-wider shrink-0 text-emerald-500">
      {progress !== undefined ? "IN PROGRESS" : "BEGINNER"}
     </span>
    </div>

    {/* Description */}
    <p className="text-[10px] text-zinc-400 font-inter leading-relaxed line-clamp-2 mb-2">
     {courseLayout?.description || course?.description || "An interactive course module."}
    </p>

    {/* Tags */}
    <div className="flex flex-wrap gap-1 mb-2">
     <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.07]">
      {course?.noOfChapters || 0} CHAPTERS
     </span>
     <span className="text-[8px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-white/[0.04] text-zinc-400 border border-white/[0.07]">
      COURSE
     </span>
    </div>

    {/* Progress line */}
    <div className="flex justify-between text-[9px] text-zinc-600 mb-1">
     <span className="font-mono">{progress !== undefined ? progress : 0}% done</span>
     <span>
      {Math.floor(((progress || 0) / 100) * (course?.noOfChapters || 0))}/{course?.noOfChapters || 0}
     </span>
    </div>
    
    {/* Progress bar visual */}
    {progress !== undefined && (
      <div className="w-full bg-black/50 h-1.5 rounded-full overflow-hidden mb-2">
       <div
        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-500"
        style={{ width: `${progress}%` }}
       ></div>
      </div>
    )}

    {/* CTA — always full-width solid button */}
    <div className="mt-auto pt-2">
     {progress !== undefined ? (
      <button
       onClick={(e) => {
        e.stopPropagation();
        navigate(`/course/${course?.courseId}`);
       }}
       className="w-full py-2.5 rounded-lg border-[1.4px] flex items-center justify-center bg-yellow-500 group-hover:bg-yellow-400 border-yellow-600 transition-colors"
      >
       <span className="text-[11px] font-bold text-black font-inter tracking-wider">
        Continue Learning →
       </span>
      </button>
     ) : course?.courseOutput ? (
      <button
       onClick={onEnrollClick}
       className="w-full py-2.5 rounded-lg border-[1.4px] flex items-center justify-center bg-red-600 group-hover:bg-red-500 border-red-400 transition-colors"
      >
       <span className="text-[11px] font-bold text-black font-inter tracking-wider">
        Start Learning →
       </span>
      </button>
     ) : (
      <button
       onClick={(e) => {
        e.stopPropagation();
        navigate(`/course/${course?.courseId}`);
       }}
       className="w-full py-2.5 rounded-lg border-[1.4px] flex items-center justify-center bg-zinc-800 group-hover:bg-zinc-700 border-zinc-600 transition-colors"
      >
       <span className="text-[11px] font-bold text-white font-inter tracking-wider">
        Generate Course →
       </span>
      </button>
     )}
    </div>
   </div>
  </div>
 );
}

export default ProgressCard;
