import React from "react";
import WelcomeBanner from "../../components/WelcomeBanner";
import EnrolledCourses from "@/components/EnrolledCourses";
import ExploreMore from "@/components/ExploreMore";
import UserStatus from "@/components/UserStatus";
import InviteFriend from "@/components/InviteFriend";

const MyLearning = () => {
  return (
    <div className="p-10 md:px-20 lg:px-32 xl:px-48 mt-24">
      <div className="grid grid-cols-3 gap-7">
        <div className="col-span-2">
          <WelcomeBanner />
          <EnrolledCourses />
          <ExploreMore />
          <InviteFriend />
        </div>
        <div>
          <UserStatus />
        </div>
      </div>
    </div>
  );
};

export default MyLearning;
