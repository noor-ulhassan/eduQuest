import React from "react";
import { Gift } from "lucide-react"; // Make sure to import Gift

function ChapterTopicList({ course }) {
  const courseLayout = course?.courseOutput;

  return (
    <div className="pb-20">
      <h2 className="font-bold text-3xl mt-10">Chapters & Content</h2>

      <div className="flex flex-col items-center justify-center mt-10">
        {courseLayout?.chapters?.map((chapter, index) => (
          <div
            key={index}
            className="flex flex-col items-center w-full max-w-2xl"
          >
            {/* Chapter Header Card */}
            <div className="p-6 border shadow-lg rounded-xl bg-primary text-white w-full">
              <h2 className="text-center opacity-80 uppercase tracking-widest text-sm">
                Chapter {index + 1}
              </h2>

              <h2 className="font-bold text-xl text-center mt-1">
                {/* Changed from chapterName to title */}
                {chapter.title}
              </h2>
            </div>

            {/* Content Connector */}
            <div className="h-10 bg-gray-300 w-1"></div>

            {/* Chapter Content Block */}
            <div className="p-6 border rounded-xl bg-gray-50 text-gray-700 shadow-sm">
              {/* Rendering the long AI content string */}
              <p className="whitespace-pre-line leading-relaxed">
                {chapter.content}
              </p>
            </div>

            {/* Bottom Connector & Gift Icon */}
            <div className="h-10 bg-gray-300 w-1"></div>
            <div className="flex items-center gap-5">
              <Gift className="rounded-full bg-gray-200 h-14 w-14 text-gray-500 p-4" />
            </div>
            <div className="h-10 bg-gray-300 w-1"></div>
          </div>
        ))}

        {/* Final Finish Card */}
        <div className="p-4 px-10 border shadow-lg rounded-xl bg-green-600 text-white font-bold text-xl mt-5">
          <h2>Finish Course</h2>
        </div>
      </div>
    </div>
  );
}

export default ChapterTopicList;
