// import React from "react";
// import { useState } from "react";
// import {
//  Dialog,
//  DialogClose,
//  DialogContent,
//  DialogDescription,
//  DialogFooter,
//  DialogHeader,
//  DialogTitle,
//  DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//  Select,
//  SelectContent,
//  SelectItem,
//  SelectTrigger,
//  SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";
// import { Sparkle } from "lucide-react";
// import axios from "axios";

// function AddCourseDialog({ children }) {
//  const [open, setOpen] = useState(false);
//  const [formData, setFormData] = React.useState({
//   name: "",
//   description: "",
//   noOfChapters: 5,
//   includeVideo: false,
//   level: "beginner",
//   category: "",
//  });

//  const onHandleInputChange = (field, value) => {
//   setFormData((prev) => ({
//    ...prev,
//    [field]: value,
//   }));
//  };

//  const onGenerate = async() => {
//   const res = await axios.post("http://localhost:8080/api/v1/ai/generate-course",formData)

//   if(res?.data){
//    setOpen(false);
//   }
//   console.log("Generated Course:", res.data)
//  };
//  return (
//   {open && <Dialog>
//    <DialogTrigger asChild>{children}</DialogTrigger>
//    <DialogContent>
//     <DialogHeader>
//      <DialogTitle>Create new Course using AI</DialogTitle>
//      <DialogDescription asChild>
//       <div className="flex flex-col gap-4 mt-3">
//        <div>
//         <label>Course Name</label>
//         <Input
//          placeholder="Name"
//          onChange={(event) =>
//           onHandleInputChange("name", event?.target.value)
//          }
//         />
//        </div>
//        <div>
//         <label>Course Description (Optional)</label>
//         <Textarea
//          placeholder="Description"
//          onChange={(event) =>
//           onHandleInputChange("description", event?.target.value)
//          }
//         />
//        </div>
//        <div>
//         <label>No. of Chapters</label>
//         <Input
//          placeholder="No. of Chapters"
//          type="number"
//          onChange={(event) =>
//           onHandleInputChange("noOfChapters", event?.target.value)
//          }
//         />
//        </div>
//        <div className="flex gap-3 items-center">
//         <label>Include Video</label>
//         <Switch
//          onCheckedChange={() =>
//           onHandleInputChange("includeVideo", !formData?.includeVideo)
//          }
//         />
//        </div>
//        <div className="">
//         <label>Difficulty Level</label>
//         <Select
//          onValueChange={(value) => onHandleInputChange("level", value)}
//          className="mt-2"
//         >
//          <SelectTrigger className="w-full">
//           <SelectValue placeholder="Difficulty" />
//          </SelectTrigger>
//          <SelectContent>
//           <SelectItem value="beginner">Beginner</SelectItem>
//           <SelectItem value="intermediate">Intermediate</SelectItem>
//           <SelectItem value="advanced">Advanced</SelectItem>
//          </SelectContent>
//         </Select>
//        </div>
//        <div>
//         <label>Category</label>
//         <Input
//          placeholder="Category (Separated by comma)"
//          onChange={(event) =>
//           onHandleInputChange("category", event?.target.value)
//          }
//         />
//        </div>
//        <div className="mt-5">
//         <Button
//          variant={"pixel"}
//          className="w-full font-jersey text-xl"
//          onClick={onGenerate}
//         >
//          {" "}
//          <Sparkle />
//          Generate
//         </Button>
//        </div>
//       </div>
//      </DialogDescription>
//     </DialogHeader>
//    </DialogContent>
//   </Dialog>
//         }

//  );
// }

// export default AddCourseDialog;

// --------------------`---------------
// Yeh phateek noor bhai ke zimmey

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader, Loader2Icon, Layers } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Change 1: Use useNavigate instead of useRoutes
import api from "@/features/auth/authApi";

function AddCourseDialog({ children, setCourseList, user }) {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    noOfChapters: 5,
    includeVideo: false,
    level: "beginner",
    category: "",
  });

  const navigate = useNavigate(); // Change 2: Initialize navigate
  const [loading, setLoading] = useState(false);

  const onHandleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onGenerate = async () => {
    setLoading(true);
    try {
      // Change 3: Include user data in the request body
      const res = await api.post(
        "http://localhost:8080/api/v1/ai/generate-course",
        {
          ...formData,
        },
      );

      console.log("Generated Course ID:", res.data.courseId);

      setLoading(false);

      if (res.data.success) {
        setOpen(false); // ✅ dialog close
        // Change 4: Use navigate() instead of router.push()
        navigate("/workspace/edit-course/" + res.data.courseId);

        if (setCourseList) {
          setCourseList((prev) => [...prev, res.data.data]);
        }
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="bg-[#121214] border border-zinc-800 text-white rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-white font-black text-xl tracking-tight">
            Create Custom Course
          </DialogTitle>

          <DialogDescription asChild>
            <div className="flex flex-col gap-4 mt-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                  Course Name
                </label>
                <Input
                  placeholder="Name"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500"
                  onChange={(e) => onHandleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                  Course Description *
                </label>
                <Textarea
                  className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500"
                  placeholder="Description"
                  onChange={(e) =>
                    onHandleInputChange("description", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                  No. of Chapters
                </label>
                <Input
                  type="number"
                  className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500"
                  placeholder="No. of Chapters"
                  onChange={(e) =>
                    onHandleInputChange("noOfChapters", Number(e.target.value))
                  }
                />
              </div>

              {/* <div className="flex gap-3 items-center">
        <label>Include Video</label>
        <Switch
         checked={formData.includeVideo}
         onCheckedChange={() =>
          onHandleInputChange("includeVideo", !formData.includeVideo)
         }
        />
       </div> */}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                  Difficulty Level
                </label>
                <Select
                  defaultValue="beginner"
                  onValueChange={(value) => onHandleInputChange("level", value)}
                >
                  <SelectTrigger className="w-full bg-zinc-900 border-zinc-700 text-white">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700 text-white">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1 block">
                  Category
                </label>
                <Input
                  className="bg-zinc-900 border-zinc-700 text-white placeholder-zinc-500"
                  placeholder="Category (comma separated)"
                  onChange={(e) =>
                    onHandleInputChange("category", e.target.value)
                  }
                />
              </div>

              <div className="mt-5">
                <Button
                  variant="pixel"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-full py-2 transition-all"
                  onClick={onGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2Icon className="animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Layers />
                      Create Course
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}

export default AddCourseDialog;
