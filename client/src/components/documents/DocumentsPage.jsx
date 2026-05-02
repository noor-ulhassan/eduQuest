import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "@/features/auth/authApi";
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
} from "lucide-react";

// Cloudinary PDF → first-page JPEG thumbnail
function getPdfThumbnail(url) {
  if (!url || !url.includes("cloudinary.com")) return null;
  return url.replace("/upload/", "/upload/c_fill,w_400,h_260,f_jpg,pg_1/");
}

function DocumentsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [allDocs, setAllDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [docLoading, setDocLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  const view = (() => {
    const p = location.pathname;
    if (p.endsWith("/chat")) return "chat";
    if (p.endsWith("/quiz")) return "quiz";
    if (p.endsWith("/companion")) return "companion";
    if (id) return "options";
    return "library";
  })();

  useEffect(() => {
    api
      .get("/documents")
      .then((res) => {
        setAllDocs(
          (res.data.data || []).map((d) => ({
            documentId: d._id,
            fileName: d.title,
            totalPages: d.totalPages,
            chunksStored: d.chunksStored,
            uploadedAt: d.uploadedAt || d.createdAt,
            filePath: d.filePath,
          })),
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!id) {
      setSelectedDoc(null);
      return;
    }
    setDocLoading(true);
    api
      .get(`/documents/${id}`)
      .then((res) => {
        const d = res.data.data;
        setSelectedDoc({
          documentId: d._id,
          pdfUrl: d.filePath,
          fileName: d.title,
          totalPages: d.totalPages,
        });
      })
      .catch(() => navigate("/documents"))
      .finally(() => setDocLoading(false));
  }, [id, navigate]);

  const handleSelectDoc = (doc) => navigate(`/documents/${doc.documentId}`);

  const handleUploadSuccess = (result) => {
    setAllDocs((prev) => [
      {
        documentId: result.documentId,
        fileName: result.fileName,
        totalPages: result.totalPages,
        chunksStored: result.chunksStored,
        uploadedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setShowUpload(false);
    navigate(`/documents/${result.documentId}`);
  };

  const goBack = () => {
    if (["chat", "quiz", "companion"].includes(view))
      navigate(`/documents/${id}`);
    else navigate("/documents");
  };

  const featureLabel =
    { chat: "Chat", quiz: "Quiz", companion: "Companion" }[view] || "";

  function Breadcrumb() {
    return (
      <div className="flex items-center gap-2 text-sm px-6 py-4 border-b border-white/10 flex-shrink-0">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <ChevronRight size={12} className="text-zinc-700" />
        <span
          className="text-zinc-400 hover:text-white cursor-pointer transition-colors"
          onClick={() => navigate("/documents")}
        >
          Documents
        </span>
        {selectedDoc && (
          <>
            <ChevronRight size={12} className="text-zinc-700" />
            <span
              className="text-zinc-300 font-medium truncate max-w-xs cursor-pointer hover:text-white transition-colors"
              onClick={() => navigate(`/documents/${id}`)}
            >
              {selectedDoc.fileName}
            </span>
          </>
        )}
        {featureLabel && (
          <>
            <ChevronRight size={12} className="text-zinc-700" />
            <span className="text-red-400 font-semibold">{featureLabel}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-white h-[calc(100vh-56px)] flex flex-col font-space-grotesk overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
        {/* Upload full-page */}
        {showUpload && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 text-sm px-6 py-4 border-b border-white/10 flex-shrink-0">
              <button
                onClick={() => setShowUpload(false)}
                className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <ChevronRight size={12} className="text-zinc-700" />
              <span className="text-zinc-400">Documents</span>
              <ChevronRight size={12} className="text-zinc-700" />
              <span className="text-red-400 font-semibold">Upload</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <UploadView onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        )}

        {/* Library */}
        {!showUpload && view === "library" && (
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">My Documents</h1>
                <p className="text-sm text-zinc-400 mt-1">
                  Upload PDFs to chat, quiz, and explore with AI
                </p>
              </div>
              <button
                onClick={() => setShowUpload(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20"
              >
                <Plus size={18} /> Upload New
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading &&
                [0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-52 rounded-2xl bg-[#111111] border border-white/10 animate-pulse"
                  />
                ))}

              {!loading &&
                allDocs.map((doc) => {
                  const thumb = getPdfThumbnail(doc.filePath);
                  return (
                    <button
                      key={doc.documentId}
                      onClick={() => handleSelectDoc(doc)}
                      className="group text-left rounded-2xl border border-white/10 bg-[#111111] hover:border-red-500/30 hover:shadow-xl hover:shadow-red-500/5 transition-all overflow-hidden flex flex-col"
                    >
                      {/* Thumbnail */}
                      <div className="h-36 bg-[#1a1a1a] overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt=""
                            className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              e.currentTarget.nextSibling.style.display =
                                "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className="w-full h-full items-center justify-center"
                          style={{ display: thumb ? "none" : "flex" }}
                        >
                          <FileText size={36} className="text-zinc-700" />
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-white/8" />

                      {/* Info */}
                      <div className="p-4 flex flex-col gap-2">
                        <p className="text-sm font-semibold text-white line-clamp-2 leading-snug">
                          {doc.fileName}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-zinc-600">
                            {doc.totalPages ? `${doc.totalPages} pages` : "PDF"}
                            {doc.uploadedAt
                              ? ` · ${new Date(doc.uploadedAt).toLocaleDateString()}`
                              : ""}
                          </p>
                          <span className="text-xs text-red-400 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            Open <ChevronRight size={12} />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}

              {!loading && allDocs.length === 0 && (
                <div className="col-span-3 flex flex-col items-center justify-center h-52 text-zinc-600">
                  <FileText size={40} className="mb-3 text-zinc-700" />
                  <p>No documents yet. Upload your first PDF.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Options */}
        {!showUpload && view === "options" && (
          <>
            <Breadcrumb />
            {docLoading ? (
              <div className="flex-1 flex items-center justify-center text-zinc-500">
                Loading document…
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-8">
                <div className="text-center mb-10">
                  <h2 className="text-xl font-bold">
                    What would you like to do?
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Choose a mode to start working with this document
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
                  {[
                    {
                      fid: "chat",
                      label: "Chat",
                      description:
                        "Ask questions and get instant answers from your document",
                      icon: MessageSquare,
                      color: "text-indigo-400",
                      bg: "bg-indigo-600/20",
                      hover: "hover:border-indigo-500/40",
                    },
                    {
                      fid: "quiz",
                      label: "Quiz",
                      description:
                        "Test your knowledge with AI-generated questions",
                      icon: HelpCircle,
                      color: "text-emerald-400",
                      bg: "bg-emerald-600/20",
                      hover: "hover:border-emerald-500/40",
                    },
                    {
                      fid: "companion",
                      label: "Companion",
                      description:
                        "Read the PDF with live AI explanations alongside",
                      icon: BookOpen,
                      color: "text-violet-400",
                      bg: "bg-violet-600/20",
                      hover: "hover:border-violet-500/40",
                    },
                  ].map(
                    ({
                      fid,
                      label,
                      description,
                      icon: Icon,
                      color,
                      bg,
                      hover,
                    }) => (
                      <button
                        key={fid}
                        onClick={() => navigate(`/documents/${id}/${fid}`)}
                        className={`flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-white/10 bg-[#111111] hover:shadow-lg transition-all ${hover}`}
                      >
                        <div
                          className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center`}
                        >
                          <Icon size={32} className={color} />
                        </div>
                        <div>
                          <p className="text-base font-semibold">{label}</p>
                          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                            {description}
                          </p>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Feature views — flex chain gives components a definite height */}
        {!showUpload && ["chat", "quiz", "companion"].includes(view) && (
          <>
            <Breadcrumb />
            <div className="flex-1 overflow-hidden p-6 flex flex-col min-h-0">
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
      </main>
    </div>
  );
}

export default DocumentsPage;
