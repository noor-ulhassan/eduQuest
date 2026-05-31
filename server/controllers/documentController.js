import Document from "../models/Document.js";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { getVectorStore, getChunksCollection } from "../database/dbConnect.js";
import fs from "fs/promises";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Detects non-content chunks: title page, table of contents, alphabetical
// index, bibliography, acknowledgement name-lists. These are keyword-dense
// fragments with no real sentences — they otherwise outrank actual prose in
// vector search and pollute chat/quiz/explain. Real prose almost always has at
// least one sentence-ending period per ~570-char chunk; these lists have none.
function isLowValueChunk(text) {
  const t = (text || "").trim();
  if (t.length < 50) return true;

  const words = t.split(/\s+/).filter(Boolean);
  if (words.length < 12) return true;

  const sentenceEnders = (t.match(/[.!?](\s|$)/g) || []).length;
  if (sentenceEnders > 0) return false;

  const commaRatio = (t.match(/,/g) || []).length / words.length;
  const digitRatio = (t.match(/\d/g) || []).length / t.length;
  return commaRatio >= 0.08 || digitRatio >= 0.1;
}

// Free-tier embedding budget is ~100 requests/minute, counted PER TEXT. So a
// batch of <=90 texts fits inside one minute's window; bigger docs are paced
// one batch per minute. MAX_CHUNKS keeps a single upload to a few minutes.
const BATCH_SIZE = 90;
const MAX_CHUNKS = 270; // ~3 batches ≈ ≤2 min upload
const PACE_MS = 60000; // wait out the per-minute window between batches

export const uploadDocument = asyncHandler(async (req, res) => {
  let document = null;

  try {
    if (!req.file) throw new ApiError(400, "Please upload a PDF file");
    const { title } = req.body;
    if (!title) throw new ApiError(400, "Please provide a document title");

    const filePath = req.file.path;

    console.log("Step 1: Loading PDF with LangChain...");
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();

    console.log("Step 2: Splitting text into chunks...");
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 700,
      chunkOverlap: 100,
    });
    const splitDocs = await splitter.splitDocuments(docs);

    // Drop non-content chunks (title/TOC/index/bibliography/acknowledgements)
    // so they don't pollute retrieval across chat, quiz, and explain.
    const contentDocs = splitDocs.filter((d) => !isLowValueChunk(d.pageContent));
    console.log(
      `Filtered ${splitDocs.length - contentDocs.length} low-value chunks; ${contentDocs.length} remain.`,
    );

    if (contentDocs.length === 0) {
      throw new ApiError(
        400,
        "No readable text found. Scanned or image-only PDFs aren't supported — please upload a text-based PDF.",
      );
    }
    if (contentDocs.length > MAX_CHUNKS) {
      throw new ApiError(
        413,
        `This PDF is too large for the demo's free-tier limit (${contentDocs.length} chunks; max ${MAX_CHUNKS}). Please upload a shorter document.`,
      );
    }

    document = await Document.create({
      userId: req.user._id,
      title,
      fileName: req.file.originalname,
      filePath: "pending",
      fileSize: req.file.size,
      status: "processing",
    });

    contentDocs.forEach((doc, index) => {
      const pageNum =
        doc.metadata?.loc?.pageNumber ??
        (doc.metadata?.page != null ? doc.metadata.page + 1 : null) ??
        1;
      doc.metadata = {
        userId: req.user._id.toString(),
        documentId: document._id.toString(),
        chunkIndex: index,
        pageNumber: pageNum,
        fileName: req.file.originalname,
      };
    });

    console.log("Step 3: Uploading to Cloudinary...");
    const cloudinaryResponse = await uploadOnCloudinary(filePath);
    if (!cloudinaryResponse) throw new ApiError(500, "Failed to upload file to storage.");

    console.log("Step 4: Embedding + storing chunks...");
    const vectorStore = getVectorStore();
    const totalBatches = Math.ceil(contentDocs.length / BATCH_SIZE);

    for (let i = 0; i < contentDocs.length; i += BATCH_SIZE) {
      const batch = contentDocs.slice(i, i + BATCH_SIZE);
      console.log(`⏳ Embedding batch ${Math.floor(i / BATCH_SIZE) + 1} of ${totalBatches} (${batch.length} chunks)...`);

      // Embed explicitly so a rate-limit (429) surfaces instead of being
      // silently stored as empty vectors (LangChain returns [] on failure).
      const vectors = await vectorStore.embeddings.embedDocuments(
        batch.map((d) => d.pageContent),
      );
      if (vectors.some((v) => !v || v.length === 0)) {
        throw new ApiError(
          429,
          "Embedding rate limit reached. Your document was not saved — please wait about a minute and try again.",
        );
      }
      await vectorStore.addVectors(vectors, batch);

      // Pace under the free-tier per-minute limit before the next batch.
      if (i + BATCH_SIZE < contentDocs.length) {
        await new Promise((resolve) => setTimeout(resolve, PACE_MS));
      }
    }

    document.filePath = cloudinaryResponse.secure_url;
    document.cloudinaryPublicId = cloudinaryResponse.public_id;
    document.totalPages = docs.length;
    document.chunksStored = contentDocs.length;
    document.status = "ready";
    await document.save();

    return res
      .status(201)
      .json(new ApiResponse(201, { data: document }, "Document uploaded successfully."));
  } catch (err) {
    // Roll everything back so we never leave a stuck "processing" document or
    // orphaned/empty chunks: purge chunks, the Cloudinary file, and the record.
    if (document?._id) {
      const id = document._id.toString();
      try {
        const chunks = getChunksCollection();
        if (chunks) await chunks.deleteMany({ documentId: id });
      } catch (e) {
        console.error("Rollback: chunk cleanup failed:", e.message);
      }
      if (document.cloudinaryPublicId || (document.filePath && document.filePath !== "pending")) {
        await deleteFromCloudinary(document.cloudinaryPublicId || document.filePath);
      }
      await Document.deleteOne({ _id: document._id }).catch(() => {});
    }
    throw err;
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
