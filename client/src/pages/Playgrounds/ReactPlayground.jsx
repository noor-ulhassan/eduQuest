import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import Editor from "@monaco-editor/react";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { updateUserStats } from "../../features/auth/authSlice";
import {
  getPlaygroundProgress,
  enrollInPlayground,
  completeProblem as completeProb,
} from "../../features/playground/playgroundApi";
import { PLAYGROUND_DATA } from "../../data/playground";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Play,
  RotateCcw,
  Loader2,
  Lightbulb,
  FileCode2,
  FolderOpen,
  Folder,
  BookOpen,
  Terminal,
  AlertCircle,
  X,
  LayoutGrid,
  Maximize2,
} from "lucide-react";

// ─── Build the sandboxed React iframe document ─────────────────────────────
const buildReactDoc = (userCode) => `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin><\/script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin><\/script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Inter,system-ui,sans-serif;background:#fff;color:#1a1a1a;padding:16px;min-height:100vh}
  button{cursor:pointer}
  .done{text-decoration:line-through;color:#6b7280}
  .error{color:#e53e3e}
</style>
</head><body>
<div id="root"></div>
<script>const{useState,useEffect,useRef,useCallback,useMemo,useReducer}=React;<\/script>
<script type="text/babel">
${userCode}
try{ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));}
catch(e){document.getElementById("root").innerHTML='<div style="color:#e53e3e;background:#fff5f5;border:1px solid #fed7d7;border-radius:6px;padding:12px;font-family:monospace;font-size:12px;white-space:pre-wrap"><b>⚠ Render Error</b>\\n'+e.message+'</div>';}
<\/script>
<script>
window.__runTest__=function(fnStr){try{var r=new Function("win","doc",fnStr)(window,document);window.parent.postMessage({type:"TEST_RESULT",success:r.success,message:r.message},"*");}catch(e){window.parent.postMessage({type:"TEST_RESULT",success:false,message:"Test error: "+e.message},"*");}};
window.addEventListener("message",function(e){if(e.data&&e.data.type==="RUN_TEST")window.__runTest__(e.data.fn);});
setTimeout(function(){window.parent.postMessage({type:"IFRAME_READY"},"*");},200);
<\/script>
</body></html>`;

const data = PLAYGROUND_DATA["react"];
const totalProblems = data.chapters.reduce(
  (s, ch) => s + ch.problems.length,
  0,
);

// ─── Difficulty badge ───────────────────────────────────────────────────────
const DiffBadge = ({ d }) => {
  const cls =
    d === "Easy"
      ? "text-emerald-400 bg-emerald-500/10"
      : d === "Medium"
        ? "text-amber-400 bg-amber-500/10"
        : "text-red-400 bg-red-500/10";
  return (
    <span
      className={cn(
        "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
        cls,
      )}
    >
      {d}
    </span>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────
const ReactPlayground = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const [currentProblem, setCurrentProblem] = useState(null);
  const [code, setCode] = useState("");
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [completedProblems, setCompletedProblems] = useState(new Set());
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [bottomTab, setBottomTab] = useState("problems"); // "problems" | "output"
  const [openChapters, setOpenChapters] = useState(
    new Set([data.chapters[0]?.id]),
  );
  const [showHints, setShowHints] = useState(false);
  const [previewExpanded, setPreviewExpanded] = useState(false);

  // Debounced code for live preview
  const [liveCode, setLiveCode] = useState("");
  const debounceRef = useRef(null);

  const iframeRef = useRef(null);
  const pendingTestRef = useRef(null);
  const currentProblemRef = useRef(null);

  useEffect(() => {
    currentProblemRef.current = currentProblem;
  }, [currentProblem]);

  // ── Load progress / check enrollment ──────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      if (!user) {
        setIsLoadingProgress(false);
        return;
      }
      try {
        const { progress } = await getPlaygroundProgress();
        const cur = progress.find((p) => p.language === "react");
        if (!cur) {
          // not enrolled — enroll automatically
          await enrollInPlayground("react");
          toast.success("Enrolled in React Playground!");
        } else {
          const done = new Set(cur.completedProblems);
          setCompletedProblems(done);
          // open first chapter with unsolved problems
          for (const ch of data.chapters) {
            if (ch.problems.some((p) => !done.has(p.id))) {
              setOpenChapters(new Set([ch.id]));
              const firstUnsolved = ch.problems.find((p) => !done.has(p.id));
              if (firstUnsolved) selectProblem(firstUnsolved);
              break;
            }
          }
        }
      } catch (e) {
        console.error("[ReactPlayground] init error:", e);
      } finally {
        setIsLoadingProgress(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Set first problem as default
  useEffect(() => {
    if (!currentProblem && data.chapters[0]?.problems[0]) {
      selectProblem(data.chapters[0].problems[0]);
    }
  }, []);

  // ── Debounce live preview ──────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setLiveCode(code), 600);
    return () => clearTimeout(debounceRef.current);
  }, [code]);

  useEffect(() => {
    if (iframeRef.current && currentProblem) {
      iframeRef.current.srcdoc = buildReactDoc(
        liveCode || currentProblem.starterCode,
      );
    }
  }, [liveCode, currentProblem]);

  // ── postMessage bridge ─────────────────────────────────────────────────────
  useEffect(() => {
    const handler = async (e) => {
      if (!e.data?.type) return;
      if (e.data.type === "IFRAME_READY" && pendingTestRef.current) {
        const fn = pendingTestRef.current;
        pendingTestRef.current = null;
        setTimeout(() => {
          iframeRef.current?.contentWindow?.postMessage(
            { type: "RUN_TEST", fn },
            "*",
          );
        }, 150);
      }
      if (e.data.type === "TEST_RESULT") {
        const result = e.data;
        setTestResult(result);
        setIsRunning(false);
        setBottomTab("output");
        const prob = currentProblemRef.current;
        if (result.success && prob) {
          try {
            const res = await completeProb("react", prob.id, prob.xp);
            if (!res.alreadyCompleted) {
              dispatch(updateUserStats(res.user));
              toast.success(`${result.message} +${prob.xp} XP!`);
              confetti({ particleCount: 130, spread: 80, origin: { y: 0.7 } });
            } else {
              toast.success("Solved! (XP already earned)");
            }
            setCompletedProblems((prev) => new Set([...prev, prob.id]));
          } catch {
            toast.error("Tests passed but failed to save progress");
          }
        } else if (!result.success) {
          toast.error(result.message || "Tests failed");
        }
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [dispatch]);

  // ── Select problem ─────────────────────────────────────────────────────────
  const selectProblem = useCallback((prob) => {
    setCurrentProblem(prob);
    setCode(prob.starterCode);
    setLiveCode(prob.starterCode);
    setTestResult(null);
    setShowHints(false);
    setBottomTab("problems");
  }, []);

  // ── Run code / tests ───────────────────────────────────────────────────────
  const handleRunCode = useCallback(() => {
    if (isRunning || !currentProblem) return;
    setIsRunning(true);
    setTestResult(null);
    pendingTestRef.current = currentProblem.testFunction;
    if (iframeRef.current) {
      iframeRef.current.srcdoc = buildReactDoc(code);
    }
  }, [code, currentProblem, isRunning]);

  const resetCode = useCallback(() => {
    if (currentProblem) {
      setCode(currentProblem.starterCode);
      setTestResult(null);
    }
  }, [currentProblem]);

  // Ctrl+Enter shortcut
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRunCode();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleRunCode]);

  const completedCount = completedProblems.size;
  const progressPct = Math.round((completedCount / totalProblems) * 100);

  if (isLoadingProgress) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#1e1e1e]">
        <Loader2 className="h-8 w-8 animate-spin text-[#007acc]" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-[#d4d4d4] overflow-hidden select-none font-['Segoe_UI',system-ui,sans-serif]">
      {/* ── TITLE BAR ── */}
      <div className="h-9 bg-[#323233] flex items-center justify-between px-4 shrink-0 border-b border-[#3c3c3c]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-[#cccccc] text-xs ml-3 font-medium">
            React Playground — EduQuest
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-[#858585]">
          <span>
            {completedCount}/{totalProblems} solved
          </span>
          <div className="w-24 h-1.5 bg-[#3c3c3c] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-[#007acc] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span>{progressPct}%</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── ACTIVITY BAR ── */}
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 gap-1 shrink-0 border-r border-[#3c3c3c]">
          {[
            {
              icon: <LayoutGrid className="h-5 w-5" />,
              id: "explorer",
              label: "Explorer",
            },
            {
              icon: <BookOpen className="h-5 w-5" />,
              id: "problem",
              label: "Problem",
            },
          ].map(({ icon, id, label }) => (
            <button
              key={id}
              title={label}
              className={cn(
                "w-10 h-10 flex items-center justify-center rounded transition-colors",
                "text-[#858585] hover:text-[#d4d4d4] hover:bg-[#3c3c3c]",
              )}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* ── EXPLORER SIDEBAR ── */}
        <div className="w-60 bg-[#252526] flex flex-col shrink-0 border-r border-[#3c3c3c] overflow-hidden">
          <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-[#bbbbbb] border-b border-[#3c3c3c] shrink-0">
            Explorer
          </div>

          {/* Project root */}
          <div className="px-2 py-1 text-[12px] font-semibold text-[#cccccc] border-b border-[#3c3c3c] shrink-0 flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5 text-[#e8c07d]" />
            REACT-PLAYGROUND
          </div>

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#424242]">
            {data.chapters.map((ch, chIdx) => {
              const isOpen = openChapters.has(ch.id);
              const chDone = ch.problems.filter((p) =>
                completedProblems.has(p.id),
              ).length;
              return (
                <div key={ch.id}>
                  {/* Chapter folder */}
                  <button
                    className="w-full flex items-center gap-1 px-2 py-1 hover:bg-[#2a2d2e] text-left"
                    onClick={() => {
                      const next = new Set(openChapters);
                      isOpen ? next.delete(ch.id) : next.add(ch.id);
                      setOpenChapters(next);
                    }}
                  >
                    {isOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 text-[#858585] shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-[#858585] shrink-0" />
                    )}
                    {isOpen ? (
                      <FolderOpen className="h-3.5 w-3.5 text-[#e8c07d] shrink-0" />
                    ) : (
                      <Folder className="h-3.5 w-3.5 text-[#e8c07d] shrink-0" />
                    )}
                    <span className="text-[12px] text-[#cccccc] truncate flex-1">
                      {ch.title}
                    </span>
                    <span className="text-[10px] text-[#858585] shrink-0">
                      {chDone}/{ch.problems.length}
                    </span>
                  </button>

                  {/* Problem files */}
                  {isOpen &&
                    ch.problems.map((prob) => {
                      const isActive = currentProblem?.id === prob.id;
                      const isDone = completedProblems.has(prob.id);
                      return (
                        <button
                          key={prob.id}
                          onClick={() => selectProblem(prob)}
                          className={cn(
                            "w-full flex items-center gap-1.5 pl-8 pr-2 py-0.5 text-left transition-colors",
                            isActive
                              ? "bg-[#37373d] text-[#ffffff]"
                              : "hover:bg-[#2a2d2e] text-[#a0a0a0] hover:text-[#d4d4d4]",
                          )}
                        >
                          {isDone ? (
                            <CheckCircle className="h-3 w-3 text-emerald-400 shrink-0" />
                          ) : (
                            <FileCode2 className="h-3 w-3 text-[#519aba] shrink-0" />
                          )}
                          <span className="text-[12px] truncate flex-1">
                            {prob.title}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] shrink-0",
                              prob.difficulty === "Easy"
                                ? "text-emerald-500"
                                : prob.difficulty === "Medium"
                                  ? "text-amber-500"
                                  : "text-red-500",
                            )}
                          >
                            {prob.difficulty[0]}
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── EDITOR + PREVIEW ── */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* LEFT: Editor column */}
          <Panel
            defaultSize={55}
            minSize={30}
            className="flex flex-col overflow-hidden"
          >
            {/* Tab bar */}
            <div className="h-9 bg-[#2d2d2d] flex items-end shrink-0 border-b border-[#3c3c3c]">
              <div className="flex items-stretch h-full">
                <div className="flex items-center gap-2 px-4 bg-[#1e1e1e] border-t-2 border-t-[#007acc] border-r border-[#3c3c3c] text-[13px] text-[#ffffff]">
                  <FileCode2 className="h-3.5 w-3.5 text-[#519aba]" />
                  App.jsx
                </div>
                <div className="flex items-center gap-2 px-4 text-[13px] text-[#858585] hover:text-[#d4d4d4] hover:bg-[#2a2d2e] cursor-pointer border-r border-[#3c3c3c]">
                  <FileCode2 className="h-3.5 w-3.5 text-[#858585]" />
                  index.jsx
                </div>
              </div>

              {/* Top-right actions */}
              <div className="ml-auto flex items-center gap-1 px-2 h-full">
                <button
                  onClick={resetCode}
                  title="Reset to starter code"
                  className="h-7 w-7 flex items-center justify-center rounded text-[#858585] hover:text-[#d4d4d4] hover:bg-[#3c3c3c] transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  title="Run Tests (Ctrl+Enter)"
                  className="h-7 flex items-center gap-1.5 px-3 rounded text-[12px] font-medium bg-[#0e639c] hover:bg-[#1177bb] text-white transition-colors disabled:opacity-40"
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Running
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 fill-current" />
                      Run Tests
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Editor + bottom panel */}
            <PanelGroup direction="vertical" className="flex-1">
              <Panel defaultSize={62} minSize={25}>
                <Editor
                  height="100%"
                  language="javascript"
                  value={code}
                  onChange={(v) => setCode(v || "")}
                  theme="vs-dark"
                  options={{
                    fontSize: 14,
                    lineNumbers: "on",
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    padding: { top: 12 },
                    fontFamily:
                      "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                    renderLineHighlight: "all",
                    bracketPairColorization: { enabled: true },
                    cursorBlinking: "smooth",
                    smoothScrolling: true,
                    wordWrap: "on",
                    glyphMargin: false,
                  }}
                />
              </Panel>

              <PanelResizeHandle className="h-1 bg-[#3c3c3c] hover:bg-[#007acc] transition-colors cursor-row-resize" />

              {/* ── BOTTOM PANEL (Problems / Output) ── */}
              <Panel defaultSize={38} minSize={15}>
                <div className="h-full flex flex-col bg-[#1e1e1e] border-t border-[#3c3c3c]">
                  {/* Panel tabs */}
                  <div className="h-8 bg-[#252526] flex items-end shrink-0 border-b border-[#3c3c3c]">
                    {[
                      {
                        id: "problems",
                        label: "PROBLEMS",
                        icon: <BookOpen className="h-3 w-3" />,
                      },
                      {
                        id: "output",
                        label: "OUTPUT",
                        icon: <Terminal className="h-3 w-3" />,
                      },
                    ].map(({ id, label, icon }) => (
                      <button
                        key={id}
                        onClick={() => setBottomTab(id)}
                        className={cn(
                          "flex items-center gap-1.5 px-4 h-full text-[11px] font-medium uppercase tracking-wider transition-colors border-b-2",
                          bottomTab === id
                            ? "text-[#ffffff] border-[#007acc] bg-[#1e1e1e]"
                            : "text-[#858585] border-transparent hover:text-[#cccccc]",
                        )}
                      >
                        {icon}
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 text-[13px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-[#424242]">
                    {/* PROBLEMS TAB */}
                    {bottomTab === "problems" && currentProblem && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-[15px] font-semibold text-[#e2e2e2]">
                            {currentProblem.title}
                          </h2>
                          <DiffBadge d={currentProblem.difficulty} />
                          <span className="text-[10px] text-[#ce9178] font-mono ml-auto">
                            +{currentProblem.xp} XP
                          </span>
                        </div>
                        <p className="text-[#d4d4d4] leading-relaxed whitespace-pre-wrap text-[13px]">
                          {currentProblem.description}
                        </p>
                        {currentProblem.hints?.length > 0 && (
                          <div>
                            <button
                              onClick={() => setShowHints(!showHints)}
                              className="flex items-center gap-1.5 text-[11px] text-[#dabb7c] hover:text-[#e5c57d] transition-colors"
                            >
                              <Lightbulb className="h-3.5 w-3.5" />
                              {showHints ? "Hide" : "Show"} Hints (
                              {currentProblem.hints.length})
                            </button>
                            {showHints && (
                              <div className="mt-2 space-y-1.5">
                                {currentProblem.hints.map((h, i) => (
                                  <div
                                    key={i}
                                    className="flex gap-2 text-[12px] text-[#a0a0a0] bg-[#252526] rounded px-3 py-2 border border-[#3c3c3c]"
                                  >
                                    <span className="text-[#dabb7c] font-semibold shrink-0">
                                      {i + 1}.
                                    </span>
                                    <code className="font-mono">{h}</code>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-[#858585] pt-2 border-t border-[#3c3c3c]">
                          <kbd className="bg-[#3c3c3c] px-1.5 py-0.5 rounded text-[10px]">
                            Ctrl
                          </kbd>
                          <span>+</span>
                          <kbd className="bg-[#3c3c3c] px-1.5 py-0.5 rounded text-[10px]">
                            Enter
                          </kbd>
                          <span>to run tests</span>
                        </div>
                      </div>
                    )}

                    {/* OUTPUT TAB */}
                    {bottomTab === "output" && (
                      <div className="font-mono">
                        {isRunning && (
                          <div className="flex items-center gap-2 text-[#858585]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Running tests…</span>
                          </div>
                        )}
                        {!isRunning && !testResult && (
                          <p className="text-[#858585]">
                            Click{" "}
                            <span className="text-[#d4d4d4] bg-[#3c3c3c] px-1.5 py-0.5 rounded text-[11px]">
                              Run Tests
                            </span>{" "}
                            to check your solution.
                          </p>
                        )}
                        {testResult && (
                          <div
                            className={cn(
                              "flex items-start gap-3 rounded px-4 py-3 border",
                              testResult.success
                                ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
                                : "bg-red-500/5 border-red-500/20 text-red-400",
                            )}
                          >
                            {testResult.success ? (
                              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            ) : (
                              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            )}
                            <div>
                              <div className="font-semibold text-[13px]">
                                {testResult.success
                                  ? "✓ Tests Passed"
                                  : "✗ Tests Failed"}
                              </div>
                              <div className="text-[12px] mt-0.5 opacity-80">
                                {testResult.message}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-1 bg-[#3c3c3c] hover:bg-[#007acc] transition-colors cursor-col-resize" />

          {/* RIGHT: Live Preview */}
          <Panel
            defaultSize={45}
            minSize={25}
            className="flex flex-col overflow-hidden"
          >
            {/* Preview header */}
            <div className="h-9 bg-[#252526] flex items-center justify-between px-3 shrink-0 border-b border-[#3c3c3c]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#cccccc]">
                  Preview
                </span>
                <div className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {testResult && (
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded",
                      testResult.success
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400",
                    )}
                  >
                    {testResult.success ? "✓ PASS" : "✗ FAIL"}
                  </span>
                )}
                <button
                  onClick={handleRunCode}
                  disabled={isRunning}
                  title="Run Tests"
                  className="h-6 flex items-center gap-1 px-2 rounded text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                >
                  {isRunning ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Play className="h-3 w-3 fill-current" />
                  )}
                  {isRunning ? "Running" : "Test"}
                </button>
              </div>
            </div>

            {/* iframe */}
            <div className="flex-1 bg-white overflow-hidden">
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                title="React Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* ── STATUS BAR ── */}
      <div className="h-6 bg-[#007acc] flex items-center justify-between px-3 shrink-0 text-white">
        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={() => navigate("/playground")}
            className="hover:bg-white/20 px-1.5 rounded transition-colors"
          >
            ← Playground
          </button>
          <span className="opacity-70">|</span>
          <span>React JSX</span>
          <span className="opacity-70">|</span>
          <span>{currentProblem?.title || "Select a problem"}</span>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          {currentProblem && (
            <span className="text-[#ffe082]">+{currentProblem.xp} XP</span>
          )}
          <span>
            {completedCount}/{totalProblems} Solved
          </span>
          <span>{progressPct}%</span>
        </div>
      </div>
    </div>
  );
};

export default ReactPlayground;
