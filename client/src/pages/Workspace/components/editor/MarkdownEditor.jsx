import { useState } from "react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import "@uiw/react-md-editor/markdown-editor.css";

const TOOLBAR = [
  commands.bold,
  commands.italic,
  commands.divider,
  commands.title,
  commands.link,
  commands.quote,
  commands.divider,
  commands.code,
  commands.codeBlock,
  commands.divider,
  commands.unorderedListCommand,
  commands.orderedListCommand,
];

export default function MarkdownEditor({ value, onChange, height = 280 }) {
  const [mode, setMode] = useState("write");

  return (
    <div data-color-mode="dark">
      {/* Write / Preview toggle — GitHub style */}
      <div className="flex items-center gap-1 mb-1.5">
        {[["write", "Write"], ["preview", "Preview"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setMode(val)}
            className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
              mode === val
                ? "bg-white/[0.07] text-white border-white/15"
                : "text-zinc-500 border-transparent hover:text-zinc-300"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <MDEditor
        value={value}
        onChange={(val) => onChange(val ?? "")}
        height={height}
        preview={mode === "write" ? "edit" : "preview"}
        hideToolbar={mode === "preview"}
        visibleDragbar={false}
        extraCommands={[]}
        commands={TOOLBAR}
      />
    </div>
  );
}
