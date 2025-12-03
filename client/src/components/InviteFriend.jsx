import React from "react";
import { Button } from "./ui/button";

function InviteFriend() {
  return (
    <div className="flex flex-col items-center mt-8 p-4 border-4 rounded-xl">
      <img src="mail.png" alt="mail" width={80} height={80} />
      <h2 className="text-3xl font-jersey">Invite Friend</h2>
      <p className="font-jersey">
        Having Fun ? Share the Love with a Friend ! Enter an Email and we will
        send them personal invite
      </p>
      <div className="flex gap-2 items-center mt-5">
        <input
          type="email"
          placeholder="Enter Invitee email"
          className="min-w-md border-black"
        />
        <Button variant={"pixel"} className="font-jersey text-xl">
          Invite
        </Button>
      </div>
    </div>
  );
}

export default InviteFriend;
