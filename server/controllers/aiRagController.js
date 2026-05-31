import { getVectorStore, getChunksCollection } from "../database/dbConnect.js";
import { callAiModel } from "../config/aiProvider.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const chatWithDocument = asyncHandler(async (req, res) => {
  const { message, history = [], documentId } = req.body;

  if (!message) throw new ApiError(400, "Message is required");

  const vectorStore = getVectorStore();
  const filter = { userId: req.user._id.toString() };
  if (documentId) filter.documentId = documentId;

  const rewriteResponse = await callAiModel(
    `Rewrite this student question as a declarative statement that
   would appear in a textbook. Return only the rewritten statement, nothing else.

   Question: "${message}"`,
    { json: false },
  );
  const searchQuery = message + "\n" + rewriteResponse.trim();

  let results;
  try {
    const rawResults = await vectorStore.similaritySearchWithScore(
      searchQuery,
      8,
      filter,
    );

    results = rawResults.map(([doc]) => doc);
  } catch (filterErr) {
    console.warn("Filtered search failed:", filterErr.message);
  }

  const context = results.map((d) => d.pageContent).join("\n\n");

  const historyText = history
    .slice(-6)
    .map(
      (h) => `${h.role === "user" ? "Student" : "Assistant"}: ${h.content}`,
    )
    .join("\n");

  const answer = await callAiModel(
    `You are a helpful reading assistant for this textbook.
Answer based on the document context below. If the context contains related information,
use it to give the best possible answer. Only say you couldn't find it if the context
is completely unrelated to the question.
${historyText ? `Previous conversation:\n${historyText}\n` : ""}
Document Context:
${context}

Student's Question: ${message}`,
    { json: false },
  );

  return res.json(
    new ApiResponse(200, {
      answer,
      sources: results.map((d) => ({
        text: d.pageContent.substring(0, 120) + "...",
        page: d.metadata?.pageNumber,
        chapter: d.metadata?.chapterNumber,
      })),
    }),
  );
});

export const explainText = asyncHandler(async (req, res) => {
  const { selectedText, page, documentId } = req.body;

  if (!selectedText) throw new ApiError(400, "Selected text is required");

  const vectorStore = getVectorStore();

  const expandResponse = await callAiModel(
    `A student highlighted this text while reading a textbook: "${selectedText}"

  Generate a search query to find the background concepts, definitions, and
  prerequisites that would help explain this text. Focus on the core technical
  terms and concepts involved.
  Return only the search query, nothing else.`,
    { json: false },
  );
  const expandedQuery = expandResponse.trim();

  const semanticFilter = { userId: req.user._id.toString() };
  if (documentId) semanticFilter.documentId = documentId;

  let semanticResults = [];
  try {
    const rawResults = await vectorStore.similaritySearchWithScore(
      expandedQuery,
      6,
      semanticFilter,
    );

    semanticResults = rawResults.map(([doc]) => doc);
  } catch (filterErr) {
    const raw = await vectorStore.similaritySearchWithScore(expandedQuery, 6);
    semanticResults = raw.map(([doc]) => doc);
  }

  const allChunks = [...semanticResults];
  const seenTexts = new Set(semanticResults.map((d) => d.pageContent));

  // Pull the chunks physically around the highlighted page straight from the
  // collection. A vector search filtered to a single page returns nothing on
  // Atlas (ANN explores a candidate pool before filtering, and a page's 2-3
  // chunks fall outside it), so this is a plain metadata lookup instead.
  if (page && documentId) {
    const chunks = getChunksCollection();
    if (chunks) {
      const nearby = await chunks
        .find({
          userId: req.user._id.toString(),
          documentId,
          pageNumber: { $in: [page - 1, page, page + 1] },
        })
        .project({ text: 1, pageNumber: 1, chapterNumber: 1 })
        .toArray();

      for (const doc of nearby) {
        if (!seenTexts.has(doc.text)) {
          allChunks.push({
            pageContent: doc.text,
            metadata: { pageNumber: doc.pageNumber, chapterNumber: doc.chapterNumber },
          });
          seenTexts.add(doc.text);
        }
      }
    }
  }

  const context = allChunks.map((d) => d.pageContent).join("\n\n");

  const explanation = await callAiModel(
    `You are a reading companion helping a student understand a textbook passage.

The student highlighted this text on page ${page}:
"${selectedText}"

Here is surrounding context from the same section and related parts of the book:
${context}

Explain what the highlighted text means.
- Start with a one-sentence plain-English summary of the core idea
- Then explain any technical terms used
- Give a real-world analogy if helpful
- Keep it under 200 words`,
    { json: false },
  );

  return res.json(
    new ApiResponse(200, {
      explanation,
      sources: allChunks.map((d) => ({
        text: d.pageContent.substring(0, 120) + "...",
        page: d.metadata?.pageNumber,
        chapter: d.metadata?.chapterNumber,
      })),
    }),
  );
});

export const generateQuiz = asyncHandler(async (req, res) => {
  const { topic, documentId } = req.body;

  const vectorStore = getVectorStore();
  const filter = { userId: req.user._id.toString() };
  if (documentId) filter.documentId = documentId;

  let results = [];

  if (topic) {
    const rewriteResponse = await callAiModel(
      `Rewrite this topic as a detailed declarative statement using specific
         technical terminology that would appear in a textbook.
         Include likely technical terms the answer would contain.
         Return only the rewritten statement, nothing else.

         Topic: "${topic}"`,
      { json: false },
    );
    const searchQuery = rewriteResponse.trim();

    try {
      const rawResults = await vectorStore.similaritySearchWithScore(
        searchQuery, 10, filter
      );
      results = rawResults.map(([doc]) => doc);
    } catch (filterErr) {
      const raw = await vectorStore.similaritySearchWithScore(searchQuery, 10);
      results = raw.map(([doc]) => doc);
    }
  } else {
    try {
      results = await vectorStore.maxMarginalRelevanceSearch(
        "key concepts definitions principles mechanisms examples",
        { k: 12, fetchK: 80, filter }
      );
    } catch (filterErr) {
      results = await vectorStore.maxMarginalRelevanceSearch(
        "key concepts definitions principles mechanisms examples",
        { k: 12, fetchK: 80 }
      );
    }
  }

  if (results.length === 0) {
    throw new ApiError(404, "No document content found. Please upload a document first.");
  }

  const context = results
    .map((d) => `[Page ${d.metadata.pageNumber}]:\n${d.pageContent}`)
    .join("\n\n");

  let questions = await callAiModel(
    `You are a quiz generator for educational content.
Based on the following document context, generate exactly 5 multiple-choice questions.

Return ONLY a valid JSON array.

Each question object must have exactly this structure:
[
  {
    "question": "Clear question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this answer is correct based on the document",
    "exactQuote": "one complete sentence copied character-for-character from the context",
    "pageNumber": 3
  }
]

Rules:
- Each question must have exactly 4 options
- Only ONE option is correct (indicated by correctIndex, 0-based)
- Questions must test UNDERSTANDING, not just memorization
- Wrong options must be plausible, not obviously wrong
- Each question must come from a DIFFERENT part of the context
- exactQuote: copy ONE complete sentence (30–120 characters) CHARACTER-BY-CHARACTER from the context — zero modifications to spelling, punctuation, capitalisation, or spacing. Do not combine sentences or add/remove words.
- pageNumber must be the exact number from the [Page X] label that precedes the chunk you used
- Do not generate questions if the context lacks enough information on a topic

Document Context:
${context}`,
  );

  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(500, "Invalid quiz format returned");
  }

  const allChunkText = results.map((d) => d.pageContent).join("\n\n");
  const chunksByPage = {};
  for (const chunk of results) {
    const p = chunk.metadata.pageNumber;
    if (!chunksByPage[p]) chunksByPage[p] = [];
    chunksByPage[p].push(chunk.pageContent);
  }

  questions = questions.map((q, i) => {
    const rawQuote = (q.exactQuote || "").trim();

    if (rawQuote.length >= 15 && allChunkText.includes(rawQuote)) {
      return {
        id: i + 1,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        explanation: q.explanation || "",
        exactQuote: rawQuote,
        pageNumber: q.pageNumber || null,
      };
    }

    const targetChunks = chunksByPage[q.pageNumber] || Object.values(chunksByPage).flat();
    const combinedText = targetChunks.join(" ");

    const sentences = combinedText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 25 && s.length <= 150);

    const qWords = new Set(
      q.question.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    );
    let bestSentence = sentences[0] || rawQuote || "";
    let bestScore = 0;
    for (const sentence of sentences) {
      const score = sentence.toLowerCase().split(/\W+/).filter((w) => qWords.has(w)).length;
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence;
      }
    }

    return {
      id: i + 1,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation || "",
      exactQuote: bestSentence,
      pageNumber: q.pageNumber || null,
    };
  });

  return res.json(
    new ApiResponse(200, { questions, totalQuestions: questions.length }),
  );
});
