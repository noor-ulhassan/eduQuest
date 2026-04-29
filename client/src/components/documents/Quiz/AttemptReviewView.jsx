import { useState } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { ArrowLeft, Trophy, CheckCircle, XCircle, BookMarked, FileText } from "lucide-react";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const LABELS = ["A", "B", "C", "D"];

function gradeFor(pct) {
  if (pct === 100) return { label: "Perfect!",   color: "text-yellow-400",  bg: "bg-yellow-500/10 border-yellow-500/30"  };
  if (pct >= 80)   return { label: "Excellent!",  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" };
  if (pct >= 70)   return { label: "Good Job!",   color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30"       };
  if (pct >= 50)   return { label: "Keep Going!", color: "text-orange-400",  bg: "bg-orange-500/10 border-orange-500/30"   };
  return             { label: "Try Again!",        color: "text-red-400",     bg: "bg-red-500/10 border-red-500/30"          };
}

function QACard({ pair, index, isActive, onShowContext }) {
  const getOptionStyle = (option) => {
    if (option === pair.correctAnswer)                  return "bg-emerald-600/15 border-emerald-500/50 text-emerald-300";
    if (option === pair.userAnswer && !pair.isCorrect)  return "bg-red-600/15 border-red-500/50 text-red-300";
    return "bg-[#1a1a1a] border-white/5 text-zinc-600";
  };

  return (
    <div
      className={`bg-[#111111] rounded-2xl border p-4 flex-shrink-0 transition-all ${
        isActive ? "border-amber-500/40 shadow-lg shadow-amber-500/5" : "border-white/10"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Q{index + 1}</span>
        {pair.isCorrect
          ? <CheckCircle size={12} className="text-emerald-400" />
          : <XCircle    size={12} className="text-red-400" />}
        {pair.pageNumber && (
          <span className="ml-auto text-[10px] font-semibold text-zinc-600">p.{pair.pageNumber}</span>
        )}
      </div>

      <p className="text-sm font-semibold text-white mb-3 leading-relaxed">{pair.question}</p>

      {/* Options */}
      <div className="space-y-1.5 mb-3">
        {pair.options.map((option, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${getOptionStyle(option)}`}>
            <span className="font-bold flex-shrink-0">{LABELS[i]}</span>
            <span className="flex-1 leading-snug">{option}</span>
            {option === pair.correctAnswer                  && <CheckCircle size={11} className="text-emerald-400 flex-shrink-0" />}
            {option === pair.userAnswer && !pair.isCorrect  && <XCircle    size={11} className="text-red-400 flex-shrink-0" />}
          </div>
        ))}
      </div>

      {pair.explanation && (
        <p className="text-xs text-zinc-500 leading-relaxed mb-3">{pair.explanation}</p>
      )}

      {/* Source quote callout — shown when active */}
      {isActive && pair.sourceQuote && (
        <div className="mt-1 mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider mb-1.5">
            Source · Page {pair.pageNumber}
          </p>
          <p className="text-xs text-amber-100/80 italic leading-relaxed">
            "{pair.sourceQuote}"
          </p>
        </div>
      )}

      {/* Button */}
      {onShowContext && (
        <button
          onClick={onShowContext}
          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
            isActive ? "text-amber-300" : "text-amber-400 hover:text-amber-300"
          }`}
        >
          <BookMarked size={12} />
          {isActive ? "Viewing page in PDF →" : "Show Context in PDF"}
        </button>
      )}
    </div>
  );
}

function AttemptReviewView({ attempt, pdfUrl, onClose }) {
  const [activeIdx, setActiveIdx] = useState(null);

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  const jumpToPage =
    defaultLayoutPluginInstance.toolbarPluginInstance
      ?.pageNavigationPluginInstance?.jumpToPage;

  const handleShowContext = (pageNumber, idx) => {
    setActiveIdx(idx);
    if (jumpToPage && pageNumber) {
      jumpToPage(pageNumber - 1); // viewer is 0-indexed
    }
  };

  const grade           = gradeFor(attempt.percentage);
  const date            = new Date(attempt.createdAt).toLocaleDateString(undefined, {
    month: "long", day: "numeric", year: "numeric",
  });
  const effectivePdfUrl = pdfUrl || attempt.cloudinaryUrl;

  return (
    <div className="flex gap-4 h-full min-h-0">

      {/* ── Left: PDF viewer ── */}
      <div className="flex-1 min-w-0 bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
        {effectivePdfUrl ? (
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div style={{ height: "100%" }}>
              <Viewer
                fileUrl={effectivePdfUrl}
                plugins={[defaultLayoutPluginInstance]}
              />
            </div>
          </Worker>
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-zinc-600">
            <FileText size={36} className="mb-3 text-zinc-700" />
            <p className="text-sm">PDF not available</p>
          </div>
        )}
      </div>

      {/* ── Right: review panel ── */}
      <div className="w-[360px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto min-h-0">

        {/* Header */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </button>
            <h3 className="text-sm font-bold text-white">Attempt Review</h3>
          </div>

          <div className={`flex items-center gap-3 p-3 rounded-xl border ${grade.bg}`}>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
              <Trophy size={18} className={grade.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${grade.color}`}>{grade.label}</p>
              <p className="text-xs text-zinc-400">
                {attempt.score}/{attempt.totalQuestions} correct · {attempt.percentage}%
              </p>
            </div>
          </div>
          <p className="text-[11px] text-zinc-600 mt-2">{date}</p>
        </div>

        {/* Q&A cards */}
        {attempt.qaPairs.map((pair, idx) => (
          <QACard
            key={idx}
            pair={pair}
            index={idx}
            isActive={activeIdx === idx}
            onShowContext={
              pair.sourceQuote && pair.pageNumber
                ? () => handleShowContext(pair.pageNumber, idx)
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

export default AttemptReviewView;
