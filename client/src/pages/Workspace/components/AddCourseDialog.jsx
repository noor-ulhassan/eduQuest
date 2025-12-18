// import React from "react";
// import { useState } from "react";
// import {
//   Dialog,
//   DialogClose,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch";
// import { Button } from "@/components/ui/button";
// import { Sparkle } from "lucide-react";
// import axios from "axios";

// function AddCourseDialog({ children }) {
//   const [open, setOpen] = useState(false);
//   const [formData, setFormData] = React.useState({
//     name: "",
//     description: "",
//     noOfChapters: 5,
//     includeVideo: false,
//     level: "beginner",
//     category: "",
//   });

//   const onHandleInputChange = (field, value) => {
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   const onGenerate = async() => {
//     const res = await axios.post("http://localhost:8080/api/v1/ai/generate-course",formData)

//     if(res?.data){
//       setOpen(false);
//     }
//     console.log("Generated Course:", res.data)
//   };
//   return (
//     {open && <Dialog>
//       <DialogTrigger asChild>{children}</DialogTrigger>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Create new Course using AI</DialogTitle>
//           <DialogDescription asChild>
//             <div className="flex flex-col gap-4 mt-3">
//               <div>
//                 <label>Course Name</label>
//                 <Input
//                   placeholder="Name"
//                   onChange={(event) =>
//                     onHandleInputChange("name", event?.target.value)
//                   }
//                 />
//               </div>
//               <div>
//                 <label>Course Description (Optional)</label>
//                 <Textarea
//                   placeholder="Description"
//                   onChange={(event) =>
//                     onHandleInputChange("description", event?.target.value)
//                   }
//                 />
//               </div>
//               <div>
//                 <label>No. of Chapters</label>
//                 <Input
//                   placeholder="No. of Chapters"
//                   type="number"
//                   onChange={(event) =>
//                     onHandleInputChange("noOfChapters", event?.target.value)
//                   }
//                 />
//               </div>
//               <div className="flex gap-3 items-center">
//                 <label>Include Video</label>
//                 <Switch
//                   onCheckedChange={() =>
//                     onHandleInputChange("includeVideo", !formData?.includeVideo)
//                   }
//                 />
//               </div>
//               <div className="">
//                 <label>Difficulty Level</label>
//                 <Select
//                   onValueChange={(value) => onHandleInputChange("level", value)}
//                   className="mt-2"
//                 >
//                   <SelectTrigger className="w-full">
//                     <SelectValue placeholder="Difficulty" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="beginner">Beginner</SelectItem>
//                     <SelectItem value="intermediate">Intermediate</SelectItem>
//                     <SelectItem value="advanced">Advanced</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div>
//                 <label>Category</label>
//                 <Input
//                   placeholder="Category (Separated by comma)"
//                   onChange={(event) =>
//                     onHandleInputChange("category", event?.target.value)
//                   }
//                 />
//               </div>
//               <div className="mt-5">
//                 <Button
//                   variant={"pixel"}
//                   className="w-full font-jersey text-xl"
//                   onClick={onGenerate}
//                 >
//                   {" "}
//                   <Sparkle />
//                   Generate
//                 </Button>
//               </div>
//             </div>
//           </DialogDescription>
//         </DialogHeader>
//       </DialogContent>
//     </Dialog>
//                 }

//   );
// }

// export default AddCourseDialog;

//  --------------------`---------------
//  Yeh phateek noor bhai ke zimmey

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
import { Loader, Loader2Icon, Sparkle } from "lucide-react";
import axios from "axios";
import { useRoutes } from "react-router-dom";

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
      // 2. Construct Payload: Combine Form Data with User Data
      // Mapping: User Model -> Course Schema
      const payload = {
        ...formData,
        userEmail: user?.email, // Required by Course Schema
        userName: user?.name, // Optional in Schema, but good to have
        userProfileImage: user?.avatar, // Maps 'avatar' from User model to 'userProfileImage' in Course
      };

      const res = await axios.post(
        "http://localhost:8080/api/v1/ai/generate-course",
        payload
      );

      console.log("Generated Course:", res.data.data.course);
      setLoading(false);

      // Navigate to edit page
      router.push("/workspace/edit-course/" + res.data.data.course._id);

      if (res?.data) {
        setOpen(false);
        setCourseList((prev) => [...prev, res.data.data.course]);
      }
    } catch (error) {
      console.error(error);
      setLoading(false); // Ensure loading stops on error
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 🔹 Trigger */}
      <DialogTrigger asChild>{children}</DialogTrigger>

      {/* 🔹 Dialog Content */}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new Course using AI</DialogTitle>

          <DialogDescription asChild>
            <div className="flex flex-col gap-4 mt-3">
              <div>
                <label>Course Name</label>
                <Input
                  placeholder="Name"
                  onChange={(e) => onHandleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <label>Course Description (Optional)</label>
                <Textarea
                  placeholder="Description"
                  onChange={(e) =>
                    onHandleInputChange("description", e.target.value)
                  }
                />
              </div>

              <div>
                <label>No. of Chapters</label>
                <Input
                  type="number"
                  placeholder="No. of Chapters"
                  onChange={(e) =>
                    onHandleInputChange("noOfChapters", Number(e.target.value))
                  }
                />
              </div>

              <div className="flex gap-3 items-center">
                <label>Include Video</label>
                <Switch
                  checked={formData.includeVideo}
                  onCheckedChange={() =>
                    onHandleInputChange("includeVideo", !formData.includeVideo)
                  }
                />
              </div>

              <div>
                <label>Difficulty Level</label>
                <Select
                  defaultValue="beginner"
                  onValueChange={(value) => onHandleInputChange("level", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label>Category</label>
                <Input
                  placeholder="Category (comma separated)"
                  onChange={(e) =>
                    onHandleInputChange("category", e.target.value)
                  }
                />
              </div>

              <div className="mt-5">
                <Button
                  variant="pixel"
                  className="w-full font-jersey text-xl"
                  onClick={onGenerate}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2Icon className="animate-spin" />
                      Generating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkle />
                      Generate
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
