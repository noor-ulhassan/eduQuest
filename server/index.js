import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/dbConnect.js";
import userRoute from "./routes/user.route.js";
import authRoutes from "./routes/auth.routes.js";

// 1. Load Environment Variables First
dotenv.config({});

// 2. Initialize Express App (MUST be done before app.use)
const app = express();
const PORT = process.env.PORT || 3000;

// 3. Setup Directory Paths (ES6 Fix)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 4. Connect to Database
connectDB();

// 5. Apply Middlewares
// (Only configure CORS once. You had it twice.)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173", // Best practice: use env var
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"], // Fixed typo: 'Authorized' -> 'Authorization'
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 6. Static Folder for Uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 7. API Routes
app.use("/api/v1/user", userRoute);
// app.use("/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}`);
});
