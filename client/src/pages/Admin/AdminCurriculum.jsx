import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  getCurriculum,
  getCurriculumsMetadata,
  createCurriculum,
  deleteCurriculum,
  updateCurriculumSettings,
  addChapter,
  updateChapter,
  deleteChapter,
  addProblem,
  updateProblem,
  deleteProblem,
  generateProblems,
} from "../../features/playground/playgroundApi";
import { getAdminCourses } from "../../features/workspace/courseApi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Code, Edit3, Plus, Trash2, Save, X, Settings,
  ChevronDown, ChevronRight, Layers, Link, Sparkles,
  Loader2, BookOpen, PenLine,
} from "lucide-react";

const LANG_LABEL = (lang) => lang.charAt(0).toUpperCase() + lang.slice(1);

const EXECUTION_MODES = [
  { value: "piston",      label: "Code Runner",    desc: "Python, Java, C++, Go, Rust, TS… Output printed to terminal." },
  { value: "livepreview", label: "Live Preview",   desc: "HTML / CSS — renders inside a browser iframe with live updates." },
  { value: "react",       label: "React Preview",  desc: "React/JSX — iframe with Babel + ReactDOM. Full component preview." },
];

// Full Tailwind class strings (no template interpolation — JIT needs literal strings)
const MODE_BADGE = {
  piston:      "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  livepreview: "text-sky-400 bg-sky-500/10 border-sky-500/30",
  react:       "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
};
const MODE_ACTIVE = {
  piston:      "border-emerald-500/50 bg-emerald-500/15 text-emerald-400",
  livepreview: "border-sky-500/50 bg-sky-500/15 text-sky-400",
  react:       "border-cyan-500/50 bg-cyan-500/15 text-cyan-400",
};
const MODE_CARD_ACTIVE = {
  piston:      "border-emerald-500/60 bg-emerald-500/10",
  livepreview: "border-sky-500/60 bg-sky-500/10",
  react:       "border-cyan-500/60 bg-cyan-500/10",
};
const MODE_LABEL = {
  piston:      "text-emerald-400",
  livepreview: "text-sky-400",
  react:       "text-cyan-400",
};

const inputCls = "w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 text-sm";

// ── Problem Modal ─────────────────────────────────────────────────────────────
function ProblemModal({ problem: init, language, chapterId, onClose, onSaved, courses }) {
  const [p, setP] = useState({
    courseChapterLink: { courseId: null, chapterIndex: null },
    hints: [""],
    ...init,
  });
  const [saving, setSaving] = useState(false);
  const isEdit = !!init._isEdit;

  const set = (k, v) => setP((prev) => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!p.title?.trim() || !p.id?.trim()) { toast.error("ID and title required"); return; }
    setSaving(true);
    try {
      const payload = { ...p, hints: (p.hints || []).filter((h) => h.trim()) };
      if (isEdit) {
        await updateProblem(language, p.id, payload);
        toast.success("Problem updated");
      } else {
        await addProblem(language, chapterId, payload);
        toast.success("Problem added");
      }
      onSaved();
      onClose();
    } catch { toast.error("Failed to save problem"); }
    finally { setSaving(false); }
  };

  const linkedCourse = courses.find((c) => c.courseId === p.courseChapterLink?.courseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Code className="text-indigo-400 w-5 h-5" />
            {isEdit ? "Edit Problem" : "New Problem"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-zinc-400"><X size={18} /></button>
        </div>

        <div className="space-y-5">
          {/* ID + Title */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Problem ID</label>
              <input className={inputCls} value={p.id || ""} onChange={(e) => set("id", e.target.value)} placeholder="e.g. js_vars_1" disabled={isEdit} />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Title</label>
              <input className={inputCls} value={p.title || ""} onChange={(e) => set("title", e.target.value)} placeholder="Problem Title" />
            </div>
          </div>

          {/* Difficulty + XP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Difficulty</label>
              <select className={inputCls} value={p.difficulty || "Easy"} onChange={(e) => set("difficulty", e.target.value)}>
                {["Easy", "Medium", "Hard", "Expert"].map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">XP Reward</label>
              <input type="number" className={inputCls} value={p.xp || 10} onChange={(e) => set("xp", Number(e.target.value))} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Description</label>
            <textarea className={`${inputCls} min-h-[100px] resize-y`} value={p.description || ""} onChange={(e) => set("description", e.target.value)} placeholder="Explain the task…" />
          </div>

          {/* Starter Code */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Starter Code</label>
            <textarea
              className={`${inputCls} min-h-[120px] resize-y font-mono text-emerald-400`}
              value={typeof p.starterCode === "string" ? p.starterCode : ""}
              onChange={(e) => set("starterCode", e.target.value)}
              placeholder="// starter code shown to the student"
            />
          </div>

          {/* Test Function */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5 flex items-center justify-between">
              <span>Test Function / Grading Logic</span>
              {["html", "css", "react"].includes(language) && (
                <span className="text-[9px] text-zinc-600 normal-case">iframe JS: return {"{"} success, message {"}"}</span>
              )}
              {["javascript", "python"].includes(language) && (
                <span className="text-[9px] text-zinc-600 normal-case">appended to code: print JSON line {"{"}"success":true{","}"message":"..."{"}"}</span>
              )}
            </label>
            <textarea className={`${inputCls} min-h-[120px] resize-y font-mono text-yellow-400`} value={p.testFunction || ""} onChange={(e) => set("testFunction", e.target.value)} placeholder="Grading logic…" />
          </div>

          {/* Base HTML — only for HTML/CSS */}
          {(language === "css" || language === "html") && (
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Base HTML <span className="text-zinc-600 normal-case font-normal">(injected into iframe)</span></label>
              <textarea className={`${inputCls} min-h-[80px] resize-y font-mono text-orange-400`} value={p.baseHtml || ""} onChange={(e) => set("baseHtml", e.target.value)} placeholder="<div id='box'></div>" />
            </div>
          )}

          {/* Course Chapter Link */}
          <div className="border border-indigo-500/20 rounded-xl p-4 bg-indigo-950/20">
            <label className="block text-[10px] font-bold text-indigo-400 uppercase mb-3 flex items-center gap-2">
              <Link size={11} /> Link to Course Chapter <span className="text-indigo-600 normal-case font-normal">(optional — shows problem in that chapter's Practice section)</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Course</label>
                <select
                  className={inputCls}
                  value={p.courseChapterLink?.courseId || ""}
                  onChange={(e) => set("courseChapterLink", { courseId: e.target.value || null, chapterIndex: null })}
                >
                  <option value="">No link</option>
                  {courses.map((c) => <option key={c.courseId} value={c.courseId}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Chapter</label>
                <select
                  className={inputCls}
                  value={p.courseChapterLink?.chapterIndex ?? ""}
                  disabled={!p.courseChapterLink?.courseId}
                  onChange={(e) => set("courseChapterLink", { ...p.courseChapterLink, chapterIndex: e.target.value === "" ? null : Number(e.target.value) })}
                >
                  <option value="">Select chapter</option>
                  {(linkedCourse?.courseOutput?.chapters || []).map((ch, i) => (
                    <option key={i} value={i}>Ch {i + 1}: {ch.chapterName || ch.title || `Chapter ${i + 1}`}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Hints */}
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Hints</label>
            <div className="space-y-2">
              {(p.hints || []).map((h, i) => (
                <div key={i} className="flex gap-2">
                  <input className={`${inputCls} flex-1`} value={h} onChange={(e) => { const nh = [...p.hints]; nh[i] = e.target.value; set("hints", nh); }} placeholder={`Hint ${i + 1}`} />
                  <button onClick={() => set("hints", p.hints.filter((_, idx) => idx !== i))} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 shrink-0"><X size={14} /></button>
                </div>
              ))}
              <button onClick={() => set("hints", [...(p.hints || []), ""])} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1">
                <Plus size={14} /> Add Hint
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-5 border-t border-white/10">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="px-5 py-2.5 rounded-lg font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 disabled:opacity-50 transition-all">
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {isEdit ? "Update" : "Add Problem"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Chapter Row ───────────────────────────────────────────────────────────────
function ChapterRow({ chapter, language, expanded, onToggle, onEdit, onDelete, onAddProblem, onEditProblem, onDeleteProblem, onGenerate, courses, generating }) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      <div className="w-full px-5 py-4 flex items-center justify-between hover:bg-white/5 transition-colors">
        <button onClick={onToggle} className="flex items-center gap-4 flex-1 text-left">
          <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
            <Layers size={18} />
          </div>
          <div>
            <h3 className="font-bold text-base">{chapter.title}</h3>
            <p className="text-xs text-zinc-500">{chapter.problems.length} problems{chapter.description ? ` · ${chapter.description}` : ""}</p>
          </div>
          {expanded ? <ChevronDown className="text-zinc-500 ml-2 w-4 h-4" /> : <ChevronRight className="text-zinc-500 ml-2 w-4 h-4" />}
        </button>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onGenerate}
            disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 rounded-lg transition-colors disabled:opacity-50"
            title="Generate problems with AI"
          >
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            AI Generate
          </button>
          <button onClick={onEdit} className="p-2 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors" title="Rename chapter"><PenLine size={14} /></button>
          <button onClick={onDelete} className="p-2 hover:bg-red-500/10 rounded-lg text-zinc-600 hover:text-red-400 transition-colors" title="Delete chapter"><Trash2 size={14} /></button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/5 bg-[#0a0a0a]"
          >
            <div className="p-4 space-y-2">
              {chapter.problems.length === 0 && (
                <p className="text-xs text-zinc-600 text-center py-3">No problems yet. Add one manually or use AI Generate.</p>
              )}
              {chapter.problems.map((prob) => {
                const linked = prob.courseChapterLink?.courseId;
                const linkedCourseName = linked ? courses.find((c) => c.courseId === linked)?.name : null;
                return (
                  <div key={prob.id} className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#111] hover:border-white/10 transition-all group">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border shrink-0 ${
                        prob.difficulty === "Easy" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        prob.difficulty === "Medium" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                        prob.difficulty === "Hard" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}>{prob.difficulty}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-white truncate">{prob.title}</p>
                        <p className="text-xs text-zinc-600">
                          {prob.xp} XP · {prob.id}
                          {linkedCourseName && (
                            <span className="ml-2 text-indigo-400">· linked → {linkedCourseName} Ch {prob.courseChapterLink.chapterIndex + 1}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => onEditProblem(prob)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300"><Edit3 size={14} /></button>
                      <button onClick={() => onDeleteProblem(prob.id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })}

              <button
                onClick={onAddProblem}
                className="w-full p-3 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-bold text-sm"
              >
                <Plus size={16} /> Add Problem
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const AdminCurriculum = () => {
  const queryClient = useQueryClient();
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [curriculum, setCurriculum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState(null);
  const [courses, setCourses] = useState([]);
  const [existingLanguages, setExistingLanguages] = useState([]);

  // Problem modal
  const [problemModal, setProblemModal] = useState(null);

  // Chapter modal
  const [chapterModal, setChapterModal] = useState(null);
  const [chapterForm, setChapterForm] = useState({ title: "", description: "" });
  const [savingChapter, setSavingChapter] = useState(false);

  // AI generate
  const [generatingChapterId, setGeneratingChapterId] = useState(null);
  const [generateCount, setGenerateCount] = useState(3);

  // Create curriculum modal
  const [createModal, setCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ language: "", title: "", subtitle: "", executionMode: "piston", pistonLanguage: "" });
  const [creatingCurriculum, setCreatingCurriculum] = useState(false);

  // Execution mode edit
  const [modeEditOpen, setModeEditOpen] = useState(false);
  const [savingMode, setSavingMode] = useState(false);
  const [pistonLangEdit, setPistonLangEdit] = useState("");

  // Load metadata (all existing playgrounds) + courses
  useEffect(() => {
    getAdminCourses().then((d) => setCourses(d || [])).catch(() => {});
    getCurriculumsMetadata()
      .then((res) => {
        const langs = (res.metadata || []).map((m) => m.language);
        setExistingLanguages(langs);
        if (langs.length > 0) setSelectedLanguage(langs[0]);
        else setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const fetchCurriculum = async (lang) => {
    setIsLoading(true);
    queryClient.invalidateQueries({ queryKey: ["curriculum", lang] });
    try {
      const res = await getCurriculum(lang);
      setCurriculum(res.curriculum || null);
    } catch { setCurriculum(null); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCurriculum(selectedLanguage); }, [selectedLanguage]);

  // ── Curriculum create ──
  const handleCreateCurriculum = async () => {
    const lang = createForm.language.trim().toLowerCase();
    if (!lang) { toast.error("Enter a language name"); return; }
    if (!createForm.title.trim()) { toast.error("Title required"); return; }
    setCreatingCurriculum(true);
    try {
      await createCurriculum({ language: lang, title: createForm.title, subtitle: createForm.subtitle, executionMode: createForm.executionMode, pistonLanguage: createForm.pistonLanguage?.trim() || null });
      toast.success("Playground created!");
      setExistingLanguages((prev) => prev.includes(lang) ? prev : [...prev, lang]);
      setCreateModal(false);
      setCreateForm({ language: "", title: "", subtitle: "" });
      setSelectedLanguage(lang);
    } catch (e) { toast.error(e?.response?.data?.message || "Failed to create playground"); }
    finally { setCreatingCurriculum(false); }
  };

  // ── Chapter save ──
  const handleSaveChapter = async () => {
    if (!chapterForm.title.trim()) { toast.error("Title required"); return; }
    setSavingChapter(true);
    try {
      if (chapterModal.mode === "add") {
        await addChapter(selectedLanguage, chapterForm);
        toast.success("Chapter added");
      } else {
        await updateChapter(selectedLanguage, chapterModal.chapter.id, chapterForm);
        toast.success("Chapter updated");
      }
      setChapterModal(null);
      fetchCurriculum(selectedLanguage);
    } catch { toast.error("Failed to save chapter"); }
    finally { setSavingChapter(false); }
  };

  const handleDeleteChapter = async (chapterId, chapterTitle) => {
    if (!window.confirm(`Delete chapter "${chapterTitle}" and all its problems?`)) return;
    try {
      await deleteChapter(selectedLanguage, chapterId);
      toast.success("Chapter deleted");
      fetchCurriculum(selectedLanguage);
    } catch { toast.error("Failed to delete chapter"); }
  };

  // ── Problem delete ──
  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Delete this problem?")) return;
    try {
      await deleteProblem(selectedLanguage, problemId);
      toast.success("Problem deleted");
      fetchCurriculum(selectedLanguage);
    } catch { toast.error("Failed to delete problem"); }
  };

  // ── AI Generate ──
  const handleGenerate = async (chapter) => {
    setGeneratingChapterId(chapter.id);
    try {
      await generateProblems(selectedLanguage, chapter.id, { chapterTitle: chapter.title, count: generateCount });
      toast.success(`${generateCount} problems generated!`);
      fetchCurriculum(selectedLanguage);
    } catch { toast.error("AI generation failed"); }
    finally { setGeneratingChapterId(null); }
  };

  // ── Execution mode change ──
  const handleSaveMode = async (newMode) => {
    setSavingMode(true);
    try {
      const res = await updateCurriculumSettings(selectedLanguage, { executionMode: newMode });
      setCurriculum(res.curriculum);
      toast.success("Execution mode updated");
      setModeEditOpen(false);
    } catch { toast.error("Failed to update mode"); }
    finally { setSavingMode(false); }
  };

  const handleSavePistonLang = async () => {
    setSavingMode(true);
    try {
      const res = await updateCurriculumSettings(selectedLanguage, { pistonLanguage: pistonLangEdit.trim() || null });
      setCurriculum(res.curriculum);
      toast.success("Piston language ID updated");
      setModeEditOpen(false);
    } catch { toast.error("Failed to update"); }
    finally { setSavingMode(false); }
  };

  // ── Curriculum delete ──
  const handleDeleteCurriculum = async () => {
    if (!window.confirm(`Delete the entire ${LANG_LABEL(selectedLanguage)} playground and all its chapters/problems? This cannot be undone.`)) return;
    try {
      await deleteCurriculum(selectedLanguage);
      queryClient.invalidateQueries({ queryKey: ["curriculum", selectedLanguage] });
      queryClient.invalidateQueries({ queryKey: ["curriculum", "metadata"] });
      toast.success(`${LANG_LABEL(selectedLanguage)} playground deleted`);
      const remaining = existingLanguages.filter((l) => l !== selectedLanguage);
      setExistingLanguages(remaining);
      setSelectedLanguage(remaining[0] || null);
      setCurriculum(null);
    } catch { toast.error("Failed to delete playground"); }
  };


  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24 text-white font-sans">

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <Settings className="text-indigo-500 w-8 h-8" />
              Playground Manager
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">Manage language playgrounds. Optionally link problems to course chapters.</p>
          </div>

          <div className="flex flex-col gap-3 items-end">
            <div className="flex items-center gap-3">
              {/* AI count selector */}
              <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#111] border border-white/10 rounded-lg px-3 py-2">
                <Sparkles size={11} className="text-indigo-400" />
                <span>AI:</span>
                <select
                  value={generateCount}
                  onChange={(e) => setGenerateCount(Number(e.target.value))}
                  className="bg-transparent text-white text-xs focus:outline-none"
                >
                  {[1, 2, 3, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
                <span>problems/chapter</span>
              </div>

              {/* New Playground button — always visible */}
              <button
                onClick={() => { setCreateForm({ language: "", title: "", subtitle: "", executionMode: "piston", pistonLanguage: "" }); setCreateModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors whitespace-nowrap"
              >
                <Plus size={15} /> New Playground
              </button>
            </div>

            {/* Language tabs — one per existing playground */}
            {existingLanguages.length > 0 && (
              <div className="flex gap-1 p-1 bg-[#111111] border border-white/10 rounded-xl overflow-x-auto max-w-[600px]">
                {existingLanguages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-sm capitalize whitespace-nowrap transition-all ${
                      selectedLanguage === lang
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {LANG_LABEL(lang)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <Loader2 className="w-8 h-8 border-indigo-500 animate-spin text-indigo-500" />
          </div>
        ) : !curriculum ? (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-white/10 rounded-2xl gap-4">
            <BookOpen className="w-10 h-10 text-zinc-600" />
            <div className="text-center">
              {existingLanguages.length === 0 ? (
                <>
                  <p className="font-bold text-zinc-300">No playgrounds yet</p>
                  <p className="text-sm text-zinc-500 mt-1">Click <span className="text-indigo-400 font-bold">New Playground</span> to create your first one.</p>
                </>
              ) : (
                <>
                  <p className="font-bold text-zinc-300">No {LANG_LABEL(selectedLanguage)} playground</p>
                  <p className="text-sm text-zinc-500 mt-1">Click <span className="text-indigo-400 font-bold">New Playground</span> in the top-right to create one.</p>
                </>
              )}
            </div>
            <button
              onClick={() => { setCreateForm({ language: selectedLanguage || "", title: "", subtitle: "" }); setCreateModal(true); }}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors"
            >
              <Plus size={14} /> New Playground
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Curriculum header */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{curriculum.title}</h2>
                {curriculum.subtitle && <p className="text-sm text-zinc-400 mt-0.5">{curriculum.subtitle}</p>}
                {/* Execution mode badge + change */}
                <div className="mt-2 flex items-center gap-2">
                  {!modeEditOpen ? (
                    <>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${MODE_BADGE[curriculum.executionMode] || MODE_BADGE.piston}`}>
                        {EXECUTION_MODES.find(m => m.value === (curriculum.executionMode || "piston"))?.label || curriculum.executionMode || "piston"}
                      </span>
                      {curriculum.pistonLanguage && (
                        <span className="text-[10px] text-zinc-500 font-mono">id: {curriculum.pistonLanguage}</span>
                      )}
                      <button onClick={() => { setModeEditOpen(true); setPistonLangEdit(curriculum.pistonLanguage || ""); }} className="text-[10px] text-zinc-500 hover:text-zinc-300 underline transition-colors">change mode</button>
                    </>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {EXECUTION_MODES.map((m) => (
                          <button
                            key={m.value}
                            disabled={savingMode}
                            onClick={() => handleSaveMode(m.value)}
                            className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all disabled:opacity-50 ${
                              (curriculum.executionMode || "piston") === m.value
                                ? MODE_ACTIVE[m.value]
                                : "border-white/10 text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                            }`}
                          >
                            {savingMode ? <Loader2 size={10} className="animate-spin inline mr-1" /> : null}{m.label}
                          </button>
                        ))}
                        <button onClick={() => setModeEditOpen(false)} className="text-[10px] text-zinc-600 hover:text-zinc-400 ml-1">cancel</button>
                      </div>
                      {/* Piston Language ID override */}
                      {(curriculum.executionMode === "piston" || !curriculum.executionMode) && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500">Piston ID:</span>
                          <input
                            className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2.5 py-1 text-white text-[10px] font-mono focus:outline-none focus:border-indigo-500 w-36"
                            value={pistonLangEdit}
                            onChange={(e) => setPistonLangEdit(e.target.value)}
                            placeholder={`e.g. c++, csharp`}
                          />
                          <button onClick={handleSavePistonLang} disabled={savingMode} className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-indigo-500/30 text-indigo-400 hover:border-indigo-500/50 disabled:opacity-50 transition-colors flex items-center gap-1">
                            {savingMode ? <Loader2 size={10} className="animate-spin" /> : <Save size={10} />} Save
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-400">{curriculum.chapters.length}</div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Chapters</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-indigo-400">
                    {curriculum.chapters.reduce((s, c) => s + c.problems.length, 0)}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Problems</div>
                </div>
                <button
                  onClick={handleDeleteCurriculum}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-bold text-sm rounded-xl border border-red-500/20 transition-colors"
                  title={`Delete ${LANG_LABEL(selectedLanguage)} playground`}
                >
                  <Trash2 size={15} /> Delete Playground
                </button>
                <button
                  onClick={() => { setChapterForm({ title: "", description: "" }); setChapterModal({ mode: "add" }); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-colors"
                >
                  <Plus size={15} /> Add Chapter
                </button>
              </div>
            </div>

            {/* Chapters */}
            <div className="space-y-3">
              {curriculum.chapters.length === 0 && (
                <div className="text-center py-12 text-zinc-500 text-sm border border-dashed border-white/10 rounded-2xl">
                  No chapters yet. Click "Add Chapter" to get started.
                </div>
              )}
              {curriculum.chapters.map((chapter) => (
                <ChapterRow
                  key={chapter.id}
                  chapter={chapter}
                  language={selectedLanguage}
                  expanded={expandedChapter === chapter.id}
                  onToggle={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                  onEdit={() => { setChapterForm({ title: chapter.title, description: chapter.description || "" }); setChapterModal({ mode: "edit", chapter }); }}
                  onDelete={() => handleDeleteChapter(chapter.id, chapter.title)}
                  onAddProblem={() => setProblemModal({ chapterId: chapter.id, problem: { id: `prob_${Date.now()}`, title: "", difficulty: "Easy", xp: 10, description: "", starterCode: "", hints: [""] } })}
                  onEditProblem={(prob) => setProblemModal({ chapterId: chapter.id, problem: { ...prob, _isEdit: true, courseChapterLink: prob.courseChapterLink || { courseId: null, chapterIndex: null } } })}
                  onDeleteProblem={handleDeleteProblem}
                  onGenerate={() => handleGenerate(chapter)}
                  courses={courses}
                  generating={generatingChapterId === chapter.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chapter modal */}
      {chapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{chapterModal.mode === "add" ? "Add Chapter" : "Rename Chapter"}</h3>
              <button onClick={() => setChapterModal(null)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Chapter Title</label>
                <input className={inputCls} value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} placeholder="e.g. Variables & Data Types" autoFocus />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Description (optional)</label>
                <input className={inputCls} value={chapterForm.description} onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })} placeholder="Short description…" />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setChapterModal(null)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-bold">Cancel</button>
              <button onClick={handleSaveChapter} disabled={savingChapter} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors">
                {savingChapter ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                {chapterModal.mode === "add" ? "Add Chapter" : "Save"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Problem modal */}
      {problemModal && (
        <ProblemModal
          problem={problemModal.problem}
          language={selectedLanguage}
          chapterId={problemModal.chapterId}
          onClose={() => setProblemModal(null)}
          onSaved={() => fetchCurriculum(selectedLanguage)}
          courses={courses}
        />
      )}

      {/* Create Playground modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Plus className="text-indigo-400 w-5 h-5" /> New Playground
              </h3>
              <button onClick={() => setCreateModal(false)} className="text-zinc-500 hover:text-white"><X size={18} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Language Name</label>
                <input
                  className={inputCls}
                  value={createForm.language}
                  onChange={(e) => setCreateForm((f) => ({ ...f, language: e.target.value }))}
                  placeholder="e.g. java, typescript, rust, kotlin…"
                  autoFocus
                />
                {/* Quick-pick suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["typescript", "java", "rust", "kotlin", "go", "c++", "swift"].filter(
                    (l) => !existingLanguages.includes(l)
                  ).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setCreateForm((f) => ({ ...f, language: lang }))}
                      className="px-2.5 py-1 text-xs font-bold rounded-lg border border-white/10 text-zinc-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                {existingLanguages.includes(createForm.language.trim().toLowerCase()) && createForm.language.trim() && (
                  <p className="text-xs text-amber-400 mt-1.5">⚠ A playground for this language already exists. Creating will fail — delete the existing one first.</p>
                )}
              </div>

              {/* Piston Language ID override — only for code runner modes */}
              {createForm.executionMode === "piston" && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">
                    Piston Language ID <span className="text-zinc-600 normal-case font-normal">(optional — only if name differs)</span>
                  </label>
                  <input
                    className={inputCls}
                    value={createForm.pistonLanguage}
                    onChange={(e) => setCreateForm((f) => ({ ...f, pistonLanguage: e.target.value }))}
                    placeholder={`Leave blank to use "${createForm.language || "language name"}" · or set e.g. c++, csharp, typescript`}
                  />
                  <p className="text-[10px] text-zinc-600 mt-1">
                    Supported IDs: javascript · python · java · c++ · c · typescript · go · rust · kotlin · swift · ruby · php · csharp · bash · r · lua · perl · haskell · scala · dart
                  </p>
                </div>
              )}
              {/* Execution Mode */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">Execution Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  {EXECUTION_MODES.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setCreateForm((f) => ({ ...f, executionMode: m.value }))}
                      className={`text-left p-3 rounded-xl border transition-all ${
                        createForm.executionMode === m.value
                          ? MODE_CARD_ACTIVE[m.value]
                          : "border-white/10 bg-white/3 hover:border-white/15"
                      }`}
                    >
                      <p className={`text-xs font-bold mb-0.5 ${createForm.executionMode === m.value ? MODE_LABEL[m.value] : "text-zinc-300"}`}>{m.label}</p>
                      <p className="text-[10px] text-zinc-500 leading-tight">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Title</label>
                <input
                  className={inputCls}
                  value={createForm.title}
                  onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder={createForm.language ? `${LANG_LABEL(createForm.language)} Programming` : "e.g. Python Programming"}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Subtitle (optional)</label>
                <input
                  className={inputCls}
                  value={createForm.subtitle}
                  onChange={(e) => setCreateForm((f) => ({ ...f, subtitle: e.target.value }))}
                  placeholder="Beginner to Advanced"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button onClick={() => setCreateModal(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg font-bold transition-colors">Cancel</button>
                <button
                  onClick={handleCreateCurriculum}
                  disabled={creatingCurriculum || !createForm.language.trim()}
                  className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {creatingCurriculum ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                  Create Playground
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCurriculum;
