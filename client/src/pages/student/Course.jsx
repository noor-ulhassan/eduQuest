// import { Card, CardContent } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
// import { Badge, BadgeCheckIcon } from "lucide-react";
// import React from "react";

// const Course = () => {
//   return (
//     <Card className="overflow-hidden rounded-lg bg-white shadow-md hover:shadow-xl hover:scale-105 hover:-translate-y-1 transition-all duration-300 w-full max-w-sm mx-auto">
//       {/* Image section */}
//       <div className="relative">
//         <img
//           src="https://img-c.udemycdn.com/course/750x422/3873464_403c_3.jpg"
//           alt="Course"
//           className="w-full h-36 object-cover rounded-t-lg"
//         />
//       </div>
//       <CardContent className="px-5 py-4 space-y-3">
//         <h1 className="hover:underline font-bold text-lg truncate">
//           Nextjs Complete Course in English 2025
//         </h1>
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3">
//             <Avatar className="h-6 w-6 rounded-full">
//               <AvatarImage
//                 src="https://github.com/shadcn.png"
//                 alt="@shadcn"
//                 className="h-full w-full rounded-full object-cover"
//               />
//               <AvatarFallback>CN</AvatarFallback>
//             </Avatar>
//             <h1 className="font-medium text-sm">Noor</h1>
//           </div>
//           <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
//             Advanced
//           </span>
//         </div>
//         <div className="text-lg font-bold">
//           <span>$9.99</span>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default Course;
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { Star } from "lucide-react";

const Course = () => {
  return (
    <Card className="group overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl w-full max-w-sm mx-auto">
     
      <div className="relative overflow-hidden">
        <img
          src="https://img-c.udemycdn.com/course/750x422/3873464_403c_3.jpg"
          alt="Next.js course"
          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <span className="absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
          Advanced
        </span>
      </div>

      <CardContent className="space-y-4 p-5">
        <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-yellow-600 transition-colors">
          Next.js Complete Course in English (2025)
        </h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-7 w-7 rounded-full">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt="Instructor"
                className="rounded-full object-cover"
              />
              <AvatarFallback>N</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">Noor</span>
          </div>

          
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 stroke-yellow-400" />
            <span className="font-medium">4.8</span>
          </div>
        </div>

      
        <div className="flex items-center justify-between pt-2">
          <span className="text-xl font-bold text-gray-900">$9.99</span>
          <button className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-yellow-700 active:scale-95">
            Enroll now
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Course;
