import api from '@/features/auth/authApi';

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
