import React from "react";
import { Plus, Trash2 } from "lucide-react";

export default function KeyConceptsEditor({ concepts, onChange }) {
  const update = (idx, field, value) => {
    const updated = [...concepts];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const add = () => {
    onChange([...concepts, { title: "", description: "", icon: "star" }]);
  };

  const remove = (idx) => {
    onChange(concepts.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Key Concepts</label>
        <button
          onClick={add}
          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/10 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>

      {concepts.map((concept, idx) => (
        <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
          <div className="flex-1 space-y-1.5">
            <input
              type="text"
              value={concept.title || ""}
              onChange={(e) => update(idx, "title", e.target.value)}
              placeholder="Title"
              className="w-full px-2 py-1 rounded bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={concept.description || ""}
              onChange={(e) => update(idx, "description", e.target.value)}
              placeholder="Description"
              className="w-full px-2 py-1 rounded bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={concept.icon || ""}
              onChange={(e) => update(idx, "icon", e.target.value)}
              placeholder="Icon (material symbol)"
              className="w-full px-2 py-1 rounded bg-black/50 border border-white/10 text-zinc-400 text-[10px] focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={() => remove(idx)}
            className="p-1 rounded hover:bg-red-500/20 text-zinc-600 hover:text-red-400 transition-colors shrink-0 mt-1"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
