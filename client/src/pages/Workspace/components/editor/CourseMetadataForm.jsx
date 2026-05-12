import React from "react";

const LANGUAGES = ["javascript", "html", "css", "python", "react", "dsa", "general"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function CourseMetadataForm({ course, onChange }) {
  const update = (field, value) => {
    onChange({ ...course, [field]: value });
  };

  return (
    <div className="space-y-5 p-6">
      <h3 className="text-lg font-bold text-white">Course Settings</h3>

      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Course Name</label>
        <input
          type="text"
          value={course?.name || ""}
          onChange={(e) => update("name", e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Description</label>
        <textarea
          value={course?.description || ""}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Language</label>
          <select
            value={course?.language || "general"}
            onChange={(e) => update("language", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-sm"
          >
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Level</label>
          <select
            value={course?.level || "Beginner"}
            onChange={(e) => update("level", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white focus:outline-none focus:border-indigo-500 text-sm"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Category</label>
          <input
            type="text"
            value={course?.category || ""}
            onChange={(e) => update("category", e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-black/50 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
