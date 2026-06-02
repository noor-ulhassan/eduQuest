import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/features/auth/authApi";
import { useDocuments, useDocument } from "@/features/documents/useDocuments";
import UploadView from "./Upload/UploadView";
import ChatView from "./Chat/ChatView";
import QuizView from "./Quiz/QuizView";
import CompanionView from "./Companion/CompanionView";
import {
  FileText,
  MessageSquare,
  HelpCircle,
  BookOpen,
  Plus,
  ArrowLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Trash2,
  Loader2,
} from "lucide-react";

/* ── Cloudinary thumbnail helper ─────────────────────── */
function getPdfThumbnail(url) {
  if (!url || !url.includes("cloudinary.com")) return null;
  return url.replace("/upload/", "/upload/c_fill,w_400,h_260,f_jpg,pg_1/");
}

/* ── Numbered step badge ─────────────────────────────── */
function StepBadge({ n }) {
  return (
    <span className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-red-600/15 border border-red-500/25 text-red-400">
      {n}
    </span>
  );
}

/* ════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════ */
function DocumentsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { data: allDocs = [], isLoading: loading } = useDocuments();
  const { data: selectedDoc, isLoading: docLoading, isError: docError } = useDocument(id);
  const [showUpload, setShowUpload] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  /* ── Derive current view from URL ── */
  const view = (() => {
    const p = location.pathname;
    if (p.endsWith("/chat")) return "chat";
    if (p.endsWith("/quiz")) return "quiz";
    if (p.endsWith("/companion")) return "companion";
    if (id) return "options";
    return "library";
  })();

  useEffect(() => {
    if (docError) navigate("/documents");
  }, [docError, navigate]);

  /* ── Handlers ── */
  const handleSelectDoc = (doc) => navigate(`/documents/${doc.documentId}`);

  const handleUploadSuccess = (result) => {
    queryClient.invalidateQueries({ queryKey: ["documents"] });
    setShowUpload(false);
    navigate(`/documents/${result.documentId}`);
  };

  /* ── Delete handler ── */
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/documents/${deleteTarget.documentId}`);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      setDeleteTarget(null);
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const goBack = () => {
    if (["chat", "quiz", "companion"].includes(view))
      navigate(`/documents/${id}`);
    else navigate("/documents");
  };

  const featureLabel =
    { chat: "Chat", quiz: "Quiz", companion: "Explain" }[view] || "";

  /* ── Breadcrumb ── */
  function Breadcrumb() {
    return (
      <div className="flex items-center gap-2.5 px-6 py-3 flex-shrink-0 text-sm border-b border-white/[0.06]">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <ChevronRight size={12} className="text-white/15" />
        <span
          className="cursor-pointer text-zinc-600 hover:text-red-400 transition-colors"
          onClick={() => navigate("/documents")}
        >
          Library
        </span>
        {selectedDoc && (
          <>
            <ChevronRight size={12} className="text-white/15" />
            <span
              className="cursor-pointer text-zinc-400 hover:text-red-400 transition-colors truncate max-w-sm text-[13px]"
              onClick={() => navigate(`/documents/${id}`)}
            >
              {selectedDoc.fileName}
            </span>
          </>
        )}
        {featureLabel && (
          <>
            <ChevronRight size={12} className="text-white/15" />
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-red-400 bg-red-600/10 border border-red-500/20">
              {featureLabel}
            </span>
          </>
        )}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════ */
  return (
    <div
      className="text-white flex flex-col overflow-hidden font-space-grotesk"
      style={{ background: "#0a0a0a", height: "calc(100vh - 56px)" }}
    >
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ══════════════════════════════════════════════
            UPLOAD VIEW
        ══════════════════════════════════════════════ */}
        {showUpload && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2.5 px-6 py-3 flex-shrink-0 text-sm border-b border-white/[0.06]">
              <button
                onClick={() => setShowUpload(false)}
                className="flex items-center gap-1.5 text-zinc-500 hover:text-red-400 transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <ChevronRight size={12} className="text-white/15" />
              <span className="text-zinc-600">Library</span>
              <ChevronRight size={12} className="text-white/15" />
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full text-red-400 bg-red-600/10 border border-red-500/20">
                Upload
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <UploadView onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            LIBRARY VIEW
        ══════════════════════════════════════════════ */}
        {!showUpload && view === "library" && (
          <div className="flex-1 overflow-hidden flex">
            {/* ── Collapsible sidebar ────────────────── */}
            <div
              className="flex-shrink-0 flex flex-col transition-all duration-300 overflow-hidden"
              style={{
                width: sidebarOpen ? "288px" : "0px",
                borderRight: sidebarOpen ? "1px solid rgba(255,255,255,0.06)" : "none",
                opacity: sidebarOpen ? 1 : 0,
              }}
            >
              <div
                className="flex flex-col h-full"
                style={{ width: "288px", padding: "24px 20px 20px", gap: "16px" }}
              >
                {/* Brand */}
                <div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-red-600/15 border border-red-500/20">
                    <BookOpen size={18} className="text-red-400" />
                  </div>
                  <h1 className="text-lg font-bold leading-tight mb-1 text-metallic">
                    Your Library
                  </h1>
                  <p className="text-zinc-600 text-xs leading-relaxed">
                    Upload PDFs to read, chat, and quiz with AI.
                  </p>
                </div>

                {/* Steps */}
                <div className="flex flex-col gap-2.5">
                  {[
                    { n: 1, label: "Select a document", sub: "Pick from library or upload a PDF" },
                    { n: 2, label: "Choose a mode",     sub: "Chat, quiz, or read with AI" },
                    { n: 3, label: "Explore insights",  sub: "Ask, test, and annotate freely" },
                  ].map(({ n, label, sub }) => (
                    <div
                      key={n}
                      className="flex items-start gap-3 rounded-xl p-3 bg-white/[0.02] border border-white/[0.06]"
                    >
                      <StepBadge n={n} />
                      <div className="pt-px">
                        <p className="text-sm font-semibold text-white mb-0.5">{label}</p>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload CTA */}
                <div className="mt-auto">
                  <button
                    onClick={() => setShowUpload(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl font-semibold transition-all py-3 bg-red-600 hover:bg-red-500 text-white text-[13px]"
                  >
                    <Plus size={16} />
                    Upload new PDF
                  </button>
                </div>
              </div>
            </div>

            {/* ── Sidebar toggle tab ─────────────────── */}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              className="flex-shrink-0 flex items-center justify-center transition-all duration-200 doc-sidebar-toggle"
              style={{
                width: "22px",
                borderRight: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {sidebarOpen ? (
                <PanelLeftClose size={13} />
              ) : (
                <PanelLeftOpen size={13} />
              )}
            </button>

            {/* ── Document grid ──────────────────────── */}
            <div className="flex-1 overflow-y-auto" style={{ padding: "28px" }}>
              {/* Loading skeletons */}
              {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="rounded-2xl animate-pulse h-[240px] bg-white/[0.03] border border-white/[0.06]"
                    />
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && allDocs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center gap-5 text-center">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-white/[0.03] border border-white/[0.06]">
                    <FileText size={36} className="text-red-400/30" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-zinc-400 mb-1">
                      No documents yet
                    </p>
                    <p className="text-zinc-600 text-[13px]">
                      Upload your first PDF to get started
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 rounded-xl font-medium transition-all px-5 py-2.5 bg-red-600/10 border border-red-500/25 text-red-400 text-[13px] hover:bg-red-600/15"
                  >
                    <Plus size={15} /> Upload a PDF
                  </button>
                </div>
              )}

              {/* Document cards */}
              {!loading && allDocs.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {allDocs.map((doc) => {
                    const thumb = getPdfThumbnail(doc.filePath);
                    return (
                      <button
                        key={doc.documentId}
                        onClick={() => handleSelectDoc(doc)}
                        className="doc-card group text-left rounded-2xl overflow-hidden flex flex-col"
                        style={{
                          background: "rgba(255,255,255,0.02)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(239,68,68,0.05)";
                          e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                        }}
                      >
                        {/* Thumbnail */}
                        <div
                          className="w-full flex-shrink-0 flex items-center justify-center overflow-hidden"
                          style={{ height: "155px", background: "rgba(0,0,0,0.35)" }}
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt=""
                              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                e.currentTarget.nextSibling.style.display = "flex";
                              }}
                            />
                          ) : null}
                          <div
                            className="w-full h-full flex-col gap-2 items-center justify-center"
                            style={{ display: thumb ? "none" : "flex" }}
                          >
                            <FileText size={38} className="text-red-400/20" />
                            <span className="text-[9px] text-white/15 tracking-[0.12em] uppercase font-mono">
                              PDF
                            </span>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/[0.06] flex-shrink-0" />

                        {/* Card info */}
                        <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4 gap-2">
                          <p className="line-clamp-2 leading-snug text-[13px] font-medium text-white">
                            {doc.fileName}
                          </p>

                          <div className="flex items-center justify-between mt-auto">
                            {/* Left: page count + date */}
                            <div className="flex items-center gap-2">
                              {doc.totalPages && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.07] text-zinc-500 font-mono">
                                  {doc.totalPages} pp
                                </span>
                              )}
                              {doc.uploadedAt && (
                                <span className="text-zinc-600 text-[11px]">
                                  {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              )}
                            </div>

                            {/* Right: delete + open */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget(doc);
                                }}
                                className="doc-trash-btn opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/10"
                              >
                                <Trash2 size={13} className="text-red-400" />
                              </button>

                              <span className="flex items-center gap-0.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity text-red-400 text-[11px]">
                                Open <ChevronRight size={12} />
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            OPTIONS VIEW
        ══════════════════════════════════════════════ */}
        {!showUpload && view === "options" && (
          <>
            <Breadcrumb />
            {docLoading ? (
              <div className="flex-1 flex items-center justify-center text-sm text-zinc-600">
                Loading document…
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-10">
                <div className="text-center mb-10">
                  <p className="text-sm mb-2 text-zinc-500 italic">
                    {selectedDoc?.fileName}
                  </p>
                  <h2 className="text-2xl font-bold text-metallic">
                    What would you like to do?
                  </h2>
                  <p className="text-zinc-600 text-[13px] mt-1.5">
                    Choose a mode to start working with this document
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-2xl">
                  {[
                    {
                      fid: "chat",
                      label: "Chat",
                      description: "Ask questions and get instant answers from your document",
                      icon: MessageSquare,
                      accent: "#6b8de8",
                      glow: "rgba(107,141,232,0.08)",
                    },
                    {
                      fid: "quiz",
                      label: "Quiz",
                      description: "Test your knowledge with AI-generated questions",
                      icon: HelpCircle,
                      accent: "#6ab87a",
                      glow: "rgba(106,184,122,0.08)",
                    },
                    {
                      fid: "companion",
                      label: "Explain",
                      description: "Read the PDF with live AI explanations alongside",
                      icon: BookOpen,
                      accent: "#f87171",
                      glow: "rgba(248,113,113,0.08)",
                    },
                  ].map(({ fid, label, description, icon: Icon, accent, glow }) => (
                    <button
                      key={fid}
                      onClick={() => navigate(`/documents/${id}/${fid}`)}
                      className="flex flex-col items-center text-center rounded-2xl transition-all duration-200 bg-[#111111] border border-white/10"
                      style={{ padding: "32px 24px", gap: "20px" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = glow;
                        e.currentTarget.style.borderColor = `${accent}33`;
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow = "0 20px 48px rgba(0,0,0,0.5)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#111111";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: glow, border: `1px solid ${accent}25` }}
                      >
                        <Icon size={28} style={{ color: accent }} />
                      </div>
                      <div>
                        <p className="text-base font-bold mb-1.5 text-white">{label}</p>
                        <p className="text-zinc-500 text-xs leading-relaxed">{description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════
            FEATURE VIEWS (chat / quiz / companion)
        ══════════════════════════════════════════════ */}
        {!showUpload && ["chat", "quiz", "companion"].includes(view) && (
          <>
            <Breadcrumb />
            <div className="flex-1 overflow-hidden flex flex-col min-h-0 p-4">
              {view === "chat" && <ChatView documentId={id} />}
              {view === "quiz" && (
                <QuizView documentId={id} pdfUrl={selectedDoc?.pdfUrl} />
              )}
              {view === "companion" && (
                <CompanionView documentId={id} pdfUrl={selectedDoc?.pdfUrl} />
              )}
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════
            DELETE CONFIRMATION MODAL
        ══════════════════════════════════════════════ */}
        {deleteTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            onClick={() => !isDeleting && setDeleteTarget(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl p-6 flex flex-col gap-5 bg-[#111111] border border-white/10 shadow-2xl shadow-black/70"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/10 border border-red-500/20">
                <Trash2 size={22} className="text-red-400" />
              </div>

              {/* Text */}
              <div>
                <h3 className="text-base font-bold mb-1.5 text-white">
                  Delete document?
                </h3>
                <p className="text-zinc-500 text-[13px] leading-relaxed">
                  <span className="text-zinc-300">{deleteTarget.fileName}</span>{" "}
                  will be permanently deleted. This cannot be undone.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all bg-white/[0.05] border border-white/10 text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all text-white"
                  style={{
                    background: isDeleting ? "rgba(220,80,80,0.4)" : "rgba(220,80,80,0.85)",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) e.currentTarget.style.background = "rgba(220,80,80,1)";
                  }}
                  onMouseLeave={(e) => {
                    if (!isDeleting) e.currentTarget.style.background = "rgba(220,80,80,0.85)";
                  }}
                >
                  {isDeleting ? (
                    <><Loader2 size={14} className="animate-spin" /> Deleting…</>
                  ) : (
                    <><Trash2 size={14} /> Delete</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DocumentsPage;
