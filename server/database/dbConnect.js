import mongoose from "mongoose";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

let vectorStore;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    // Connect Native Client for LangChain Vector Store
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();

    // In Rag folder, you were using the "rag_db" database and "vector_chunks" collection.
    // We will point this exactly to the same database and collection where your index lives.
    const db = client.db("rag_db");
    const collection = db.collection("vector_chunks");

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
    console.log("Error connecting database", error);
  }
};

export const getVectorStore = () => vectorStore;
export default connectDB;
