import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const TYPE_COLORS = {
  text: "bg-blue-500/20 text-blue-300",
  code: "bg-emerald-500/20 text-emerald-300",
  youtube: "bg-red-500/20 text-red-300",
  mermaid: "bg-purple-500/20 text-purple-300",
  "playground-task": "bg-indigo-500/20 text-indigo-300",
  "pro-tip": "bg-amber-500/20 text-amber-300",
  "concept-card": "bg-pink-500/20 text-pink-300",
};

export default function BlockCard({ block, isActive, onDelete, children }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border bg-[#111111] overflow-hidden transition-colors",
        isActive ? "border-indigo-500/50 shadow-lg shadow-indigo-500/10" : "border-white/10",
      )}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 bg-black/30">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-zinc-400 touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
            TYPE_COLORS[block.type] || "bg-white/10 text-zinc-400",
          )}
        >
          {block.type}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => onDelete(block.id)}
          className="text-zinc-600 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Editor content */}
      <div className="p-3">{children}</div>
    </div>
  );
}
