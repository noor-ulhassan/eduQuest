// src/components/profile/EmptyState.jsx
import React from "react";
import { Button } from "@/components/ui/button";

const EmptyState = ({ message, actionText, onAction, icon = "👋" }) => {
  return (
    <div className="text-center py-8 px-4">
      <div className="text-4xl mb-4">{icon}</div>
      <p className="text-gray-500 mb-4">{message}</p>
      {actionText && (
        <Button variant="outline" onClick={onAction} className="w-full sm:w-auto">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;