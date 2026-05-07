import React from "react";
import { Button } from "../ui/button";

function InviteFriend() {
  return (
    <div
      className="mx-auto mt-10 max-w-xl rounded-2xl border border-white/10 
      bg-[#111111] p-6 shadow-lg shadow-black/50"
    >
      <div className="flex justify-center">
        <img
          src="mail.png"
          alt="mail"
          width={72}
          height={72}
          className="mb-4 opacity-90"
        />
      </div>

      <h2 className="text-center text-3xl text-white font-jersey tracking-wide">
        Invite a Friend
      </h2>

      <p className="mt-2 text-center font-jersey text-base text-zinc-400">
        Having fun? Share the love with a friend. Enter their email and we'll
        send them a personal invite.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="email"
          placeholder="Enter invitee email"
          className="w-full rounded-lg border border-white/10 bg-[#1a1a1a] 
          px-4 py-2 font-jersey text-lg text-white placeholder-zinc-600 
          outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-colors"
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
