import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, Clock } from 'lucide-react';
import { uploadApi } from '@/services/apiService';

function UploadView({ onUploadSuccess, allDocs = [], onSelectDocument, activeDocumentId }) {
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
      <div className="h-[calc(100vh-180px)] flex items-center justify-center animate-fade-in">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">Upload Successful!</h2>
          <p className="text-gray-600 mb-6">Your document has been processed and is ready for use.</p>

          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Document</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{uploadResult.fileName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Document ID</p>
                <p className="text-sm font-mono text-gray-700 mt-1 truncate">{uploadResult.documentId}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Pages</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{uploadResult.totalPages}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Chunks Stored</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{uploadResult.chunksStored}</p>
              </div>
              {uploadResult.chapters && uploadResult.chapters.length > 0 && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Chapters Detected</p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {uploadResult.chapters.join(', ')} ({uploadResult.chapters.length} total)
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleReset}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
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
      <div className="max-w-3xl mx-auto py-6">
        {/* Upload section */}
        <div className="max-w-lg mx-auto mb-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload size={32} className="text-indigo-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Upload Document</h2>
            <p className="text-gray-600">
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
                ? 'border-indigo-500 bg-indigo-50'
                : selectedFile
                ? 'border-green-300 bg-green-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
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
                <FileText size={40} className="mx-auto mb-3 text-green-600" />
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="mt-3 text-xs text-red-600 hover:text-red-700 flex items-center gap-1 mx-auto"
                >
                  <X size={14} /> Remove
                </button>
              </div>
            ) : (
              <div>
                <Upload size={40} className="mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-indigo-600">Click to browse</span> or drag & drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PDF files only, up to 50MB</p>
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && !isUploading && (
            <button
              onClick={handleUpload}
              className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              <Upload size={18} />
              Upload & Process
            </button>
          )}

          {/* Uploading State */}
          {isUploading && (
            <div className="mt-6 text-center">
              <div className="w-full py-3 bg-indigo-100 rounded-xl flex items-center justify-center gap-3">
                <Loader2 size={18} className="animate-spin text-indigo-600" />
                <span className="text-sm text-indigo-700 font-medium">
                  Processing PDF... Extracting text, chunking & embedding.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ─── Previously Uploaded Documents ─── */}
        {allDocs.length > 0 && (
          <div className="border-t border-gray-200 pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              Previously Uploaded Documents
            </h3>
            <div className="grid gap-3">
              {allDocs.map((doc) => {
                const isActive = doc.documentId === activeDocumentId;
                return (
                  <button
                    key={doc.documentId || doc._id}
                    onClick={() => onSelectDocument?.(doc)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isActive
                        ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
                        : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isActive ? 'bg-indigo-100' : 'bg-gray-100'
                          }`}
                        >
                          <FileText
                            size={18}
                            className={isActive ? 'text-indigo-600' : 'text-gray-500'}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {doc.fileName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {doc.totalPages} pages · {doc.chunksStored} chunks
                            {doc.uploadedAt &&
                              ` · ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                          </p>
                        </div>
                      </div>
                      {isActive && (
                        <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          Active
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadView;
