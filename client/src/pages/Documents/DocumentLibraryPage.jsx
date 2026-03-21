import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/features/auth/authApi";
import {
  Plus,
  FileText,
  Loader2,
  Trash2,
  BrainCircuit,
  Upload,
  BookOpen,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const DocumentLibraryPage = () => {
  const navigate = useNavigate();

  // --- Data State ---
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Upload Modal State ---
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // 1. Fetch Documents (GET)
  const fetchDocuments = async () => {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // 2. Handle Upload (POST)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and file");
      return;
    }

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      setUploading(true);
      const res = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setDocuments([res.data.data, ...documents]);
      toast.success("Document uploaded successfully!");

      setUploadFile(null);
      setUploadTitle("");
      setIsUploadOpen(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  // 3. Handle Delete (DELETE)
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((doc) => doc._id !== id));
      toast.success("Document deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large! Maximum allowed is 10MB.", {
          style: { background: "#fee2e2", color: "#b91c1c" },
        });
        return;
      }
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  // --- CLOUDINARY THUMBNAIL HELPER ---
  const getThumbnailUrl = (pdfUrl) => {
    if (!pdfUrl) return "";
    return pdfUrl
      .replace("/upload/", "/upload/w_600,h_400,c_fill,f_auto,q_auto/")
      .replace(/\.pdf$/i, ".jpg");
  };

  return (
    <div className="bg-slate-50 min-h-screen pt-4 pb-20">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 transform -rotate-3">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Knowledge Vault
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
              </h1>
              <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
                Upload PDFs and let AI instantly forge interactive quizzes.
              </p>
            </div>
          </div>
          <Button
            size="lg"
            onClick={() => setIsUploadOpen(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto rounded-xl font-bold shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" /> New Document
          </Button>
        </motion.div>

        {/* GRID LIST */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-32 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-slate-500 font-medium">Accessing vault...</p>
          </div>
        ) : documents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center p-20 border-dashed border-2 rounded-3xl bg-white border-slate-200 shadow-sm max-w-2xl mx-auto"
          >
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Your Vault is Empty
            </h3>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Drop your first syllabus, textbook chapter, or assignment PDF here
              to automatically generate study materials.
            </p>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setIsUploadOpen(true)}
              className="rounded-xl border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold"
            >
              Upload First PDF
            </Button>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {documents.map((doc) => (
              <motion.div key={doc._id} variants={itemVariants}>
                <Card
                  className="cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-indigo-500/10 group border-slate-200 overflow-hidden flex flex-col h-full bg-white rounded-2xl"
                  onClick={() => navigate(`/documents/${doc._id}`)}
                >
                  {/* --- IMAGE THUMBNAIL SECTION --- */}
                  <div className="h-44 w-full relative bg-slate-50 border-b border-slate-100 overflow-hidden items-center justify-center group-hover:bg-indigo-50/50 transition-colors hidden sm:flex">
                    <img
                      src={getThumbnailUrl(doc.filePath)}
                      alt={doc.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling.style.display =
                          "flex";
                      }}
                    />
                    {/* Fallback Icon */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
                      <FileText className="text-indigo-300 h-16 w-16" />
                    </div>

                    {/* Floating Delete Button */}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 rounded-full shadow-md bg-red-500 hover:bg-red-600 hover:scale-110 translate-y-2 group-hover:translate-y-0"
                      onClick={(e) => handleDelete(e, doc._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* Status Badge Over Image */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${
                          doc.status === "ready"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}
                      >
                        {doc.status === "ready" ? "Analyzed" : "Processing"}
                      </span>
                    </div>
                  </div>

                  {/* Mobile-only delete button (since hover doesn't exist) */}
                  <div className="sm:hidden w-full flex justify-end p-2 bg-slate-50 border-b relative">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider shadow-sm absolute left-3 top-2 ${
                        doc.status === "ready"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {doc.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:bg-red-50"
                      onClick={(e) => handleDelete(e, doc._id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* CARD DETAILS */}
                  <CardContent className="p-5 flex-grow bg-white">
                    <h3 className="font-bold text-lg leading-tight mb-2 text-slate-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <span>{(doc.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                      <span>•</span>
                      <span>
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-50/50 p-0 border-t border-slate-100 mt-auto">
                    <div
                      className={`w-full p-4 text-sm font-bold flex items-center justify-between transition-colors ${
                        doc.status === "ready"
                          ? "text-indigo-600 group-hover:bg-indigo-50"
                          : "text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" />
                        {doc.status === "ready"
                          ? "Generate Quiz"
                          : "Analyzing Data..."}
                      </span>
                      {doc.status === "ready" && (
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* UPLOAD MODAL */}
        <AnimatePresence>
          {isUploadOpen && (
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogContent className="sm:max-w-md rounded-3xl p-0 overflow-hidden border-0">
                <div className="p-6 md:p-8 bg-white">
                  <DialogHeader className="mb-6">
                    <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                        <Upload className="w-4 h-4 text-indigo-600" />
                      </div>
                      Upload to Vault
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                        Document Title
                      </Label>
                      <Input
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        placeholder="e.g. Chapter 4: React Ecosystem"
                        required
                        className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-xs uppercase tracking-wider">
                        PDF File (Max 10MB)
                      </Label>
                      <div className="relative">
                        <Input
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          required
                          className="h-12 bg-slate-50 border-slate-200 focus-visible:ring-indigo-500 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer pt-2"
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-8">
                      <Button
                        type="submit"
                        disabled={uploading}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20"
                      >
                        {uploading ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-5 w-5" />
                            Uploading & Analyzing...
                          </>
                        ) : (
                          "Add to Vault"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentLibraryPage;
