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
      extractedText: text,
      chunks: chunks,
      status: "ready",
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
  } finally {
    // --- CRITICAL CLEANUP ---
    // This block runs whether the upload succeeded OR failed.
    // It guarantees your server disk never fills up.
    try {
      await fs.unlink(filePath);
      console.log(`Cleanup: Deleted local file ${filePath}`);
    } catch (err) {
      // If file was already deleted or doesn't exist, ignore error
      if (err.code !== 'ENOENT') console.error("Error deleting temp file:", err);
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
      return res.status(404).json({ success: false, error: "Document not found" });
    }

    // Ensure user owns the document
    if (document.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, error: "Not authorized to view this document" });
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
      return res.status(404).json({ success: false, error: "Document not found" });
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
      return res.status(400).json({ success: false, error: "Please provide a title" });
    }

    let document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ success: false, error: "Document not found" });
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
      message: "Document updated successfully"
    });
  } catch (error) {
    next(error);
  }
};
