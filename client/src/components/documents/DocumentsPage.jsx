import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '@/features/auth/authApi';
import Layout from './Layout/Layout';
import UploadView from './Upload/UploadView';
import ChatView from './Chat/ChatView';
import QuizView from './Quiz/QuizView';
import CompanionView from './Companion/CompanionView';

function DocumentsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(id ? 'chat' : 'upload');
  const [activeDocument, setActiveDocument] = useState(null);
  const [allDocs, setAllDocs] = useState([]);

  useEffect(() => {
    api.get('/documents')
      .then((res) => {
        const docs = (res.data.data || []).map((d) => ({
          documentId: d._id,
          fileName: d.title,
          totalPages: null,
          chunksStored: null,
          uploadedAt: d.createdAt,
        }));
        setAllDocs(docs);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) return;
    api.get(`/documents/${id}`)
      .then((res) => {
        const d = res.data.data;
        setActiveDocument({ documentId: d._id, pdfUrl: d.filePath, fileName: d.title });
      })
      .catch(() => {});
  }, [id]);

  const handleUploadSuccess = (result) => {
    setActiveDocument({ documentId: result.documentId, pdfUrl: null, fileName: result.fileName });
    setAllDocs((prev) => [result, ...prev]);
    setActiveTab('chat');
  };

  const handleSelectDocument = (doc) => {
    api.get(`/documents/${doc.documentId}`)
      .then((res) => {
        const d = res.data.data;
        setActiveDocument({ documentId: d._id, pdfUrl: d.filePath, fileName: d.title });
      })
      .catch(() => {
        setActiveDocument({ documentId: doc.documentId, pdfUrl: null, fileName: doc.fileName });
      });
    setActiveTab('chat');
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab} documentName={activeDocument?.fileName}>
      {activeTab === 'upload' && (
        <UploadView
          onUploadSuccess={handleUploadSuccess}
          allDocs={allDocs}
          onSelectDocument={handleSelectDocument}
          activeDocumentId={activeDocument?.documentId}
        />
      )}
      {activeTab === 'chat' && <ChatView documentId={activeDocument?.documentId} />}
      {activeTab === 'quiz' && <QuizView documentId={activeDocument?.documentId} />}
      {activeTab === 'companion' && (
        <CompanionView documentId={activeDocument?.documentId} pdfUrl={activeDocument?.pdfUrl} />
      )}
    </Layout>
  );
}

export default DocumentsPage;
