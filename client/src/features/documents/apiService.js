import api from '@/features/auth/authApi';

export const getDocuments = async () => {
  const res = await api.get("/documents");
  return (res.data.data || []).map((d) => ({
    documentId: d._id,
    fileName: d.title,
    totalPages: d.totalPages,
    chunksStored: d.chunksStored,
    uploadedAt: d.uploadedAt || d.createdAt,
    filePath: d.filePath,
  }));
};

export const getDocumentById = async (id) => {
  const res = await api.get(`/documents/${id}`);
  const d = res.data.data;
  return {
    documentId: d._id,
    pdfUrl: d.filePath,
    fileName: d.title,
    totalPages: d.totalPages,
  };
};

export const uploadApi = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const doc = res.data.data;
    return {
      documentId: doc._id,
      fileName: doc.title,
      totalPages: null,
      chunksStored: null,
      chapters: [],
      uploadedAt: doc.createdAt,
    };
  },
};
