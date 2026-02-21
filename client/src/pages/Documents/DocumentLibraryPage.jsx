import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/features/auth/authApi"; 
import { 
  Plus, FileText, Loader2, Trash2, BrainCircuit, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      await api.delete(`/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc._id !== id));
      toast.success("Document deleted");
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, "")); 
    }
  };

  // --- CLOUDINARY THUMBNAIL HELPER ---
  const getThumbnailUrl = (pdfUrl) => {
    if (!pdfUrl) return "";
    // Replaces /upload/ with sizing parameters and changes .pdf to .jpg
    return pdfUrl
      .replace('/upload/', '/upload/w_400,h_250,c_fill,f_auto,q_auto/')
      .replace(/\.pdf$/i, '.jpg');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen mt-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-jersey text-zinc-800">Knowledge Vault</h1>
          <p className="text-zinc-500">Manage your PDFs and generate AI quizzes.</p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white">
          <Plus className="mr-2 h-4 w-4" /> Upload PDF
        </Button>
      </div>

      {/* GRID LIST */}
      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-zinc-500" /></div>
      ) : documents.length === 0 ? (
        <div className="text-center p-20 border-dashed border-2 rounded-xl bg-zinc-50 border-zinc-200">
          <FileText className="w-10 h-10 mx-auto text-zinc-300 mb-2" />
          <p className="text-zinc-500">No documents found. Upload one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Card 
              key={doc._id} 
              className="cursor-pointer hover:shadow-xl transition-all group border-zinc-200 overflow-hidden flex flex-col"
              // Kept the extra 's' here as requested
              onClick={() => navigate(`/documents/${doc._id}`)} 
            >
              {/* --- IMAGE THUMBNAIL SECTION --- */}
              <div className="h-40 w-full relative bg-zinc-100 border-b overflow-hidden flex items-center justify-center">
                <img 
                  src={getThumbnailUrl(doc.filePath)} 
                  alt={doc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    // Fallback to icon if Cloudinary fails to generate the image
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback Icon */}
                <div className="absolute inset-0 hidden items-center justify-center bg-blue-50/50">
                  <FileText className="text-blue-600 h-12 w-12" />
                </div>

                {/* Floating Delete Button */}
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 rounded-full shadow-md bg-red-500 hover:bg-red-600"
                  onClick={(e) => handleDelete(e, doc._id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* CARD DETAILS */}
              <CardContent className="p-5 flex-grow bg-white">
                <h3 className="font-bold text-lg truncate mb-2 text-zinc-800">{doc.title}</h3>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-zinc-500">
                    {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    doc.status === 'ready' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {doc.status.toUpperCase()}
                    </span>
                </div>
              </CardContent>
              <CardFooter className="bg-zinc-50/50 p-4 border-t border-zinc-100">
                 <div className="text-sm font-medium flex items-center text-zinc-600 group-hover:text-purple-600 transition w-full justify-center">
                    <BrainCircuit className="w-4 h-4 mr-2" /> 
                    {doc.status === 'ready' ? 'Generate Quiz' : 'Processing...'}
                 </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-jersey">Upload Knowledge Source</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 py-2">
            <div>
              <Label className="text-zinc-700">Document Title</Label>
              <Input 
                value={uploadTitle} 
                onChange={(e) => setUploadTitle(e.target.value)} 
                placeholder="e.g. React Basics" 
                required 
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-700">PDF File (Max 10MB)</Label>
              <Input 
                type="file" 
                accept=".pdf" 
                onChange={handleFileChange} 
                required 
                className="mt-1"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="submit" disabled={uploading} className="w-full bg-zinc-900 hover:bg-zinc-800 text-white">
                {uploading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Upload className="mr-2 h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Document"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentLibraryPage;