import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/dbConnect.js";
import userRoute from "./routes/user.routes.js";
import aiRoute from "./routes/aiRoutes.js";
import authRoute from "./routes/auth.routes.js";
import documentRoute from "./routes/documentRoutes.js";
import quizRoute from "./routes/quizRoutes.js";
import playgroundRoute from "./routes/playgroundRoutes.js";
import leaderboardRoute from "./routes/leaderboardRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import competitionRoutes from "./routes/competitionRoutes.js";
import { initializeSocket } from "./socket/roomHandler.js";

// 1. Load Environment Variables First
dotenv.config({});

// 2. Initialize Express App + HTTP Server + Socket.io
const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT;

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Initialize Socket.io handlers
initializeSocket(io);

// 4. Connect to Database
connectDB();
// 5. Apply Middlewares

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 6. Static Folder for Uploads

// 7. API Routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/ai", aiRoute);
app.use("/api/v1/documents", documentRoute);
app.use("/api/v1/quiz", quizRoute);
app.use("/api/v1/playground", playgroundRoute);
app.use("/api/v1/leaderboard", leaderboardRoute);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/competition", competitionRoutes);

httpServer.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
