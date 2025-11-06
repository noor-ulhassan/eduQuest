import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./database/dbConnect.js";
import userRoute from "./routes/user.route.js";

dotenv.config({});

//call database connection here
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// default middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

//apis

app.use("/api/v1/user", userRoute);

app.listen(PORT, () => {
  console.log(`Server listen at port ${PORT}`);
});
