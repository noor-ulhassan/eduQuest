import React from "react";
import { Save, Loader2 } from "lucide-react";

export default function SaveBar({ onSave, saving, hasChanges }) {
  return (
    <div className="sticky bottom-0 z-40 bg-[#111]/95 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-end">
      <button
        onClick={onSave}
        disabled={saving}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-white text-xs font-bold transition-all ${
          hasChanges
            ? "bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
            : "bg-white/10 text-zinc-500 cursor-default"
        } disabled:opacity-50`}
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
}
