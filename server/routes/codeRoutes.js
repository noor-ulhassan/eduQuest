import express from "express";
import { execFile } from "child_process";
import { promises as fsPromises } from "fs";
import path from "path";
import os from "os";
import rateLimit from "express-rate-limit";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

const executeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => req.user._id.toString(),
  message: { run: { output: "", stderr: "Too many execution requests, please slow down." } },
});

router.post("/execute", authenticate, executeLimiter, async (req, res) => {
  const { language, files } = req.body;

  if (!language || !files || !files.length) {
    return res
      .status(400)
      .json({ run: { output: "", stderr: "Missing language or files" } });
  }

  const code = files[0].content;

  let cmd;
  let ext;
  switch (language) {
    case "python":
      cmd = process.platform === "win32" ? "python" : "python3";
      ext = ".py";
      break;
    case "javascript":
      cmd = "node";
      ext = ".js";
      break;
    default:
      return res.status(400).json({
        run: { output: "", stderr: `Unsupported language: ${language}` },
      });
  }

  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `eduquest_${Date.now()}_${req.user._id}${ext}`);

  try {
    await fsPromises.writeFile(tmpFile, code, "utf8");

    const { stdout, stderr } = await new Promise((resolve) => {
      execFile(
        cmd,
        [tmpFile],
        { timeout: 10000, maxBuffer: 1024 * 512 },
        (error, stdout, stderr) => {
          if (error && error.killed) {
            resolve({ stdout: "", stderr: "Execution timed out (10s limit)" });
          } else {
            resolve({
              stdout: stdout || "",
              stderr: stderr || (error ? error.message : ""),
            });
          }
        },
      );
    });

    return res.json({ run: { output: stdout, stderr } });
  } catch (err) {
    return res.status(500).json({
      run: { output: "", stderr: `Server error: ${err.message}` },
    });
  } finally {
    fsPromises.unlink(tmpFile).catch(() => {});
  }
});

export default router;
