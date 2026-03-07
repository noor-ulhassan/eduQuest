import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const SectionCard = ({
  title,
  children,
  className = "",
  variant = "light",
}) => {
  return (
    <Card
      className={`w-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border-zinc-200 dark:border-zinc-800 ${variant === "dark" ? "bg-zinc-950 text-white" : "bg-white dark:bg-zinc-950"} ${className}`}
    >
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "pt-6"}>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
