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
      className={`w-full overflow-hidden shadow-lg transition-all duration-300 border-zinc-800/60 bg-[#121214] text-white ${className}`}
    >
      {title && (
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold tracking-tight text-white">
            {title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "pt-0" : "pt-6"}>{children}</CardContent>
    </Card>
  );
};

export default SectionCard;
