import { useState, useEffect, useRef } from "react";
import { Send, Loader2, Trash2, Sparkles } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { chatApi } from "../../../services/ragApiService";

const WELCOME_MESSAGE =
  "Hello! I'm your reading companion. Ask me anything about this document — definitions, concepts, summaries, or anything else.";

function ChatView({ documentId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef(null);

  const storageKey = documentId ? `chat_history_${documentId}` : null;

  useEffect(() => {
    if (!documentId) return;
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try { setMessages(JSON.parse(stored)); return; } catch { /* fall through */ }
    }
    setMessages([{ id: 1, text: WELCOME_MESSAGE, isUser: false, sources: [] }]);
  }, [documentId, storageKey]);

  useEffect(() => {
    if (!storageKey || messages.length === 0) return;
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setMessages((prev) => [...prev, { id: Date.now(), text: userMessage, isUser: true, sources: [] }]);
    setIsLoading(true);

    try {
      const { answer, sources = [] } = await chatApi.sendMessage({
        message: userMessage,
        history: messages.map((m) => ({ role: m.isUser ? "user" : "assistant", content: m.text })),
        documentId,
      });
      setMessages((prev) => [...prev, { id: Date.now(), text: answer, isUser: false, sources }]);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now(), text: "Something went wrong. Please try again.", isUser: false, sources: [], isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleTextareaInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleClear = () => {
    const fresh = [{ id: Date.now(), text: WELCOME_MESSAGE, isUser: false, sources: [] }];
    setMessages(fresh);
    if (storageKey) localStorage.setItem(storageKey, JSON.stringify(fresh));
  };

  return (
    <div className="flex flex-col h-full bg-[#111111] rounded-2xl border border-white/10 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">Document Assistant</span>
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
        >
          <Trash2 size={12} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg.text}
            isUser={msg.isUser}
            sources={msg.sources}
            isError={msg.isError}
          />
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border border-white/10 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-xs text-zinc-500">AI is thinking…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 flex-shrink-0">
        <div className="flex gap-3 items-end bg-[#1a1a1a] rounded-xl border border-white/10 focus-within:border-red-500/40 px-4 py-3 transition-colors">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onInput={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about this document…"
            disabled={isLoading}
            className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 resize-none focus:outline-none leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="w-8 h-8 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-opacity flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
        <p className="text-xs text-zinc-700 mt-1.5 ml-1">Shift+Enter for new line</p>
      </div>

    </div>
  );
}

export default ChatView;
