import { Button } from "@/components/ui/button";
import api from "@/features/auth/authApi";
import { Book, Clock, TrendingUp } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { MultiStepLoader } from "@/components/ui/multi-step-loader";

export default function CourseInfo({ course }) {
 const courseLayout = course?.courseOutput;
 const [loading, setLoading] = React.useState(false);
 const [currentGenIndex, setCurrentGenIndex] = React.useState(0);
 const navigate = useNavigate();

 // Build loading states dynamically from chapters
 const chapters = courseLayout?.chapters || [];
 const loadingStates = [
  ...chapters.map((ch, i) => ({
   text: `Generating content for Chapter ${i + 1}: ${ch.chapterName}`,
  })),
  { text: "Finalizing your course..." },
 ];

 const GenerateCourseContent = async () => {
  setLoading(true);
  setCurrentGenIndex(0);
  try {
   for (let index = 0; index < chapters.length; index++) {
    setCurrentGenIndex(index);
    console.log(`Generating content for chapter: ${index + 1}`);

    await api.post(
     "http://localhost:8080/api/v1/ai/generate-chapter-content",
     {
      courseId: course?.courseId,
      chapter: chapters[index],
      index: index,
     },
    );
   }

   // Show finalizing step briefly
   setCurrentGenIndex(chapters.length);
   await new Promise((r) => setTimeout(r, 1500));

   navigate(`/workspace`);
  } catch (error) {
   console.error("Error generating course content:", error);
  } finally {
   setLoading(false);
   setCurrentGenIndex(0);
  }
 };

 return (
  <>
   {/* Multi-Step Loader Overlay */}
   <MultiStepLoader
    loadingStates={loadingStates}
    loading={loading}
    duration={999999}
    loop={false}
    value={currentGenIndex}
   />

   <div className="md:flex gap-5 justify-between p-5 rounded-2xl shadow-2xl">
    <div className="flex flex-col gap-3">
     <h2 className="font-bold text-3xl">{course?.name}</h2>

     <p className="line-clamp-4 text-gray-500">
      {courseLayout?.description}
     </p>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
      <div className="flex gap-4 items-center p-3 rounded-lg shadow">
       <Clock className="text-yellow-400" />
       <section>
        <h2 className="font-bold">Duration</h2>

        <h2>{courseLayout?.chapters?.[0]?.duration || "2 Hours"}</h2>
       </section>
      </div>
      <div className="flex gap-4 items-center p-3 rounded-lg shadow">
       <Book className="text-green-400" />
       <section>
        <h2 className="font-bold">Chapters</h2>
        <h2>{course?.noOfChapters}</h2>
       </section>
      </div>
      <div className="flex gap-4 items-center p-3 rounded-lg shadow">
       <TrendingUp className="text-red-400" />
       <section>
        <h2 className="font-bold">Difficulty</h2>
        <h2>{course?.level}</h2>
       </section>
      </div>
     </div>
     <Button
      variant={"pixel"}
      className="mt-4 font-jersey text-xl"
      onClick={GenerateCourseContent}
      disabled={loading}
     >
      {loading ? "Generating..." : "Generate Content"}
     </Button>
    </div>
    <img
     src="/machine.webp"
     alt=""
     width={400}
     height={400}
     className="w-full mt-5 md:mt-0 object-cover aspect-auto h-[240px] rounded-2xl"
    />
   </div>
  </>
 );
}
