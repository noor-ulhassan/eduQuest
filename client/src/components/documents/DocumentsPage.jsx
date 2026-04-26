import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/features/auth/authApi';
import UploadView from './Upload/UploadView';
import ChatView from './Chat/ChatView';
import QuizView from './Quiz/QuizView';
import CompanionView from './Companion/CompanionView';
import {
  FileText, MessageSquare, HelpCircle, BookOpen,
  Plus, ArrowLeft, ChevronRight,
} from 'lucide-react';

// view: 'library' | 'upload' | 'options' | 'chat' | 'quiz' | 'companion'

function DocumentsPage() {
  const { id } = useParams();
  const [view, setView] = useState('library');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [allDocs, setAllDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all docs on mount
  useEffect(() => {
    api.get('/documents')
      .then((res) => {
        const docs = (res.data.data || []).map((d) => ({
          documentId: d._id,
          fileName: d.title,
          totalPages: d.totalPages,
          chunksStored: d.chunksStored,
          uploadedAt: d.uploadedAt || d.createdAt,
          filePath: d.filePath,
        }));
        setAllDocs(docs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // If navigated to /documents/:id, auto-select that doc
  useEffect(() => {
    if (!id) return;
    api.get(`/documents/${id}`)
      .then((res) => {
        const d = res.data.data;
        setSelectedDoc({ documentId: d._id, pdfUrl: d.filePath, fileName: d.title, totalPages: d.totalPages });
        setView('options');
      })
      .catch(() => {});
  }, [id]);

  const handleSelectDoc = (doc) => {
    api.get(`/documents/${doc.documentId}`)
      .then((res) => {
        const d = res.data.data;
        setSelectedDoc({ documentId: d._id, pdfUrl: d.filePath, fileName: d.title, totalPages: d.totalPages });
      })
      .catch(() => {
        setSelectedDoc({ documentId: doc.documentId, pdfUrl: null, fileName: doc.fileName });
      });
    setView('options');
  };

  const handleUploadSuccess = (result) => {
    const newDoc = {
      documentId: result.documentId,
      fileName: result.fileName,
      totalPages: result.totalPages,
      chunksStored: result.chunksStored,
      uploadedAt: new Date().toISOString(),
    };
    setAllDocs((prev) => [newDoc, ...prev]);
    setSelectedDoc({ documentId: result.documentId, pdfUrl: null, fileName: result.fileName });
    setView('options');
  };

  const goBack = () => {
    if (['chat', 'quiz', 'companion'].includes(view)) setView('options');
    else setView('library');
  };

  // ── Shared top bar ─────────────────────────────────────────────────────────
  function TopBar({ children }) {
    return (
      <div className="border-b border-gray-200 bg-white px-6 py-4 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <span className="text-gray-300">|</span>
        {children}
      </div>
    );
  }

  // ── Library ────────────────────────────────────────────────────────────────
  if (view === 'library') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
            <p className="text-sm text-gray-500 mt-1">
              Upload PDFs to chat, quiz, and explore with AI
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Upload new */}
            <button
              onClick={() => setView('upload')}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-400 transition-all h-44"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                <Plus size={24} />
              </div>
              <span className="text-sm font-semibold">Upload New Document</span>
            </button>

            {/* Skeleton */}
            {loading &&
              [0, 1].map((i) => (
                <div key={i} className="h-44 rounded-2xl bg-gray-200 animate-pulse" />
              ))}

            {/* Doc cards */}
            {!loading &&
              allDocs.map((doc) => (
                <button
                  key={doc.documentId}
                  onClick={() => handleSelectDoc(doc)}
                  className="group text-left p-5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all h-44 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <FileText size={20} className="text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {doc.totalPages ? `${doc.totalPages} pages` : 'PDF'}
                        {doc.uploadedAt
                          ? ` · ${new Date(doc.uploadedAt).toLocaleDateString()}`
                          : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {doc.chunksStored ? `${doc.chunksStored} chunks indexed` : ''}
                    </span>
                    <span className="text-xs text-indigo-600 font-medium flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ChevronRight size={12} />
                    </span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  if (view === 'upload') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopBar>
          <span className="text-sm font-medium text-gray-900">Upload Document</span>
        </TopBar>
        <div className="flex-1 p-6">
          <UploadView onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
    );
  }

  // ── Options (doc selected → pick feature) ─────────────────────────────────
  if (view === 'options') {
    const options = [
      {
        id: 'chat',
        label: 'Chat',
        description: 'Ask questions and get instant answers from your document',
        icon: MessageSquare,
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        hover: 'hover:border-indigo-300 hover:shadow-indigo-100',
      },
      {
        id: 'quiz',
        label: 'Quiz',
        description: 'Test your knowledge with AI-generated questions',
        icon: HelpCircle,
        bg: 'bg-emerald-100',
        text: 'text-emerald-600',
        hover: 'hover:border-emerald-300 hover:shadow-emerald-100',
      },
      {
        id: 'companion',
        label: 'Companion',
        description: 'Read the PDF with live AI explanations alongside',
        icon: BookOpen,
        bg: 'bg-violet-100',
        text: 'text-violet-600',
        hover: 'hover:border-violet-300 hover:shadow-violet-100',
      },
    ];

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <TopBar>
          <FileText size={15} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
            {selectedDoc?.fileName}
          </span>
        </TopBar>

        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-gray-900">What would you like to do?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Choose a mode to start working with this document
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
            {options.map(({ id, label, description, icon: Icon, bg, text, hover }) => (
              <button
                key={id}
                onClick={() => setView(id)}
                className={`flex flex-col items-center text-center gap-4 p-8 rounded-2xl border-2 border-gray-200 bg-white hover:shadow-lg transition-all ${hover}`}
              >
                <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center`}>
                  <Icon size={32} className={text} />
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Feature views ──────────────────────────────────────────────────────────
  const featureLabel = { chat: 'Chat', quiz: 'Quiz', companion: 'Companion' }[view];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <TopBar>
        <FileText size={15} className="text-gray-500" />
        <span className="text-sm font-medium text-gray-900 truncate max-w-xs">
          {selectedDoc?.fileName}
        </span>
        <span className="text-gray-300">|</span>
        <span className="text-sm text-gray-500">{featureLabel}</span>
      </TopBar>

      <div className="flex-1 overflow-hidden">
        {view === 'chat' && <ChatView documentId={selectedDoc?.documentId} />}
        {view === 'quiz' && <QuizView documentId={selectedDoc?.documentId} />}
        {view === 'companion' && (
          <CompanionView
            documentId={selectedDoc?.documentId}
            pdfUrl={selectedDoc?.pdfUrl}
          />
        )}
      </div>
    </div>
  );
}

export default DocumentsPage;
