import { useState, useCallback } from "react";
import { BookOpen, Loader2, Send, Lightbulb, FileText } from "lucide-react";
import { explainApi } from "../../../services/ragApiService";
import PdfViewer from "./PdfViewer";

/**
 * CompanionView — "Explain" tab.
 *
 * Left panel:  PDF reader (loaded from Cloudinary URL).
 * Right panel: Explain form + result.
 *
 * When user selects text in the PDF, it auto-populates the explain form.
 */
function CompanionView({ documentId, pdfUrl }) {
  const [selectedText, setSelectedText] = useState("");
  const [pageNumber, setPageNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [error, setError] = useState(null);

  // 1. ADDED useCallback: Prevents PdfViewer from re-rendering every time the user types in the textarea
  const handleTextSelect = useCallback((text, page) => {
    setSelectedText(text);
    setPageNumber(page.toString());
    // Clear previous explanation when new text is selected
    setExplanation(null);
    setError(null);
  }, []); // Empty dependency array ensures this function reference never changes

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
      setError(err.message || "Failed to get explanation");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── No document state ───
  if (!documentId || !pdfUrl) {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No document loaded</p>
          <p className="text-sm mt-1">
            Upload a PDF first to use the Reading Companion.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex gap-4">
      {/* ═══════════ Left: PDF Viewer ═══════════ */}
      <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 overflow-hidden">
        <PdfViewer url={pdfUrl} onTextSelect={handleTextSelect} />
      </div>

      {/* ═══════════ Right: Explain Panel ═══════════ */}
      <div className="w-[380px] flex-shrink-0 flex flex-col gap-3">
        {/* ── Input Card ── */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-gray-900 text-sm">
              Explain Selected Text
            </h2>
          </div>

          {/* Selected text display */}
          <div className="relative">
            <textarea
              value={selectedText}
              onChange={(e) => setSelectedText(e.target.value)}
              placeholder="Select text in the PDF or type here…"
              rows={4}
              className={`w-full px-3 py-2.5 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-colors ${
                selectedText
                  ? "border-indigo-300 bg-indigo-50/50"
                  : "border-gray-300"
              }`}
            />
            {selectedText && (
              <div className="absolute top-2 right-2">
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-medium">
                  from PDF
                </span>
              </div>
            )}
          </div>

          {/* Controls row */}
          <div className="flex items-end gap-3 mt-3">
            <div className="flex-1">
              <label className="block text-[11px] text-gray-500 mb-1 font-medium uppercase tracking-wide">
                Page (auto-detected)
              </label>
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value)}
                placeholder="—"
                min={1}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                readOnly
              />
            </div>

            <button
              onClick={handleExplain}
              disabled={!selectedText.trim() || isLoading}
              className="px-5 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>…</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  Explain
                </>
              )}
            </button>
          </div>

          {/* Scope hint */}
          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Lightbulb size={10} />
            <span>Select text in the PDF reader, then click Explain</span>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
            {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="space-y-2.5 animate-pulse">
              <div className="h-3.5 bg-gray-200 rounded w-full"></div>
              <div className="h-3.5 bg-gray-200 rounded w-5/6"></div>
              <div className="h-3.5 bg-gray-200 rounded w-4/6"></div>
              <div className="h-3.5 bg-gray-200 rounded w-full"></div>
              <div className="h-3.5 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        )}

        {/* ── Explanation Result ── */}
        {explanation && !isLoading && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 p-5 overflow-y-auto animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={16} className="text-amber-500" />
              <h3 className="font-semibold text-gray-900 text-sm">
                Explanation
              </h3>
            </div>
            <div className="prose prose-sm prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-[13px]">
                {explanation}
              </p>
            </div>
          </div>
        )}

        {/* ── Empty state (no explanation yet) ── */}
        {!explanation && !isLoading && !error && (
          <div className="flex-1 bg-white rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
            <div className="text-center p-6">
              <FileText size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-xs">
                Select text in the PDF, then click <strong>Explain</strong>.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanionView;