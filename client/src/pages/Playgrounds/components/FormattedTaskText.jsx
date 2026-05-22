import React from "react";

export default function FormattedTaskText({ text, isMobile = false, className = "" }) {
  if (!text) return null;
  const codeClass = isMobile
    ? "text-red-400 bg-red-500/10 px-1 py-0.5 rounded font-mono"
    : "bg-white/10 text-red-300 px-1.5 py-0.5 rounded font-mono text-sm";
  const parts = text.split(/`([^`]+)`/);
  return (
    <div className={className}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className={codeClass}>{part}</code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </div>
  );
}
