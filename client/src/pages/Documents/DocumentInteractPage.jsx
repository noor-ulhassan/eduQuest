import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/features/auth/authApi";
import { Loader2, ArrowLeft, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

import ChatView from "../../components/documents/Chat/ChatView";
import CompanionView from "../../components/documents/Companion/CompanionView";
import QuizView from "../../components/documents/Quiz/QuizView";

const DocumentInteractPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRes = await api.get(`/documents/${id}`);
        setDoc(docRes.data.data);
      } catch (error) {
        toast.error("Failed to load document data");
        navigate("/documents");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
        <span className="ml-3 text-slate-500 font-medium animate-pulse">Loading Document...</span>
      </div>
    );
  }

  if (!doc) return null;

  return (
    <div className="bg-slate-50 min-h-screen pt-4 pb-20 px-4 sm:px-6 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/documents")}
          className="mb-2 pl-0 hover:bg-transparent text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Return to Vault
        </Button>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight line-clamp-1 flex items-center gap-2">
                {doc.title}
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium"
                >
                  {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                </Badge>
                <span className="text-slate-400 text-sm">
                  Uploaded on {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => window.open(doc.filePath, "_blank")}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 w-full sm:w-auto h-12 px-6 font-bold shadow-sm"
          >
            View Original PDF
          </Button>
        </motion.div>

        <Tabs defaultValue="companion" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-white p-1 rounded-xl border border-slate-200">
            <TabsTrigger value="companion" className="rounded-lg font-semibold">Explain</TabsTrigger>
            <TabsTrigger value="chat" className="rounded-lg font-semibold">Chat Q&A</TabsTrigger>
            <TabsTrigger value="quiz" className="rounded-lg font-semibold">Generate Quiz</TabsTrigger>
          </TabsList>

          <TabsContent value="companion" className="mt-0">
            <CompanionView documentId={doc._id} pdfUrl={doc.filePath} />
          </TabsContent>

          <TabsContent value="chat" className="mt-0">
            <ChatView documentId={doc._id} pdfUrl={doc.filePath} />
          </TabsContent>

          <TabsContent value="quiz" className="mt-0">
            <QuizView documentId={doc._id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
export default DocumentInteractPage;
