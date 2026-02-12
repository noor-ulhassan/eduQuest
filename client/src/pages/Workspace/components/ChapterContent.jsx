import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import api from "@/features/auth/authApi";
import { useDispatch, useSelector } from "react-redux";
import { grantXP } from "./../../../../../server/utils/gamificationHelper";

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
    <div className="p-10 mt-16 max-w-5xl mx-auto">
      <div className="mb-10">
        <h2 className="text-4xl font-bold text-zinc-900 mb-2">
          {chapter?.chapterName}
        </h2>
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <span className="bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
            {chapter?.duration || "15 Min"}
          </span>
          <span>•</span>
          <span>{chapter?.topics?.length} Topics</span>
        </div>
      </div>

      <div className="flex flex-col gap-10">
        {chapter?.topics?.map((topic, i) => (
          <div
            key={i}
            ref={(el) => (topicRefs.current[i] = el)}
            className={`transition-all duration-500 rounded-2xl p-8 border ${
              selectedTopic === i
                ? "bg-white border-primary shadow-xl ring-1 ring-primary/20"
                : "bg-white border-zinc-200 shadow-sm opacity-80"
            }`}
          >
            <h3 className="text-2xl font-extrabold text-zinc-800 mb-6 flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 text-white text-sm">
                {i + 1}
              </span>
              {typeof topic === "object" ? topic.topic : topic}
            </h3>

            {topic?.content ? (
              <div
                className="prose prose-zinc max-w-none 
                prose-p:leading-8 prose-p:text-[17px]"
                dangerouslySetInnerHTML={{ __html: topic.content }}
              />
            ) : (
              <div className="py-10 text-center text-zinc-400 italic">
                Content pending...
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-10 mb-20 flex justify-center">
        <Button
          onClick={handleMarkCompleted}
          disabled={enrollment?.completedChapters?.includes(
            chapter?.chapterName,
          )}
          variant="pixel"
          className="text-2xl font-jersey px-10 h-14 bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <CheckCircle2 className="w-6 h-6" />
          {enrollment?.completedChapters?.includes(chapter?.chapterName)
            ? "Chapter Completed"
            : "Mark Chapter as Completed"}
        </Button>
      </div>
    </div>
  );
}

export default ChapterContent;
