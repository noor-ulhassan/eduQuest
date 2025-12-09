// src/services/documentService.js

// Mock data to simulate the documents you'd get from the server
const mockDocuments = [
  {
    _id: "doc1",
    title: "Project Proposal 2025",
    filename: "proposal_v1.pdf",
    uploadDate: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    size: 245000, // bytes
  },
  {
    _id: "doc2",
    title: "Client Meeting Notes Q3",
    filename: "client_notes_q3.docx",
    uploadDate: new Date().toISOString(), // Today
    size: 85000,
  },
];

/**
 * Mock function to simulate fetching documents from the backend.
 * It returns a Promise that resolves with mock data after a delay.
 */
const getDocuments = () => {
  return new Promise((resolve) => {
    // Simulate network delay of 500ms
    setTimeout(() => {
      resolve(mockDocuments);
    }, 500);
  });
};

/**
 * Mock function to simulate a document upload.
 * It resolves after a delay and simulates success.
 */
const uploadDocument = (title, file) => {
  console.log(`[MOCK] Uploading document: ${title} (${file.name})`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate the server returning the new document object
      const newDoc = {
        _id: `doc_${Date.now()}`,
        title: title,
        filename: file.name,
        uploadDate: new Date().toISOString(),
        size: file.size,
      };
      resolve(newDoc);
    }, 1000);
  });
};

/**
 * Mock function to simulate document deletion.
 */
const deleteDocument = (docId) => {
  console.log(`[MOCK] Deleting document with ID: ${docId}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate successful deletion
      resolve({ message: "Document deleted successfully (MOCK)" });
    }, 500);
  });
};

export default {
  getDocuments,
  uploadDocument,
  deleteDocument,
};
