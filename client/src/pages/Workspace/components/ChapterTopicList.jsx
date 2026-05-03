import React from "react";
import { Gift } from "lucide-react";

function ChapterTopicList({ course }) {
  const courseLayout = course?.courseOutput;

  return (
    <div className="flex flex-col items-center justify-center mt-20">
      {courseLayout?.chapters?.map((chapter, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="p-4 border border-zinc-700 shadow rounded-xl bg-[#1a1730] text-white">
            <h2 className="text-center text-zinc-400 text-sm">
              Chapter {index + 1}
            </h2>

            <h2 className="font-bold text-lg text-center text-white">
              {chapter.chapterName || chapter.title}
            </h2>

            <h2 className="text-xs flex justify-between gap-16 text-zinc-400">
              <span>Duration: {chapter?.duration}</span>

              <span>No. Of Chapters: {chapter?.topics?.length || 0}</span>
            </h2>
          </div>

          <div>
            {chapter?.topics?.map((topic, topicIndex) => (
              <div className="flex flex-col items-center" key={topicIndex}>
                <div className="h-10 bg-zinc-700 w-1"></div>

                <div className="flex items-center gap-5">
                  <span
                    className={`${
                      topicIndex % 2 == 0 ? "text-transparent" : "text-zinc-300"
                    } max-w-xs text-sm`}
                  >
                    {typeof topic === "object" ? topic?.topic : topic}
                  </span>

                  <h2 className="text-center rounded-full bg-zinc-800 px-6  border border-zinc-600 text-zinc-300 p-4">
                    {topicIndex + 1}
                  </h2>

                  <span
                    className={`${
                      topicIndex % 2 != 0 ? "text-transparent" : "text-zinc-300"
                    } max-w-xs text-sm`}
                  >
                    {typeof topic === "object" ? topic?.topic : topic}
                  </span>
                </div>

                {topicIndex == chapter?.topics?.length - 1 && (
                  <div className="h-10 bg-zinc-700 w-1"></div>
                )}

                {topicIndex == chapter?.topics?.length - 1 && (
                  <div className="flex items-center gap-5">
                    <Gift className="text-center rounded-full bg-zinc-800 border border-zinc-600 h-14 w-14 text-orange-400 p-4" />
                  </div>
                )}

                {topicIndex == chapter?.topics?.length - 1 && (
                  <div className="h-10 bg-zinc-700 w-1"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="p-4 border border-green-700 shadow rounded-xl bg-green-900/40 text-emerald-400 font-bold">
        <h2>Finish</h2>
      </div>
    </div>
  );
}

export default ChapterTopicList;
