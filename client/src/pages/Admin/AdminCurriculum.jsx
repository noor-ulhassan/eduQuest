import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getCurriculum, addProblem, updateProblem, deleteProblem } from "../../features/playground/playgroundApi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  BookOpen, Code, Edit3, Plus, Trash2, Save, X, Settings, 
  ChevronDown, ChevronRight, Terminal, Layers, Star 
} from "lucide-react";

const LANGUAGES = ["javascript", "html", "css", "python", "react", "dsa"];

const AdminCurriculum = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [curriculum, setCurriculum] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedChapter, setExpandedChapter] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [targetChapterId, setTargetChapterId] = useState(null);

  const fetchCurriculum = async (lang) => {
    setIsLoading(true);
    try {
      const res = await getCurriculum(lang);
      if (res.success) setCurriculum(res.curriculum);
      else setCurriculum(null);
    } catch (error) {
      console.error(error);
      setCurriculum(null);
      toast.error("Failed to load curriculum");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurriculum(selectedLanguage);
  }, [selectedLanguage]);

  const handleOpenModal = (chapterId, problem = null) => {
    setTargetChapterId(chapterId);
    if (problem) {
      setEditingProblem({ ...problem });
    } else {
      setEditingProblem({
        id: `prob_${Date.now()}`,
        title: "",
        difficulty: "Easy",
        xp: 10,
        description: "",
        starterCode: "",
        hints: [""],
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveProblem = async () => {
    if (!editingProblem.title || !editingProblem.id) {
      toast.error("Title and ID are required");
      return;
    }

    try {
      // Clean up hints array (remove empty strings)
      const cleanedProblem = {
        ...editingProblem,
        hints: editingProblem.hints.filter(h => h.trim() !== "")
      };

      if (curriculum.chapters.some(ch => ch.problems.some(p => p.id === editingProblem.id)) && targetChapterId === null) {
        // It's an update (targetChapterId is null when editing an existing problem from the UI where we already know it exists)
        // Wait, I actually pass chapterId even on edit.
      }

      // To simplify, check if it's new or existing based on whether we are creating or updating
      const isUpdating = curriculum.chapters.some(ch => ch.problems.some(p => p.id === editingProblem.id));

      if (isUpdating) {
        await updateProblem(selectedLanguage, editingProblem.id, cleanedProblem);
        toast.success("Problem updated!");
      } else {
        await addProblem(selectedLanguage, targetChapterId, cleanedProblem);
        toast.success("Problem added!");
      }
      setIsModalOpen(false);
      fetchCurriculum(selectedLanguage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to save problem");
    }
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await deleteProblem(selectedLanguage, problemId);
      toast.success("Problem deleted!");
      fetchCurriculum(selectedLanguage);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete problem");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-24 text-white font-sans">
      
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <Settings className="text-indigo-500 w-10 h-10" />
              Curriculum Manager
            </h1>
            <p className="text-zinc-400 mt-2">Create and manage playground problems, chapters, and languages.</p>
          </div>
          
          <div className="flex gap-2 p-1 bg-[#111111] border border-white/10 rounded-xl overflow-x-auto">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={`px-4 py-2 rounded-lg font-bold text-sm capitalize whitespace-nowrap transition-all ${
                  selectedLanguage === lang 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !curriculum ? (
          <div className="h-64 flex items-center justify-center border border-dashed border-white/10 rounded-2xl bg-[#111] text-zinc-500">
            No curriculum found for {selectedLanguage}.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-[#111] border border-white/10 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{curriculum.title}</h2>
                <p className="text-zinc-400">{curriculum.subtitle}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-black text-indigo-400">{curriculum.chapters.length}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500">Chapters</div>
              </div>
            </div>

            <div className="space-y-4">
              {curriculum.chapters.map((chapter) => (
                <div key={chapter.id} className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                  <button 
                    onClick={() => setExpandedChapter(expandedChapter === chapter.id ? null : chapter.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <Layers size={20} />
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-lg">{chapter.title}</h3>
                        <p className="text-sm text-zinc-500">{chapter.problems.length} problems</p>
                      </div>
                    </div>
                    {expandedChapter === chapter.id ? <ChevronDown className="text-zinc-500" /> : <ChevronRight className="text-zinc-500" />}
                  </button>

                  <AnimatePresence>
                    {expandedChapter === chapter.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-[#0a0a0a]"
                      >
                        <div className="p-4 space-y-3">
                          {chapter.problems.map(prob => (
                            <div key={prob.id} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-[#111] hover:border-white/10 transition-all group">
                              <div className="flex items-center gap-4">
                                <div className={`px-2 py-1 text-xs font-bold uppercase rounded border ${
                                  prob.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                  prob.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                  prob.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                  'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                }`}>
                                  {prob.difficulty}
                                </div>
                                <div>
                                  <div className="font-bold">{prob.title}</div>
                                  <div className="text-xs text-zinc-500">{prob.xp} XP • ID: {prob.id}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => handleOpenModal(chapter.id, prob)}
                                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-300 transition-colors"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteProblem(prob.id)}
                                  className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                          
                          <button 
                            onClick={() => handleOpenModal(chapter.id)}
                            className="w-full p-4 rounded-xl border border-dashed border-white/20 text-zinc-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-bold text-sm"
                          >
                            <Plus size={18} /> Add New Problem
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isModalOpen && editingProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#111] border border-white/10 rounded-2xl shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Code className="text-indigo-400" />
                {editingProblem.title ? "Edit Problem" : "New Problem"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full text-zinc-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Problem ID</label>
                  <input 
                    type="text" 
                    value={editingProblem.id}
                    onChange={(e) => setEditingProblem({...editingProblem, id: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                    placeholder="e.g., js_basics_1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Title</label>
                  <input 
                    type="text" 
                    value={editingProblem.title}
                    onChange={(e) => setEditingProblem({...editingProblem, title: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                    placeholder="Problem Title"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Difficulty</label>
                  <select 
                    value={editingProblem.difficulty}
                    onChange={(e) => setEditingProblem({...editingProblem, difficulty: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">XP Reward</label>
                  <input 
                    type="number" 
                    value={editingProblem.xp}
                    onChange={(e) => setEditingProblem({...editingProblem, xp: Number(e.target.value)})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Description (Markdown / Backticks)</label>
                <textarea 
                  value={editingProblem.description}
                  onChange={(e) => setEditingProblem({...editingProblem, description: e.target.value})}
                  className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 min-h-[120px]"
                  placeholder="Explain the problem here..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Starter Code</label>
                  <textarea 
                    value={typeof editingProblem.starterCode === 'object' ? JSON.stringify(editingProblem.starterCode, null, 2) : editingProblem.starterCode || ""}
                    onChange={(e) => setEditingProblem({...editingProblem, starterCode: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-emerald-400 font-mono text-sm focus:outline-none focus:border-indigo-500 min-h-[200px]"
                    placeholder="function example() { ... }"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center justify-between">
                    <span>Test Function / Validation Logic</span>
                    <span className="text-[10px] text-zinc-600 normal-case font-normal">(Used to grade user code)</span>
                  </label>
                  <textarea 
                    value={editingProblem.testFunction || ""}
                    onChange={(e) => setEditingProblem({...editingProblem, testFunction: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-yellow-400 font-mono text-sm focus:outline-none focus:border-indigo-500 min-h-[200px]"
                    placeholder="function(code) { return {success: true, message: 'Great!'} }"
                  />
                </div>
              </div>

              {(selectedLanguage === "css" || selectedLanguage === "html") && (
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2 flex items-center justify-between">
                    <span>Base HTML</span>
                    <span className="text-[10px] text-zinc-600 normal-case font-normal">(Injected into the iframe preview)</span>
                  </label>
                  <textarea 
                    value={editingProblem.baseHtml || ""}
                    onChange={(e) => setEditingProblem({...editingProblem, baseHtml: e.target.value})}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-3 text-orange-400 font-mono text-sm focus:outline-none focus:border-indigo-500 min-h-[120px]"
                    placeholder="<div id='box'></div>"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Hints</label>
                {editingProblem.hints.map((hint, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input 
                      type="text" 
                      value={hint}
                      onChange={(e) => {
                        const newHints = [...editingProblem.hints];
                        newHints[i] = e.target.value;
                        setEditingProblem({...editingProblem, hints: newHints});
                      }}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500"
                      placeholder={`Hint ${i + 1}`}
                    />
                    <button 
                      onClick={() => {
                        const newHints = editingProblem.hints.filter((_, idx) => idx !== i);
                        setEditingProblem({...editingProblem, hints: newHints});
                      }}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-400"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => setEditingProblem({...editingProblem, hints: [...editingProblem.hints, ""]})}
                  className="text-sm font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2"
                >
                  <Plus size={16} /> Add Hint
                </button>
              </div>

            </div>

            <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-lg font-bold text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveProblem}
                className="px-6 py-2.5 rounded-lg font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
              >
                <Save size={16} /> Save Problem
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default AdminCurriculum;
