
import React from "react";
import { Button } from "@/components/ui/button";

const EmptyState = ({ message, actionText, onAction, icon = "👋" }) => {
  return (
    <div className="text-center py-8 px-4">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-zinc-500 mb-4 font-medium">{message}</p>
      {actionText && (
        <Button
          onClick={onAction}
          className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border border-white/10 font-bold tracking-wide"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;