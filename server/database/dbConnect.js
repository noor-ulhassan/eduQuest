import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ApiError } from "../utils/ApiError.js";

let vectorStore;
let chunksCollection;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Connect Native Client for LangChain Vector Store
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    // In Rag folder, you were using the "rag_db" database and "vector_chunks" collection.
    // We will point this exactly to the same database and collection where your index lives.
    // const db = client.db("rag_db");
    // const collection = db.collection("vector_chunks");
    const db = client.db("eduQuest");
    const collection = db.collection("document_chunks");
    chunksCollection = collection;

    const embeddings = new GoogleGenerativeAIEmbeddings({
      model: "gemini-embedding-2-preview",
      apiKey: process.env.GEMINI_API_KEY,
    });

    vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
      collection,
      indexName: "vector_index", // MUST MATCH ATLAS INDEX NAME
      textKey: "text",
      embeddingKey: "embedding",
    });
    console.log("LangChain Vector Store initialized");
  } catch (error) {
    // Fail loud: without the DB / vector store every RAG route is broken, so
    // don't let the server boot in a half-dead state.
    console.error("FATAL: failed to connect to database / vector store:", error);
    process.exit(1);
  }
};

export const getVectorStore = () => {
  if (!vectorStore)
    throw new ApiError(503, "Vector store not initialized yet. Please retry in a moment.");
  return vectorStore;
};
export const getChunksCollection = () => {
  if (!chunksCollection)
    throw new ApiError(503, "Database not initialized yet. Please retry in a moment.");
  return chunksCollection;
};
export default connectDB;
