
import React from "react";
import { Button } from "@/components/ui/button";

const EmptyState = ({ message, actionText, onAction, icon = "👋" }) => {
  return (
    <div className="text-center py-8 px-4">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-gray-500 mb-4">{message}</p>
      {actionText && (
        <Button
          onClick={onAction}
          className="w-full sm:w-auto bg-purple-100 text-purple-700 hover:bg-purple-200 border border-purple-300"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;