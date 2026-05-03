import { X, BookMarked } from "lucide-react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

function ContextModal({ pdfUrl, pageNumber, exactQuote, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-4xl flex flex-col overflow-hidden shadow-2xl"
        style={{ height: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <BookMarked size={14} className="text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Source Context</p>
              <p className="text-sm font-semibold text-white">Page {pageNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-500 hover:text-white hover:bg-white/8 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Exact quote banner */}
        <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/15 flex-shrink-0">
          <p className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest mb-1">
            Source — Page {pageNumber}
          </p>
          <blockquote className="text-sm text-amber-100/80 italic leading-relaxed line-clamp-3">
            "{exactQuote}"
          </blockquote>
        </div>

        {/* PDF Viewer — opens at the correct page */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <div style={{ height: "100%" }}>
              <Viewer
                fileUrl={pdfUrl}
                initialPage={pageNumber - 1}
              />
            </div>
          </Worker>
        </div>
      </div>
    </div>
  );
}

export default ContextModal;
