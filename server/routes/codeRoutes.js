import express from "express";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

const router = express.Router();

router.post("/execute", async (req, res) => {
  const { language, version, files } = req.body;

  if (!language || !files || !files.length) {
    return res
      .status(400)
      .json({ run: { output: "", stderr: "Missing language or files" } });
  }

  const code = files[0].content;
  const fileName = files[0].name || "main.txt";

  // Map language to command
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

  // Write code to a temp file
  const tmpDir = os.tmpdir();
  const tmpFile = path.join(tmpDir, `eduquest_${Date.now()}${ext}`);

  try {
    fs.writeFileSync(tmpFile, code, "utf8");

    // Execute with a 10-second timeout
    execFile(
      cmd,
      [tmpFile],
      { timeout: 10000, maxBuffer: 1024 * 512 },
      (error, stdout, stderr) => {
        // Clean up temp file
        try {
          fs.unlinkSync(tmpFile);
        } catch {}

        if (error && error.killed) {
          return res.json({
            run: { output: "", stderr: "Execution timed out (10s limit)" },
          });
        }

        return res.json({
          run: {
            output: stdout || "",
            stderr: stderr || (error ? error.message : ""),
          },
        });
      },
    );
  } catch (err) {
    try {
      fs.unlinkSync(tmpFile);
    } catch {}
    return res.status(500).json({
      run: { output: "", stderr: `Server error: ${err.message}` },
    });
  }
});

export default router;
