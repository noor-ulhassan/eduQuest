import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlayCircle, CheckCircle2, BookOpen, Play } from "lucide-react";

function ChapterSidebar({
  course,
  enrollment,
  selectedChapter,
  setSelectedChapter,
  selectedTopic,
  setSelectedTopic,
}) {
  const chapters = course?.courseOutput?.chapters || [];

  const isCompleted = (chapterName) => {
    return enrollment?.completedChapters?.includes(chapterName);
  };

  return (
    <div className="p-5 pt-20 bg-white h-full">
      <h2 className="font-bold text-lg mb-5 line-clamp-2 px-2">
        {course?.name}
      </h2>
      <hr className="mb-5" />

      <Accordion
        type="single"
        collapsible
        defaultValue="item-0"
        className="w-full space-y-3"
      >
        {chapters.map((chapter, index) => {
          const completed = isCompleted(chapter?.chapterName);
          const active = selectedChapter === index;

          return (
            <AccordionItem
              value={`item-${index}`}
              key={index}
              className={`border rounded-xl px-2 overflow-hidden transition-all duration-300 ${
                completed
                  ? "bg-green-50 border-green-200"
                  : "bg-white border-zinc-200"
              } ${active && !completed ? "border-yellow-400 shadow-sm" : ""}`}
            >
              <AccordionTrigger
                onClick={() => setSelectedChapter(index)}
                className={`hover:no-underline p-3 rounded-lg transition-all ${
                  completed
                    ? "text-green-700"
                    : active
                    ? "text-yellow-600"
                    : "text-gray-600"
                }`}
              >
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-3 text-left">
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-green-600" />
                    ) : (
                      <PlayCircle
                        className={`w-5 h-5 flex-shrink-0 ${
                          active ? "text-yellow-600" : "text-gray-400"
                        }`}
                      />
                    )}
                    <span className={`text-sm font-bold leading-tight`}>
                      {chapter?.chapterName}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>

              <AccordionContent className="pt-1 pb-3 px-4">
                <div
                  className={`flex flex-col gap-1 border-l-2 ml-2 pl-4 ${
                    completed ? "border-green-200" : "border-zinc-100"
                  }`}
                >
                  {chapter?.topics?.map((topic, i) => {
                    const topicActive = active && selectedTopic === i;

                    return (
                      <div
                        key={i}
                        onClick={() => setSelectedTopic(i)}
                        className={`flex items-center justify-between gap-2 text-xs py-2 px-2 rounded-md cursor-pointer transition-colors ${
                          topicActive
                            ? completed
                              ? "bg-green-200 text-green-900 font-bold"
                              : "bg-yellow-100 text-yellow-700 font-bold"
                            : completed
                            ? "text-green-600 hover:bg-green-100"
                            : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen
                            className={`w-3 h-3 ${
                              topicActive
                                ? completed
                                  ? "text-green-700"
                                  : "text-yellow-600"
                                : completed
                                ? "text-green-400"
                                : "text-zinc-400"
                            }`}
                          />
                          <span>
                            {typeof topic === "object" ? topic.topic : topic}
                          </span>
                        </div>
                        {topicActive && (
                          <Play
                            className={`w-3 h-3 fill-current ${
                              completed ? "text-green-700" : "text-yellow-700"
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

export default ChapterSidebar;
