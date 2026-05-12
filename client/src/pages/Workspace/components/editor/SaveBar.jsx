import React from "react";
import { Save, Globe, Loader2 } from "lucide-react";

export default function SaveBar({ onSave, onPublish, saving, isPublished, hasChanges }) {
  return (
    <div className="sticky bottom-0 z-40 bg-[#111]/95 backdrop-blur-xl border-t border-white/10 px-6 py-3 flex items-center justify-between">
      <div className="text-xs text-zinc-500">
        {hasChanges ? (
          <span className="text-yellow-400">Unsaved changes</span>
        ) : (
          "All changes saved"
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onPublish}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-colors border ${
            isPublished
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          {isPublished ? "Unpublish" : "Publish"}
        </button>
        <button
          onClick={onSave}
          disabled={saving || !hasChanges}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
