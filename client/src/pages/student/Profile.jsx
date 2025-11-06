import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import React from "react";
import { Label } from "@radix-ui/react-dropdown-menu";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Course from "./Course";

const Profile = () => {
  const isLoading = false;
  const enrolledCourses = [1, 2, 3];
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 sm:pt-28 md:pt-32 pb-12">
      <h1 className="font-bold text-2xl text-center md:text-left mb-6 md:mb-8">
        Profile
      </h1>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 md:gap-10">
        <div className="flex flex-col items-center">
          <Avatar className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 mb-4 rounded-full">
            <AvatarImage
              src="https://github.com/shadcn.png"
              alt="@shadcn"
              className="h-full w-full rounded-full object-cover"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-col items-center md:items-start w-full max-w-sm sm:max-w-md">
          <div className="flex items-center mb-2 justify-center md:justify-start">
            <h1 className="font-semibold text-gray-900 ml-0 md:ml-2 text-base sm:text-lg whitespace-normal sm:whitespace-nowrap">
              Noor ul Hassan
            </h1>
          </div>
          <div className="flex items-center mb-2 justify-center md:justify-start">
            <h1 className="font-normal text-gray-800 ml-0 md:ml-2 text-sm sm:text-base whitespace-normal sm:whitespace-nowrap">
              noor@gmail.com
            </h1>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <h1 className="font-normal text-gray-800 ml-0 md:ml-2 text-sm sm:text-base whitespace-normal sm:whitespace-nowrap">
              Student
            </h1>
          </div>

          <Dialog>
            <form className="w-full">
              <DialogTrigger asChild>
                <Button
                  className="bg-black text-white mt-4 w-full sm:w-auto px-3 py-2 text-sm sm:px-4 sm:py-2 sm:text-base"
                  variant="outline"
                >
                  Edit
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] w-[90%]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your profile here. Click save when
                    you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="name-1">Name</Label>
                    <Input id="name-1" name="name" placeholder="Name" />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="username-1">Profile Pic</Label>
                    <Input type="file" accept="image/*" />
                  </div>
                </div>
                <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-3">
                  <DialogClose asChild>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    disabled={isLoading}
                    type="submit"
                    className="w-full sm:w-auto order-1 sm:order-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Please wait
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>
      <div>
        <h1 className="font-medium text-lg mt-7">Courses you're Enrolled in</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 my-5">
          {enrolledCourses.length === 0 ? (
            <h1>You haven't Enrolled yet</h1>
          ) : (
            enrolledCourses.map((course, index) => <Course key={index} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
