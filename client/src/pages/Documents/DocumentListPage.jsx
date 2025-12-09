import React, { useEffect, useState } from "react";
import { Plus, Upload, Trash2, FileText, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

// Module Imports
import DocumentCard from "@/components/documents/DocumentCard"; // Path to your separate component
import documentService from "../../services/documentService";

// Shadcn UI Component Imports
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// NOTE: Badge is not strictly needed here but may be used in DocumentCard.jsx

const DocumentListPage = () => {
  // --- STATE ---
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // --- DATA FETCHING & LIFECYCLE ---

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      toast.error("Failed to fetch documents");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // --- HANDLERS ---

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      // Use the file name as a default title, removing the extension
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file");
      return;
    }
    setUploading(true);
    // Note: FormData is usually for real API calls, but we pass primitives to the mock
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(uploadTitle, uploadFile);
      toast.success("Document uploaded successfully");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`'${selectedDoc.title}' deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      // Optimistic UI update: Remove the document from the list immediately
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document. ");
    } finally {
      setDeleting(false);
    }
  };

  // --- RENDER LOGIC ---

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center p-16 mt-8 text-gray-500">
          <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
          <p className="mt-3">Loading documents...</p>
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="text-center p-16 border-2 border-dashed rounded-lg mt-8 bg-gray-50">
          <FileText className="w-10 h-10 mx-auto text-gray-400" />
          <p className="mt-4 text-gray-500">
            You don't have any documents yet.
          </p>
          <Button
            className="mt-4 font-jersey"
            variant={"default"}
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" /> Upload your first document
          </Button>
        </div>
      );
    }

    // Document List Table (Uses DocumentCard for modularity)
    return (
      <div className="mt-8 border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%] font-jersey">Document</TableHead>
              <TableHead className="w-[20%]">File Type</TableHead>
              <TableHead className="w-[20%]">Size</TableHead>
              <TableHead className="w-[15%]">Uploaded</TableHead>
              <TableHead className="w-[5%] text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((doc) => (
              <DocumentCard
                key={doc._id}
                doc={doc}
                onDeleteRequest={handleDeleteRequest}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    );
  };

  // --- MAIN COMPONENT RETURN ---

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold font-jersey">My Documents</h1>
          <p className="text-gray-500">
            Manage and organize your learning materials.
          </p>
        </div>

        {/* Upload Button (Shows only if documents exist) */}
        {documents.length > 0 && (
          <Button
            className="font-jersey"
            variant={"default"}
            onClick={() => setIsUploadModalOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" /> Upload Document
          </Button>
        )}
      </div>

      {/* CONTENT: Calls the helper function to render list/loading/empty state */}
      {renderContent()}

      {/* --- UPLOAD MODAL (Dialog) --- */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-jersey">
              Upload New Document
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpload}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g., Q4 Business Review"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Select File</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  required
                />
                {uploadFile && (
                  <p className="text-sm text-gray-500 mt-2">
                    Selected: {uploadFile.name}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="font-jersey"
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION MODAL (AlertDialog) --- */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-jersey">
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete **"
              {selectedDoc?.title || "the document"}"** and remove its data from
              our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 font-jersey"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {deleting ? "Deleting..." : "Yes, Delete Document"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentListPage;
