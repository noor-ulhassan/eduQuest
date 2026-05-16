import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ReactPlayer from "react-player";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Terminal, Lightbulb, Server, Activity } from "lucide-react";
import MermaidDiagram from "./MermaidDiagram";

function TextBlock({ block }) {
  return (
    <div className="prose prose-zinc prose-invert max-w-none
      prose-p:text-lg prose-p:leading-relaxed prose-p:text-zinc-300
      prose-headings:font-space-grotesk prose-headings:text-white
      prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
      prose-a:text-red-400 prose-a:no-underline hover:prose-a:underline
      prose-strong:text-white prose-strong:font-semibold
      prose-code:text-red-300 prose-code:bg-red-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
      prose-pre:bg-[#111111] prose-pre:border prose-pre:border-white/10
      prose-ul:text-zinc-300 prose-li:marker:text-red-500">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {block.content || ""}
      </ReactMarkdown>
    </div>
  );
}

function CodeBlock({ block }) {
  return (
    <div className="rounded-xl overflow-hidden border border-white/10">
      <div className="px-4 py-2 bg-[#111111] border-b border-white/10 text-xs text-zinc-400 font-mono">
        {block.language || "code"}
      </div>
      <SyntaxHighlighter
        language={block.language || "text"}
        style={oneDark}
        customStyle={{ margin: 0, borderRadius: 0, fontSize: 14 }}
        showLineNumbers
      >
        {block.code || ""}
      </SyntaxHighlighter>
    </div>
  );
}

function YoutubeBlock({ block, idx }) {
  if (!block.url) return null;
  return (
    <div className="bg-[#111111] rounded-2xl border border-white/10 shadow-md shadow-black/50 overflow-hidden">
      {block.videoTitle && (
        <p className="text-sm font-bold text-red-400 px-5 pt-5 pb-3">
          Watch: {block.videoTitle}
        </p>
      )}
      <div className="aspect-video w-full">
        <ReactPlayer url={block.url} width="100%" height="100%" controls />
      </div>
    </div>
  );
}

function MermaidBlock({ block, chapterIndex, idx }) {
  return (
    <div className="bg-zinc-900/60 border border-white/10 rounded-2xl p-5">
      <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
        Concept Diagram
      </p>
      <MermaidDiagram
        diagram={block.content}
        id={`mermaid-br-${chapterIndex}-${idx}`}
      />
    </div>
  );
}

function ProTipBlock({ block }) {
  return (
    <div className="bg-gradient-to-r from-red-600/10 to-red-500/5 border-l-4 border-red-500 p-6 rounded-r-2xl shadow-md shadow-red-500/10">
      <div className="flex items-start gap-4">
        <Lightbulb className="text-red-400 w-8 h-8 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-red-400 text-sm uppercase tracking-wider mb-1">
            Pro Tip
          </h4>
          <p className="text-zinc-400">{block.content}</p>
        </div>
      </div>
    </div>
  );
}

function ConceptCardBlock({ block, idx }) {
  const Icon = idx % 2 === 0 ? Server : Activity;
  return (
    <div className="bg-[#111111] p-6 rounded-2xl border border-white/10 shadow-md shadow-black/50 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-red-500/30">
      <Icon className="text-red-400 mb-3 w-6 h-6" />
      <h5 className="font-bold mb-2">{block.title}</h5>
      <p className="text-sm text-zinc-400">{block.subtitle}</p>
    </div>
  );
}

function PlaygroundTaskBlock({ block, courseLanguage, onOpenInPlayground }) {
  return (
    <div className="bg-[#111111] border border-indigo-500/30 rounded-2xl p-6 shadow-md shadow-black/50">
      <div className="flex items-center gap-3 mb-4">
        <Terminal className="w-5 h-5 text-indigo-400" />
        <span className="text-sm font-bold text-indigo-400 uppercase tracking-wider">
          Coding Task
        </span>
      </div>
      <p className="text-zinc-300 text-base leading-relaxed mb-5">
        {block.instruction}
      </p>
      {block.starterCode && (
        <SyntaxHighlighter
          language={courseLanguage || "python"}
          style={oneDark}
          customStyle={{ borderRadius: 8, fontSize: 13, marginBottom: 16 }}
        >
          {block.starterCode}
        </SyntaxHighlighter>
      )}
      <button
        onClick={() => onOpenInPlayground(block)}
        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:-translate-y-0.5"
      >
        <Terminal className="w-4 h-4" />
        Open in Playground
      </button>
    </div>
  );
}

export default function BlockRenderer({ blocks, chapterIndex, courseLanguage, onOpenInPlayground }) {
  if (!blocks?.length) return null;

  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case "text":
            return <TextBlock key={block.id || idx} block={block} />;
          case "code":
            return <CodeBlock key={block.id || idx} block={block} />;
          case "youtube":
            return <YoutubeBlock key={block.id || idx} block={block} idx={idx} />;
          case "mermaid":
            return (
              <MermaidBlock
                key={block.id || idx}
                block={block}
                chapterIndex={chapterIndex}
                idx={idx}
              />
            );
          case "pro-tip":
            return <ProTipBlock key={block.id || idx} block={block} />;
          case "concept-card":
            return <ConceptCardBlock key={block.id || idx} block={block} idx={idx} />;
          case "playground-task":
            return (
              <PlaygroundTaskBlock
                key={block.id || idx}
                block={block}
                courseLanguage={courseLanguage}
                onOpenInPlayground={onOpenInPlayground}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
