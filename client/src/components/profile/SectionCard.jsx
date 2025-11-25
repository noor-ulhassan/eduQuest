// src/components/profile/SectionCard.jsx
import React from "react";

const SectionCard = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm ${className}`}>
      {title && <h2 className="font-semibold text-xl mb-4">{title}</h2>}
      {children}
    </div>
  );
};

export default SectionCard;