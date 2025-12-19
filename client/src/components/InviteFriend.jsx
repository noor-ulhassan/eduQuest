import React from "react";
import { Button } from "./ui/button";

function InviteFriend() {
  return (
    <div className="mx-auto mt-10 max-w-xl rounded-2xl border-1 border-black/80 bg-zinc-900 border border-zinc-800
 p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <div className="flex justify-center">
        <img
          src="mail.png"
          alt="mail"
          width={72}
          height={72}
          className="mb-4"
        />
      </div>

      <h2 className="text-center text-3xl font-jersey tracking-wide">
        Invite a Friend
      </h2>

      <p className="mt-2 text-center font-jersey text-base text-gray-700">
        Having fun? Share the love with a friend. Enter their email and we'll
        send them a personal invite.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="email"
          placeholder="Enter invitee email"
          className="w-full rounded-lg border-2 border-black px-4 py-2 font-jersey text-lg outline-none focus:ring-2 focus:ring-black"
        />

        <Button
          variant={"pixel"}
          className="w-full font-jersey text-xl sm:w-auto"
        >
          Invite
        </Button>
      </div>
    </div>
  );
}

export default InviteFriend;
