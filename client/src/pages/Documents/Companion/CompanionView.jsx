import { useState, useCallback } from "react";
import { BookOpen, Loader2, Send, Lightbulb, FileText, Sparkles } from "lucide-react";
import { explainApi } from "../../../services/ragApiService";
import PdfViewer from "./PdfViewer";

function renderExplanation(text) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-2" />;
    const parts = line.split(/(\*\*[^*]+\*\*)/g).map((p, j) => {
      if (p.startsWith('**') && p.endsWith('**'))
        return <strong key={j} className="font-semibold text-white">{p.slice(2, -2)}</strong>;
      return p;
    });
    return <p key={i} className="text-sm text-zinc-300 leading-relaxed">{parts}</p>;
  });
}

function CompanionView({ documentId, pdfUrl }) {
  const [selectedText, setSelectedText] = useState("");
  const [pageNumber, setPageNumber]     = useState("");
  const [isLoading, setIsLoading]       = useState(false);
  const [explanation, setExplanation]   = useState(null);
  const [error, setError]               = useState(null);

  const handleTextSelect = useCallback((text, page) => {
    setSelectedText(text);
    setPageNumber(page.toString());
    setExplanation(null);
    setError(null);
  }, []);

  const handleExplain = async () => {
    if (!selectedText.trim()) return;
    setIsLoading(true);
    setError(null);
    setExplanation(null);
    try {
      const data = await explainApi.explain({
        selectedText: selectedText.trim(),
        page: pageNumber ? parseInt(pageNumber) : undefined,
        documentId,
      });
      setExplanation(data.explanation);
    } catch (err) {
      setError(err.message || "Failed to get explanation.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!documentId || !pdfUrl) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-zinc-600">
        <BookOpen size={44} className="mb-4 text-zinc-700" />
        <p className="font-medium text-zinc-500">No document loaded</p>
        <p className="text-sm mt-1">Upload a PDF first to use the Reading Companion.</p>
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full min-h-0">

      {/* ── Left: PDF Viewer ── */}
      <div className="flex-1 min-w-0 bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">
        <PdfViewer url={pdfUrl} onTextSelect={handleTextSelect} />
      </div>

      {/* ── Right: Explain Panel ── */}
      <div className="w-[360px] flex-shrink-0 flex flex-col gap-3 overflow-y-auto min-h-0">

        {/* Input card */}
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex-shrink-0">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-lg bg-violet-600/20 flex items-center justify-center">
              <BookOpen size={13} className="text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-white">Explain Selected Text</h3>
          </div>

          <textarea
            value={selectedText}
            onChange={(e) => setSelectedText(e.target.value)}
            placeholder="Select text in the PDF or type here…"
            rows={4}
            className={`w-full px-3 py-2.5 bg-[#1a1a1a] border rounded-xl resize-none text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors ${
              selectedText ? 'border-violet-500/40' : 'border-white/10 focus:border-violet-500/40'
            }`}
          />

          <div className="flex items-end gap-3 mt-3">
            <div className="flex-1">
              <label className="block text-[10px] text-zinc-600 mb-1 font-bold uppercase tracking-wider">
                Page (auto-detected)
              </label>
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="—"
                min={1}
                readOnly
                className="w-full px-2.5 py-1.5 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-zinc-400 focus:outline-none"
              />
            </div>
            <button
              onClick={handleExplain}
              disabled={!selectedText.trim() || isLoading}
              className="px-5 py-1.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-opacity flex items-center gap-1.5 shadow-lg shadow-violet-500/20"
            >
              {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Explain
            </button>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-700">
            <Lightbulb size={10} />
            <span>Highlight text in the PDF, then click Explain</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-3.5 bg-red-900/20 border border-red-500/20 rounded-2xl text-red-400 text-sm flex-shrink-0">
            {error}
          </div>
        )}

        {/* Generating skeleton */}
        {isLoading && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center">
                <Sparkles size={11} className="text-amber-400" />
              </div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Generating explanation…</p>
            </div>
            <div className="space-y-2.5 animate-pulse">
              {[100, 85, 92, 70, 78].map((w, i) => (
                <div key={i} className="h-3 bg-white/8 rounded-full" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}

        {/* Explanation result */}
        {explanation && !isLoading && (
          <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex-shrink-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Lightbulb size={13} className="text-amber-400" />
              </div>
              <h3 className="text-sm font-bold text-white">Explanation</h3>
            </div>
            <div className="space-y-1">
              {renderExplanation(explanation)}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!explanation && !isLoading && !error && (
          <div className="flex-1 bg-[#111111] border border-white/10 rounded-2xl flex items-center justify-center p-6 min-h-[120px]">
            <div className="text-center">
              <FileText size={28} className="mx-auto mb-2 text-zinc-700" />
              <p className="text-xs text-zinc-600">
                Select text in the PDF, then click <span className="text-violet-400 font-semibold">Explain</span>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default CompanionView;
