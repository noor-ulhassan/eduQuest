import React from "react";
import WelcomeBanner from "../../components/user/WelcomeBanner";
import EnrolledCourses from "@/components/user/EnrolledCourses";
import ExploreMore from "@/components/user/ExploreMore";
import UserStatus from "@/components/user/UserStatus";
import InviteFriend from "@/components/user/InviteFriend";

const MyLearning = () => {
  return (
    <div className="p-4 sm:p-6 md:p-10 lg:px-20 xl:px-32 mt-14 sm:mt-20 md:mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-7">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 md:space-y-7">
          <WelcomeBanner />
          <EnrolledCourses />
          <ExploreMore />
          <InviteFriend />
        </div>
        <div className="lg:col-span-1">
          <UserStatus />
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
