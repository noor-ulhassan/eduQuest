import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { getVectorStore } from "../database/dbConnect.js";

/**
 * POST /api/rag/chat
 * Input:  { message, history[], documentId? }
 * Output: { answer, sources[] }
 */
export const chatWithDocument = async (req, res) => {
  try {
    const { message, history = [], documentId } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const vectorStore = getVectorStore();
    const filter = { userId: req.user._id.toString() };
    if (documentId) filter.documentId = documentId;


     const model = new ChatGoogleGenerativeAI({
      model: "gemini-flash-latest",
      apiKey: process.env.GEMINI_API_KEY,
    });

    const rewriteResponse = await model.invoke(
      `Rewrite this student question as a declarative statement that 
   would appear in a textbook. Return only the rewritten statement, nothing else.
   
   Question: "${message}"`,
    );
    // COMBINE the original message and the expanded concepts!
    const searchQuery = message + "\n" + rewriteResponse.content.trim();
    console.log(`🔍 Rewritten query: "${searchQuery}"`);

    let results;
    // try {
    //   results = await vectorStore.similaritySearch(message, 5, filter);
    // } catch (filterErr) {
    //   console.warn(
    //     "⚠️ Filtered search failed, falling back to unfiltered:",
    //     filterErr.message,
    //   );
    //   results = await vectorStore.similaritySearch(message, 5);
    // }
    // Inside chatWithDocument...

    // try {
    //   // 🚨 FIX: Use Max Marginal Relevance (MMR) to force diverse results
    //   // fetchK: 50 -> Grabs the top 50 semantic matches
    //   // k: 15 -> Filters them down to the 15 most diverse chunks
    //   results = await vectorStore.maxMarginalRelevanceSearch(searchQuery, {
    //     k: 15,
    //     fetchK: 50,
    //     filter: filter,
    //   });

    //   // --- 🚨 RAG REVIEW LOGGER 🚨 ---
    //   console.log("\n==================================================");
    //   console.log(`🗣️ USER QUERY: "${searchQuery}"`);
    //   console.log("==================================================");

    //   results.forEach((doc, index) => {
    //     console.log(
    //       `\n📄 MATCH #${index + 1} | Page: ${doc.metadata?.pageNumber}`,
    //     );
    //     console.log(`Text Preview: ${doc.pageContent.substring(0, 150)}...`);
    //   });
    //   console.log("==================================================\n");
    //   // ---------------------------------
    // } catch (filterErr) {
    //   console.warn("⚠️ Filtered search failed:", filterErr.message);
    //   // Fallback to MMR without filter
    //   results = await vectorStore.maxMarginalRelevanceSearch(message, {
    //     k: 15,
    //     fetchK: 50,
    //   });
    // }

    // Claude fix implement here:
    try {
      const rawResults = await vectorStore.similaritySearchWithScore(
        searchQuery,
        8,
        filter,
      );

      // Log scores so you can see what's happening
      console.log(
        "Scores:",
        rawResults.map(
          ([doc, score]) =>
            `Page ${doc.metadata?.pageNumber}: ${score.toFixed(4)}`,
        ),
      );

      // Use all 8 — don't threshold yet until chunk size is fixed
      results = rawResults.map(([doc]) => doc);

    } catch (filterErr) {
      console.warn("⚠️ Filtered search failed:", filterErr.message);
    }

    const context = results.map((d) => d.pageContent).join("\n\n");

    const historyText = history
      .slice(-6)
      .map(
        (h) => `${h.role === "user" ? "Student" : "Assistant"}: ${h.content}`,
      )
      .join("\n");

   

    const response = await model.invoke(
      `You are a helpful reading assistant for this textbook.
Answer based on the document context below. If the context contains related information, 
use it to give the best possible answer. Only say you couldn't find it if the context 
is completely unrelated to the question.
${historyText ? `Previous conversation:\n${historyText}\n` : ""}
Document Context:
${context}

Student's Question: ${message}`,
    );

    res.json({
      answer: response.content,
      sources: results.map((d) => ({
        text: d.pageContent.substring(0, 120) + "...",
        page: d.metadata?.pageNumber,
        chapter: d.metadata?.chapterNumber,
      })),
    });
  } catch (err) {
    console.error("❌ CHAT ERROR:", err);
    res.status(500).json({ error: "Chat failed: " + err.message });
  }
};

/**
 * POST /api/rag/explain
 * Input:  { selectedText, page?, documentId? }
 * Output: { explanation, sources[] }
 */
export const explainText = async (req, res) => {
  try {
    const { selectedText, page, documentId } = req.body;

    if (!selectedText) {
      return res.status(400).json({ error: "Selected text is required" });
    }

    const vectorStore = getVectorStore();
    const model = new ChatGoogleGenerativeAI({
      model: "gemini-flash-latest",
      apiKey: process.env.GEMINI_API_KEY,
    });

    const expandResponse = await model.invoke(
      `A student highlighted this text while reading a textbook: "${selectedText}"
  
  Generate a search query to find the background concepts, definitions, and 
  prerequisites that would help explain this text. Focus on the core technical 
  terms and concepts involved.
  Return only the search query, nothing else.`
    );
    const expandedQuery = expandResponse.content.trim();

    const semanticFilter = { userId: req.user._id.toString() };
    if (documentId) semanticFilter.documentId = documentId;

    let semanticResults = [];
    try {
      const rawResults = await vectorStore.similaritySearchWithScore(
        expandedQuery,
        6,
        semanticFilter,
      );

      console.log(
        "Explain scores:",
        rawResults.map(
          ([doc, score]) => `Page ${doc.metadata?.pageNumber}: ${score.toFixed(4)}`
        ),
      );

      semanticResults = rawResults.map(([doc]) => doc);
    } catch (filterErr) {
      console.error("🚨 Semantic filter failed:", filterErr.message);
      const raw = await vectorStore.similaritySearchWithScore(expandedQuery, 6);
      semanticResults = raw.map(([doc]) => doc);
    }

    const allChunks = [...semanticResults];
    const seenTexts = new Set(semanticResults.map((d) => d.pageContent));

    if (page) {
      const nearbyPages = [page - 1, page, page + 1];

      for (const p of nearbyPages) {
        const pFilter = { userId: req.user._id.toString(), pageNumber: p };
        if (documentId) pFilter.documentId = documentId;

        try {
          const r = await vectorStore.similaritySearch(selectedText, 2, pFilter);
          for (const doc of r) {
            if (!seenTexts.has(doc.pageContent)) {
              allChunks.push(doc);
              seenTexts.add(doc.pageContent);
            }
          }
        } catch {
          // this page has no chunks, skip
        }
      }
    }

    const context = allChunks.map((d) => d.pageContent).join("\n\n");

    const explanation = await model.invoke(
      `You are a reading companion helping a student understand a textbook passage.

The student highlighted this text on page ${page}:
"${selectedText}"

Here is surrounding context from the same section and related parts of the book:
${context}

Explain what the highlighted text means. 
- Start with a one-sentence plain-English summary of the core idea
- Then explain any technical terms used
- Give a real-world analogy if helpful
- Keep it under 200 words`
    );

    res.json({
      explanation: explanation.content,
      sources: allChunks.map((d) => ({
        text: d.pageContent.substring(0, 120) + "...",
        page: d.metadata?.pageNumber,
        chapter: d.metadata?.chapterNumber,
      })),
    });
  } catch (err) {
    console.error("❌ EXPLAIN ERROR:", err);
    res.status(500).json({ error: "Explain failed: " + err.message });
  }
};

/**
 * POST /api/rag/quiz/generate
 * Input:  { topic?, documentId? }
 * Output: { questions[], totalQuestions }
 */
export const generateQuiz = async (req, res) => {
  try {
    const { topic, documentId } = req.body;

    const vectorStore = getVectorStore();
    const filter = { userId: req.user._id.toString() };
    if (documentId) filter.documentId = documentId;

    const model = new ChatGoogleGenerativeAI({
      model: "gemini-flash-latest",
      apiKey: process.env.GEMINI_API_KEY,
    });

    let results = [];

    if (topic) {
      // Topic provided: rewrite it into textbook language, then focused search
      const rewriteResponse = await model.invoke(
        `Rewrite this topic as a detailed declarative statement using specific 
         technical terminology that would appear in a textbook.
         Include likely technical terms the answer would contain.
         Return only the rewritten statement, nothing else.
         
         Topic: "${topic}"`
      );
      const searchQuery = rewriteResponse.content.trim();
      console.log(`🔍 Quiz rewritten query: "${searchQuery}"`);

      try {
        const rawResults = await vectorStore.similaritySearchWithScore(
          searchQuery, 10, filter
        );
        console.log("Quiz scores:", rawResults.map(
          ([doc, score]) => `Page ${doc.metadata?.pageNumber}: ${score.toFixed(4)}`
        ));
        results = rawResults.map(([doc]) => doc);
      } catch (filterErr) {
        console.error("🚨 Quiz filter failed:", filterErr.message);
        const raw = await vectorStore.similaritySearchWithScore(searchQuery, 10);
        results = raw.map(([doc]) => doc);
      }

    } else {
      // No topic: use MMR to get diverse coverage across the whole document
      // This is the correct use case for MMR
      try {
        results = await vectorStore.maxMarginalRelevanceSearch(
          "key concepts definitions principles mechanisms examples",
          { k: 12, fetchK: 80, filter }
        );
        console.log("Quiz MMR pages:", results.map(
          (doc) => `Page ${doc.metadata?.pageNumber}`
        ));
      } catch (filterErr) {
        console.error("🚨 Quiz MMR filter failed:", filterErr.message);
        results = await vectorStore.maxMarginalRelevanceSearch(
          "key concepts definitions principles mechanisms examples",
          { k: 12, fetchK: 80 }
        );
      }
    }

    if (results.length === 0) {
      return res.status(404).json({
        error: "No document content found. Please upload a document first.",
      });
    }

    const context = results
      .map((d) => `[Page ${d.metadata.pageNumber}]:\n${d.pageContent}`)
      .join("\n\n");

    const response = await model.invoke(
      `You are a quiz generator for educational content.
Based on the following document context, generate exactly 5 multiple-choice questions.

CRITICAL: Respond with ONLY a valid JSON array. No markdown fences, no explanation, no extra text.

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
${context}`
    );

    let questions;
    try {
      let cleaned = response.content.trim();
      cleaned = cleaned
        .replace(/^```(?:json)?\s*\n?/i, "")
        .replace(/\n?\s*```$/i, "");
      questions = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("❌ Failed to parse quiz JSON:", response.content);
      return res.status(500).json({
        error: "AI returned invalid quiz format. Please try again.",
      });
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(500).json({ error: "Invalid quiz format returned" });
    }

    // Build lookup structures for server-side quote validation
    const allChunkText = results.map((d) => d.pageContent).join("\n\n");
    const chunksByPage = {};
    for (const chunk of results) {
      const p = chunk.metadata.pageNumber;
      if (!chunksByPage[p]) chunksByPage[p] = [];
      chunksByPage[p].push(chunk.pageContent);
    }

    questions = questions.map((q, i) => {
      const rawQuote = (q.exactQuote || "").trim();

      // If Gemini's quote exists verbatim in the retrieved chunks, keep it
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

      // Quote not found verbatim — extract the best sentence from the relevant chunks
      const targetChunks = chunksByPage[q.pageNumber] || Object.values(chunksByPage).flat();
      const combinedText = targetChunks.join(" ");

      // Split on sentence boundaries
      const sentences = combinedText
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 25 && s.length <= 150);

      // Score sentences by word overlap with the question
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

      console.log(`⚠️  Q${i + 1} quote not found verbatim; extracted fallback sentence.`);
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

    res.json({ questions, totalQuestions: questions.length });

  } catch (err) {
    console.error("❌ QUIZ ERROR:", err);
    res.status(500).json({ error: "Quiz generation failed: " + err.message });
  }
};
