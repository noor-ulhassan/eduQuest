import { count, error } from "console";
import Document from "../models/Document.js";
// import Flashcard from '../models/Flashcard.js';
// import Quiz from '../models/Quiz.js';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore } from "../database/dbConnect.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/**
 * Detect chapter number from page text using common heading patterns.
 * Returns the chapter number if found, or null.
 */
function detectChapterFromText(text) {
  const patterns = [
    /\bChapter\s+(\d+)/i,     // "Chapter 1", "chapter 12"
    /\bCh[\.\s]+(\d+)/i,      // "Ch. 1", "Ch 3"
    /^(\d+)\.\s+[A-Z]/m,      // "1. Introduction" at line start
    /\bUnit\s+(\d+)/i,        // "Unit 1"
    /\bModule\s+(\d+)/i,      // "Module 1"
    /\bPart\s+(\d+)/i,        // "Part 1"
    /\bSection\s+(\d+)/i,     // "Section 1"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

// @desc    Upload PDF document
// @route   POST /api/documents/upload
// @access  Private
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Please upload a PDF file",
        statusCode: 400,
      });
    }
    
    let filePath = req.file.path; // The temp file on your disk
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    // 1. Create an initial document record to get an ID
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: "pending", // Placeholder
      fileSize: req.file.size,
      status: "processing",
    });

    // 2. Load PDF pages with LangChain
    console.log("Step 1: Loading PDF with LangChain...");
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    
    // 3. Build chapter map
    let currentChapter = 1;
    const pageChapterMap = {};

    for (const doc of docs) {
      // Support both loc.pageNumber (1-indexed, newer LangChain) and page (0-indexed, older LangChain)
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

    // 4. Split into chunks
    console.log("Step 2: Splitting text into chunks...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 700,
      chunkOverlap: 100,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // 5. Enrich chunks with metadata
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

    // 6. Upload to Cloudinary
    console.log("Step 3: Uploading to Cloudinary...");
    const cloudinaryResponse = await uploadOnCloudinary(filePath);

    if (!cloudinaryResponse) {
      throw new Error("Failed to upload to Cloudinary");
    }

    // 7. Embed and store chunks in Vector Store
    console.log("Step 4: Storing chunks in Vector DB...");
    const vectorStore = getVectorStore();
    // We must send chunks in small batches to respect Google API Rate Limits
    const BATCH_SIZE = 50; // Keep this low for the free tier
    
    for (let i = 0; i < splitDocs.length; i += BATCH_SIZE) {
      const batch = splitDocs.slice(i, i + BATCH_SIZE);
      
      console.log(`⏳ Embedding batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(splitDocs.length / BATCH_SIZE)}...`);
      await vectorStore.addDocuments(batch);

      // Force the server to pause for 4 seconds between batches
      if (i + BATCH_SIZE < splitDocs.length) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
      }
    }

    // 8. Update document record with results
    const chaptersArr = [...new Set(Object.values(pageChapterMap))].sort((a, b) => a - b);
    
    document.filePath = cloudinaryResponse.secure_url;
    document.totalPages = docs.length;
    document.chunksStored = splitDocs.length;
    document.chapters = chaptersArr;
    document.status = "ready";
    await document.save();

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully.",
    });
  } catch (error) {
    next(error);
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
};

// @desc    Get all user documents
// @route   GET /api/documents
// @access  Private
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ userId: req.user._id })
      .select("_id title fileName fileSize filePath status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      error: error.message,
    });
  }
};

// @desc    Get single document with chunks
// @route   GET /api/documents/:id
// @access  Private
export const getDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }

    // Ensure user owns the document
    if (document.userId.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({
          success: false,
          error: "Not authorized to view this document",
        });
    }

    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }

    // Ensure user owns the document
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    // OPTIONAL: Delete from Cloudinary here if you want to be thorough
    // await cloudinary.uploader.destroy(public_id);

    await document.deleteOne();

    res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update document title
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Please provide a title" });
    }

    let document = await Document.findById(req.params.id);

    if (!document) {
      return res
        .status(404)
        .json({ success: false, error: "Document not found" });
    }

    // Ensure user owns the document
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized" });
    }

    document.title = title;
    await document.save();

    res.status(200).json({
      success: true,
      data: document,
      message: "Document updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
