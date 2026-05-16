import express from "express";
import { execFile, spawn } from "child_process";
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

router.post("/run-task", authenticate, executeLimiter, async (req, res) => {
  const { language, code, testCases } = req.body;

  if (!language || !code || !Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({ testResults: [], error: "Missing required fields" });
  }

  let cmd, ext;
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
      return res.status(400).json({ testResults: [], error: `Unsupported language: ${language}` });
  }

  const runCode = (filePath, stdinInput) =>
    new Promise((resolve) => {
      if (stdinInput) {
        const child = spawn(cmd, [filePath], { timeout: 8000 });
        let out = "", err = "";
        child.stdout.on("data", (d) => (out += d));
        child.stderr.on("data", (d) => (err += d));
        child.stdin.write(stdinInput);
        child.stdin.end();
        child.on("close", () => resolve({ stdout: out, stderr: err }));
        child.on("error", (e) => resolve({ stdout: "", stderr: e.message }));
      } else {
        execFile(cmd, [filePath], { timeout: 8000, maxBuffer: 1024 * 256 }, (error, stdout, stderr) => {
          resolve({
            stdout: stdout || "",
            stderr: stderr || (error?.killed ? "Execution timed out" : error?.message || ""),
          });
        });
      }
    });

  const results = [];

  for (const tc of testCases) {
    const tmpFile = path.join(
      os.tmpdir(),
      `eq_task_${Date.now()}_${req.user._id}_${Math.random().toString(36).slice(2)}${ext}`
    );
    try {
      await fsPromises.writeFile(tmpFile, code, "utf8");
      const { stdout, stderr } = await runCode(tmpFile, tc.input || "");
      const actual = stdout.trim();
      const expected = (tc.expectedOutput || "").trim();
      results.push({
        input: tc.input || "",
        expectedOutput: expected,
        actualOutput: actual || stderr.trim(),
        passed: actual === expected,
      });
    } catch (err) {
      results.push({
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        actualOutput: err.message,
        passed: false,
      });
    } finally {
      fsPromises.unlink(tmpFile).catch(() => {});
    }
  }

  return res.json({ testResults: results });
});

export default router;
