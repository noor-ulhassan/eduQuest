import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import api from "@/features/auth/authApi";
import { useDispatch, useSelector } from "react-redux";
import { grantXP } from "@/utils/gamificationHelper.js";

function ChapterContent({
  chapter,
  selectedTopic,
  enrollment,
  onProgressUpdate,
}) {
  const topicRefs = useRef([]);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (topicRefs.current[selectedTopic]) {
      topicRefs.current[selectedTopic].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [selectedTopic]);

  if (!chapter) {
    return (
      <div className="p-10 mt-16 text-center text-gray-500 font-jersey text-2xl">
        Select a chapter to begin learning...
      </div>
    );
  }

  const handleMarkCompleted = async () => {
    if (!enrollment?._id) return;
    try {
      // 1. Mark the chapter as completed in the Enrollment record
      await api.post("http://localhost:8080/api/v1/ai/mark-chapter-completed", {
        enrollmentId: enrollment._id,
        chapterName: chapter.chapterName,
        userEmail: user?.email,
      });

      // 2. Grant XP (Frontend decides the amount: e.g., 150)
      // This helper will update Redux, trigger the UserStatus animation, and show a toast
      await grantXP(dispatch, 150);

      // 3. Refresh sidebar checkmarks
      onProgressUpdate();
    } catch (error) {
      console.error("Error updating progress:", error);
    }
  };

  return (
    <article className="py-10 max-w-3xl mx-auto font-sans">
      <header className="mb-16 border-b border-white/10 pb-10">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-space-grotesk tracking-tight leading-tight">
          {chapter?.chapterName}
        </h1>
        <div className="flex items-center gap-4 text-zinc-400 text-sm font-medium">
          <span className="bg-red-600/10 text-red-400 px-4 py-1.5 rounded-full border border-red-500/20">
            {chapter?.duration || "15 Min"}
          </span>
          <span>•</span>
          <span>{chapter?.topics?.length} Topics</span>
        </div>
      </header>

      <div className="flex flex-col gap-16">
        {chapter?.topics?.map((topic, i) => (
          <section
            key={i}
            ref={(el) => (topicRefs.current[i] = el)}
            className={`transition-all duration-700 ${
              selectedTopic === i
                ? "opacity-100 translate-x-0"
                : "opacity-60 hover:opacity-90"
            }`}
          >
            <h2 className="text-2xl font-bold text-white mb-8 font-space-grotesk flex items-center gap-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600/20 text-red-400 text-sm border border-red-500/30">
                {i + 1}
              </span>
              {typeof topic === "object" ? topic.topic : topic}
            </h2>

            {topic?.content ? (
              <div
                className="prose prose-zinc prose-invert max-w-none 
         prose-p:text-lg prose-p:leading-relaxed prose-p:text-zinc-300
         prose-headings:font-space-grotesk prose-headings:text-white
         prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
         prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline
         prose-strong:text-white prose-strong:font-semibold
         prose-code:text-red-300 prose-code:bg-red-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
         prose-pre:bg-[#111111] prose-pre:border prose-pre:border-white/10
         prose-ul:text-zinc-300 prose-li:marker:text-red-500"
                dangerouslySetInnerHTML={{ __html: topic.content }}
              />
            ) : (
              <div className="py-10 text-zinc-500 italic flex items-center justify-center bg-[#111111] rounded-xl border border-white/5">
                Content generation pending...
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="mt-20 mb-20 flex justify-center pt-10 border-t border-white/10">
        <Button
          onClick={handleMarkCompleted}
          disabled={enrollment?.completedChapters?.includes(
            chapter?.chapterName,
          )}
          className="text-lg font-bold px-10 h-14 bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20 rounded-xl transition-all"
        >
          {enrollment?.completedChapters?.includes(chapter?.chapterName) ? (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" /> Chapter Completed
            </>
          ) : (
            "Mark Chapter as Completed"
          )}
        </Button>
      </div>
    </article>
  );
}

export default ChapterContent;
