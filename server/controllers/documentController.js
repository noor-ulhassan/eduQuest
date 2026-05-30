import Document from "../models/Document.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore, getChunksCollection } from "../database/dbConnect.js";
import fs from "fs/promises";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

function detectChapterFromText(text) {
  const patterns = [
    /\bChapter\s+(\d+)/i,
    /\bCh[\.\s]+(\d+)/i,
    /^(\d+)\.\s+[A-Z]/m,
    /\bUnit\s+(\d+)/i,
    /\bModule\s+(\d+)/i,
    /\bPart\s+(\d+)/i,
    /\bSection\s+(\d+)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

export const uploadDocument = asyncHandler(async (req, res) => {
  try {
    if (!req.file) throw new ApiError(400, "Please upload a PDF file");

    let filePath = req.file.path;
    const { title } = req.body;

    if (!title) throw new ApiError(400, "Please provide a document title");

    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: "pending",
      fileSize: req.file.size,
      status: "processing",
    });

    console.log("Step 1: Loading PDF with LangChain...");
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    let currentChapter = 1;
    const pageChapterMap = {};

    for (const doc of docs) {
      const pageNum =
        doc.metadata?.loc?.pageNumber ??
        (doc.metadata?.page != null ? doc.metadata.page + 1 : null) ??
        1;
      const detected = detectChapterFromText(doc.pageContent);
      if (detected !== null) {
        currentChapter = detected;
      }
      pageChapterMap[pageNum] = currentChapter;
    }

    console.log("Step 2: Splitting text into chunks...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 700,
      chunkOverlap: 100,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    splitDocs.forEach((doc, index) => {
      const pageNum =
        doc.metadata?.loc?.pageNumber ??
        (doc.metadata?.page != null ? doc.metadata.page + 1 : null) ??
        1;
      doc.metadata = {
        userId: req.user._id.toString(),
        documentId: document._id.toString(),
        chunkIndex: index,
        pageNumber: pageNum,
        chapterNumber: pageChapterMap[pageNum] || 1,
        fileName: req.file.originalname,
      };
    });

    console.log("Step 3: Uploading to Cloudinary...");
    const cloudinaryResponse = await uploadOnCloudinary(filePath);

    if (!cloudinaryResponse) {
      throw new Error("Failed to upload to Cloudinary");
    }

    console.log("Step 4: Storing chunks in Vector DB...");
    const vectorStore = getVectorStore();
    const BATCH_SIZE = 50;

    for (let i = 0; i < splitDocs.length; i += BATCH_SIZE) {
      const batch = splitDocs.slice(i, i + BATCH_SIZE);

      console.log(`⏳ Embedding batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(splitDocs.length / BATCH_SIZE)}...`);
      await vectorStore.addDocuments(batch);

      if (i + BATCH_SIZE < splitDocs.length) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    const chaptersArr = [...new Set(Object.values(pageChapterMap))].sort((a, b) => a - b);

    document.filePath = cloudinaryResponse.secure_url;
    document.cloudinaryPublicId = cloudinaryResponse.public_id;
    document.totalPages = docs.length;
    document.chunksStored = splitDocs.length;
    document.chapters = chaptersArr;
    document.status = "ready";
    await document.save();

    return res
      .status(201)
      .json(new ApiResponse(201, { data: document }, "Document uploaded successfully."));
  } finally {
    try {
      if (req.file?.path) {
        await fs.unlink(req.file.path);
        console.log(`Cleanup: Deleted local file ${req.file.path}`);
      }
    } catch (err) {
      if (err.code !== "ENOENT")
        console.error("Error deleting temp file:", err);
    }
  }
});

export const getDocuments = asyncHandler(async (req, res) => {
  const documents = await Document.find({ userId: req.user._id })
    .select("_id title fileName fileSize filePath status createdAt")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { count: documents.length, data: documents }),
  );
});

export const getDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) throw new ApiError(404, "Document not found");

  if (document.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "Not authorized to view this document");
  }

  return res.status(200).json(new ApiResponse(200, { data: document }));
});

export const deleteDocument = asyncHandler(async (req, res) => {
  const document = await Document.findById(req.params.id);

  if (!document) throw new ApiError(404, "Document not found");

  if (document.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "Not authorized");
  }

  const documentId = document._id.toString();

  // 1. Purge the embedded chunks from the vector collection so they don't
  //    linger as orphaned, still-searchable vectors after the doc is gone.
  let deletedChunks = 0;
  try {
    const chunks = getChunksCollection();
    if (chunks) {
      const result = await chunks.deleteMany({ documentId });
      deletedChunks = result.deletedCount || 0;
    }
  } catch (err) {
    console.error("Failed to delete vector chunks:", err.message);
  }

  // 2. Remove the original PDF from Cloudinary (best-effort; never blocks delete).
  //    Prefer the stored public_id; fall back to parsing the delivery URL for
  //    documents uploaded before that field existed.
  await deleteFromCloudinary(document.cloudinaryPublicId || document.filePath);

  // 3. Remove the document record itself.
  await document.deleteOne();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedChunks },
        "Document and all associated data deleted successfully",
      ),
    );
});

export const updateDocument = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) throw new ApiError(400, "Please provide a title");

  let document = await Document.findById(req.params.id);

  if (!document) throw new ApiError(404, "Document not found");

  if (document.userId.toString() !== req.user._id.toString()) {
    throw new ApiError(401, "Not authorized");
  }

  document.title = title;
  await document.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { data: document }, "Document updated successfully"));
});
