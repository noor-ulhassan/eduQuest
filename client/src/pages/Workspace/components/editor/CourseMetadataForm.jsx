import React, { useEffect, useState } from "react";
import { Gamepad2 } from "lucide-react";
import { getCurriculumsMetadata } from "@/features/playground/playgroundApi";

const LANGUAGES = ["javascript", "html", "css", "python", "react", "general"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export default function CourseMetadataForm({ course, onChange }) {
  const update = (field, value) => onChange({ ...course, [field]: value });
  const [availablePlaygrounds, setAvailablePlaygrounds] = useState([]);

  useEffect(() => {
    getCurriculumsMetadata()
      .then((res) => setAvailablePlaygrounds((res.metadata || []).map((m) => m.language)))
      .catch(() => {});
  }, []);

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
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
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

      {/* Linked Playground */}
      <div className="border border-indigo-500/20 rounded-xl p-4 bg-indigo-950/20">
        <label className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-2">
          <Gamepad2 className="w-3.5 h-3.5" /> Linked Playground <span className="text-indigo-600 font-normal normal-case">(optional)</span>
        </label>
        <p className="text-[11px] text-zinc-500 mb-3">
          Link a language playground to this course. In each chapter you can then pick specific problems from that playground to show as practice activities.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => update("linkedPlayground", null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              !course?.linkedPlayground
                ? "bg-zinc-700 text-white border-zinc-500"
                : "border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300"
            }`}
          >
            None
          </button>
          {availablePlaygrounds.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => update("linkedPlayground", lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${
                course?.linkedPlayground === lang
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-500/20"
                  : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
              }`}
            >
              {lang}
            </button>
          ))}
          {availablePlaygrounds.length === 0 && (
            <p className="text-xs text-zinc-600 py-1">No playgrounds created yet. Go to Admin → Curriculum to create one.</p>
          )}
        </div>
      </div>
    </div>
  );
}
