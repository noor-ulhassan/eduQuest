import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Plus, Trash2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const inputCls =
  "w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-sm focus:outline-none focus:border-indigo-500 resize-none";

function Field({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export function TextEditor({ block, onChange }) {
  const [tab, setTab] = useState("edit");
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
          Markdown content
        </label>
        <div className="flex gap-1">
          {["edit", "preview"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors capitalize ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      {tab === "edit" ? (
        <textarea
          className={inputCls}
          rows={6}
          value={block.content || ""}
          onChange={(e) => onChange({ ...block, content: e.target.value })}
          placeholder="Write markdown content…"
        />
      ) : (
        <div className="prose prose-zinc prose-invert max-w-none text-sm p-3 rounded-lg bg-black/30 border border-white/10 min-h-[120px]
          prose-p:text-zinc-300 prose-headings:text-white prose-strong:text-white
          prose-code:text-indigo-300 prose-code:bg-indigo-500/10 prose-code:px-1 prose-code:rounded
          prose-ul:text-zinc-300 prose-li:marker:text-indigo-400">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {block.content || "_No content yet_"}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}

export function CodeEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <Field label="Language">
        <input
          className={inputCls}
          value={block.language || ""}
          onChange={(e) => onChange({ ...block, language: e.target.value })}
          placeholder="python / javascript / …"
        />
      </Field>
      <Field label="Code">
        <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: 200 }}>
          <Editor
            height="200px"
            language={block.language || "python"}
            value={block.code || ""}
            onChange={(val) => onChange({ ...block, code: val || "" })}
            theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>
      </Field>
    </div>
  );
}

export function YoutubeEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <Field label="YouTube URL">
        <input
          className={inputCls}
          value={block.url || ""}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=…"
        />
      </Field>
      <Field label="Video title (optional)">
        <input
          className={inputCls}
          value={block.videoTitle || ""}
          onChange={(e) => onChange({ ...block, videoTitle: e.target.value })}
          placeholder="Title shown above the player"
        />
      </Field>
    </div>
  );
}

export function MermaidEditor({ block, onChange }) {
  return (
    <Field label="Mermaid diagram code">
      <textarea
        className={inputCls}
        rows={6}
        value={block.content || ""}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder={"graph LR\n  A --> B"}
      />
    </Field>
  );
}

export function ProTipEditor({ block, onChange }) {
  return (
    <Field label="Tip text">
      <textarea
        className={inputCls}
        rows={3}
        value={block.content || ""}
        onChange={(e) => onChange({ ...block, content: e.target.value })}
        placeholder="Write a pro tip…"
      />
    </Field>
  );
}

export function ConceptCardEditor({ block, onChange }) {
  return (
    <div className="space-y-2">
      <Field label="Title">
        <input
          className={inputCls}
          value={block.title || ""}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Concept title"
        />
      </Field>
      <Field label="Description">
        <textarea
          className={inputCls}
          rows={3}
          value={block.subtitle || ""}
          onChange={(e) => onChange({ ...block, subtitle: e.target.value })}
          placeholder="Short description"
        />
      </Field>
    </div>
  );
}

export function PlaygroundTaskEditor({ block, onChange }) {
  const testCases = block.testCases || [];

  const updateTestCase = (idx, field, value) => {
    const updated = testCases.map((tc, i) =>
      i === idx ? { ...tc, [field]: value } : tc,
    );
    onChange({ ...block, testCases: updated });
  };

  const addTestCase = () => {
    onChange({ ...block, testCases: [...testCases, { input: "", expectedOutput: "" }] });
  };

  const removeTestCase = (idx) => {
    onChange({ ...block, testCases: testCases.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-3">
      <Field label="Instruction">
        <textarea
          className={inputCls}
          rows={3}
          value={block.instruction || ""}
          onChange={(e) => onChange({ ...block, instruction: e.target.value })}
          placeholder="Describe what the student should build…"
        />
      </Field>
      <Field label="Starter code">
        <div className="rounded-lg overflow-hidden border border-white/10" style={{ height: 180 }}>
          <Editor
            height="180px"
            language="python"
            value={block.starterCode || ""}
            onChange={(val) => onChange({ ...block, starterCode: val || "" })}
            theme="vs-dark"
            options={{ fontSize: 13, minimap: { enabled: false }, scrollBeyondLastLine: false }}
          />
        </div>
      </Field>
      <Field label="Test cases">
        <div className="space-y-2">
          {testCases.map((tc, idx) => (
            <div key={idx} className="flex gap-2 items-start">
              <input
                className={`${inputCls} flex-1`}
                value={tc.input}
                onChange={(e) => updateTestCase(idx, "input", e.target.value)}
                placeholder="stdin input"
              />
              <input
                className={`${inputCls} flex-1`}
                value={tc.expectedOutput}
                onChange={(e) =>
                  updateTestCase(idx, "expectedOutput", e.target.value)
                }
                placeholder="expected stdout"
              />
              <button
                onClick={() => removeTestCase(idx)}
                className="text-zinc-600 hover:text-red-400 mt-2 shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button
            onClick={addTestCase}
            className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add test case
          </button>
        </div>
      </Field>
    </div>
  );
}

export function BlockEditorForType({ block, onChange }) {
  switch (block.type) {
    case "text":
      return <TextEditor block={block} onChange={onChange} />;
    case "code":
      return <CodeEditor block={block} onChange={onChange} />;
    case "youtube":
      return <YoutubeEditor block={block} onChange={onChange} />;
    case "mermaid":
      return <MermaidEditor block={block} onChange={onChange} />;
    case "pro-tip":
      return <ProTipEditor block={block} onChange={onChange} />;
    case "concept-card":
      return <ConceptCardEditor block={block} onChange={onChange} />;
    case "playground-task":
      return <PlaygroundTaskEditor block={block} onChange={onChange} />;
    default:
      return <p className="text-xs text-zinc-500">Unknown block type</p>;
  }
}
