import { count, error } from "console";
import Document from "../models/Document.js";
// import Flashcard from '../models/Flashcard.js';
// import Quiz from '../models/Quiz.js';
import { extractTextFromPDF } from "../utils/pdfParser.js";
import { chunkText } from "../utils/textChunker.js";
import fs from "fs/promises";
import mongoose from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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
    // console.log("Uploaded file:", req.file);
    const filePath = req.file.path; // The temp file on your disk

    const { title } = req.body;

    if (!title) {
      // Delete uploaded file if no title provided
      await fs.unlink(req.file.path);
      return res.status(400).json({
        success: false,
        error: "Please provide a document title",
        statusCode: 400,
      });
    }

    //  UPLOAD TO CLOUDINARY
    // console.log("Step 1: Uploading to Cloudinary...");
    const cloudinaryResponse = await uploadOnCloudinary(filePath);

    if (!cloudinaryResponse) {
      throw new Error("Failed to upload to Cloudinary");
    }
    // console.log("Upload Success. URL:", cloudinaryResponse.secure_url);

    // --- STEP 2: EXTRACT TEXT (Sequential) ---
    // We do this AFTER upload succeeds. If upload fails, this never runs.
    console.log("Step 2: Extracting text...");
    const { text } = await extractTextFromPDF(filePath);

    // --- STEP 3: CHUNK TEXT ---
    const chunks = chunkText(text, 500, 50);

    // Create document record
    const document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: cloudinaryResponse.secure_url, // Store the Cloud URL
      fileSize: req.file.size,
      status: "processing",
    });
    // Process PDF in background (in production, use a queue like Bull)
    processPDF(document._id, req.file.path).catch((err) => {
      console.error("PDF processing error:", err);
    });

    res.status(201).json({
      success: true,
      data: document,
      message: "Document uploaded successfully. Processing in progress...",
    });
  } catch (error) {
    // Clean up file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    next(error);
  }
};
// Helper function to process PDF
const processPDF = async (documentId, filePath) => {
  try {
    const { text } = await extractTextFromPDF(filePath);

    // Create chunks
    const chunks = chunkText(text, 500, 50);

    // Update document
    await Document.findByIdAndUpdate(documentId, {
      extractedText: text,
      chunks: chunks,
      status: "ready",
    });
    console.log(
      `Document ${documentId} processed successfully with ${chunks.length} chunks.`,
    );
    // console.log(`Document ${documentId} processed successfully`);
    // console.log(`Extracted ${chunks.length} chunks for document ${documentId}`);
    // console.log(`Extracted text length: ${text.length} characters`);
    // console.log(`Sample chunk content: ${chunks[0]?.content.slice(0, 100)}...`);
    // console.log(`CoMPLETE CHUNKS VARIABLE IS :  ------------->>>> ${JSON.stringify(chunks)}`);
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
    await Document.findByIdAndUpdate(documentId, {
      status: "failed",
    });
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
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
export const deleteDocument = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};

// @desc    Update document title
// @route   PUT /api/documents/:id
// @access  Private
export const updateDocument = async (req, res, next) => {
  try {
  } catch (error) {
    next(error);
  }
};
