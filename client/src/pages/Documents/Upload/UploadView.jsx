import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { uploadApi } from '@/features/documents/apiService';

function UploadView({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      const result = await uploadApi.upload(selectedFile);
      setUploadResult(result);
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ─── Success State ───────────────────────────────────
  if (uploadResult) {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Upload Successful!</h2>
          <p className="text-zinc-400 mb-6">Your document has been processed and is ready for use.</p>

          <div className="bg-[#111111] rounded-xl border border-white/10 p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Document</p>
                <p className="text-sm font-medium text-white">{uploadResult.fileName}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Document ID</p>
                <p className="text-sm font-mono text-zinc-400 truncate">{uploadResult.documentId}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Pages</p>
                <p className="text-sm font-medium text-white">{uploadResult.totalPages}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Chunks Stored</p>
                <p className="text-sm font-medium text-white">{uploadResult.chunksStored}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-white/[0.05] border border-white/10 text-zinc-300 rounded-xl font-medium hover:bg-white/[0.08] transition-colors"
            >
              Upload Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Upload Form ─────────────────────────────────────
  return (
    <div className="h-[calc(100vh-180px)] overflow-y-auto">
      <div className="max-w-lg mx-auto py-6">
        <div>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-600/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={28} className="text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Upload Document</h2>
            <p className="text-zinc-400 text-sm">
              Upload a PDF to start chatting, taking quizzes, and getting explanations.
            </p>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-red-500/60 bg-red-500/5'
                : selectedFile
                ? 'border-emerald-500/40 bg-emerald-500/5'
                : 'border-white/10 hover:border-red-500/30 hover:bg-white/[0.02]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div>
                <FileText size={40} className="mx-auto mb-3 text-emerald-400" />
                <p className="text-sm font-medium text-white">{selectedFile.name}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); handleReset(); }}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1 mx-auto transition-colors"
                >
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <div>
                <Upload size={40} className="mx-auto mb-3 text-zinc-600" />
                <p className="text-sm text-zinc-400">
                  <span className="font-semibold text-red-400">Click to browse</span> or drag &amp; drop
                </p>
                <p className="text-xs text-zinc-600 mt-1">PDF files only · shorter documents work best (free-tier limit)</p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !isUploading && (
            <button
              onClick={handleUpload}
              className="mt-6 w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Upload &amp; Process
            </button>
          )}

          {/* Uploading State */}
          {isUploading && (
            <div className="mt-6 text-center">
              <div className="w-full py-3 bg-red-600/10 border border-red-500/20 rounded-xl flex items-center justify-center gap-3">
                <Loader2 size={18} className="animate-spin text-red-400" />
                <span className="text-sm text-zinc-300 font-medium">
                  Processing PDF… extracting, chunking &amp; embedding. Larger files may take up to ~2 minutes — please keep this tab open.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadView;
