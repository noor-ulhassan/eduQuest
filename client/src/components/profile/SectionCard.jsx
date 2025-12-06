
import React from "react";

const SectionCard = ({
  title,
  children,
  className = "",
  variant = "light",
}) => {
  const baseClasses = "rounded-xl p-6";

  // Light mode with purple accent
  const lightClasses =
    "bg-white " +
    "border border-purple-200 " + // very soft purple border
    "shadow-sm hover:shadow-[0_4px_12px_rgba(147,51,234,0.1)] " + // purple-tinted shadow
    "transition-shadow duration-200";

  const darkClasses = "bg-gray-800 border border-gray-700";

  const bgClass = variant === "dark" ? darkClasses : lightClasses;
  const titleColor = variant === "dark" ? "text-white" : "text-gray-900";

  return (
    <div className={`${baseClasses} ${bgClass} ${className}`}>
      {title && (
        <h2 className={`font-semibold text-xl mb-4 ${titleColor}`}>{title}</h2>
      )}
      {children}
    </div>
  );
};

export default SectionCard;
