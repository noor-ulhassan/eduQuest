import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { executeCode } from "../../../lib/piston";
import { Button } from "@/components/ui/button";
import { Code, Loader2, Play } from "lucide-react";

const ProgrammingEditor = ({ question, language, onSubmit, isSubmitting, answerResult }) => {
  const [code, setCode] = useState(question?.starterCode || "");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    setCode(question?.starterCode || "");
    setOutput(null);
  }, [question]);

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput(null);

    try {
      const codeToRun = code + "\n" + (question?.testCases || "");
      const result = await executeCode(language, codeToRun);

      let displayOutput = result.output || "";
      let testResult = null;

      if (displayOutput) {
        const lines = displayOutput.split("\n");
        const jsonLineIdx = lines.findIndex((l) =>
          l.trim().startsWith('{"success":'),
        );
        if (jsonLineIdx !== -1) {
          try {
            testResult = JSON.parse(lines[jsonLineIdx].trim());
            displayOutput = lines
              .filter((_, i) => i !== jsonLineIdx)
              .join("\n")
              .trim();
          } catch (e) {}
        }
      }

      setOutput({
        text: displayOutput,
        error: result.error || null,
        testResult,
      });

      if (testResult?.success) {
        onSubmit({ allPassed: true, code });
      }
    } catch (err) {
      setOutput({ text: "", error: err.message, testResult: null });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between shrink-0">
        <span className="text-xs text-zinc-500 uppercase font-semibold flex items-center gap-2">
          <Code size={14} className="text-zinc-600" />
          {language} Editor
        </span>
        <Button
          size="sm"
          onClick={handleRun}
          disabled={isRunning || isSubmitting}
          className="bg-green-600 hover:bg-green-500 disabled:bg-zinc-800 text-white h-8 text-xs font-semibold px-4 transition-all"
        >
          {isRunning ? (
            <Loader2 size={13} className="animate-spin mr-2" />
          ) : (
            <Play size={13} fill="currentColor" className="mr-2" />
          )}
          Run & Test
        </Button>
      </div>
      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => setCode(val || "")}
          theme="vs-dark"
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            padding: { top: 12 },
            fontFamily: "monospace",
          }}
        />
      </div>
      {output && (
        <div className="border-t border-zinc-800 p-3 bg-zinc-950 max-h-40 overflow-y-auto custom-scrollbar shrink-0">
          <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">
            Output Console
          </div>
          {output.text && (
            <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono">
              {output.text}
            </pre>
          )}
          {output.error && (
            <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono mt-1">
              {output.error}
            </pre>
          )}
          {output.testResult && (
            <div
              className={`mt-2 text-xs font-semibold p-2 rounded border ${
                output.testResult.success
                  ? "text-green-400 bg-green-500/10 border-green-500/20"
                  : "text-red-400 bg-red-500/10 border-red-500/20"
              }`}
            >
              {output.testResult.success
                ? "✓ All tests passed successfully!"
                : `✗ ${output.testResult.message || "Tests failed"}`}
            </div>
          )}
          {answerResult && (
            <div className="mt-2 text-xs font-semibold text-green-400 p-2 rounded bg-green-500/10 border border-green-500/20">
              +{answerResult.pointsEarned} XP Earned!
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProgrammingEditor;
