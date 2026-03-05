import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Bot,
  User as UserIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/features/auth/authApi";

/**
 * CourseMentor — A slide-in AI chat panel with full chapter context.
 *
 * Props:
 *  - courseId: string
 *  - chapterIndex: number
 *  - chapterName: string
 *  - onClose: () => void
 */
export default function CourseMentor({
  courseId,
  chapterIndex,
  chapterName,
  onClose,
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hey! 👋 I'm your AI mentor for **"${chapterName}"**. Ask me anything about this chapter — concepts, code, or clarifications. I'm here to help!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // Build history (exclude the initial greeting from context)
      const history = messages
        .filter((_, i) => i > 0)
        .map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          content: m.content,
        }));

      const res = await api.post(
        "http://localhost:8080/api/v1/ai/course-mentor-chat",
        {
          courseId,
          chapterIndex,
          message: trimmed,
          history,
        },
      );

      if (res.data.success) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.reply },
        ]);
      }
    } catch (error) {
      console.error("Mentor chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I had trouble processing that. Please try again! 🔁",
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-[420px] max-w-full z-[90] flex flex-col bg-white dark:bg-[#160d22] border-l border-slate-200 dark:border-[#8c2bee]/20 shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-[#8c2bee]/20 bg-[#8c2bee]/5 dark:bg-[#8c2bee]/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#8c2bee] flex items-center justify-center shadow-lg shadow-[#8c2bee]/30">
            <Bot className="text-white w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">AI Mentor</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
              {chapterName}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#8c2bee]/20"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row",
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                msg.role === "user"
                  ? "bg-[#8c2bee] text-white"
                  : "bg-emerald-500/20 text-emerald-500",
              )}
            >
              {msg.role === "user" ? (
                <UserIcon className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                msg.role === "user"
                  ? "bg-[#8c2bee] text-white rounded-tr-md"
                  : "bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-md border border-slate-200 dark:border-white/10",
              )}
            >
              {/* Simple markdown-like rendering: bold, code, newlines */}
              {msg.content.split("\n").map((line, li) => (
                <p key={li} className={li > 0 ? "mt-2" : ""}>
                  {line.split(/(\*\*.*?\*\*|`.*?`)/g).map((part, pi) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                      return <strong key={pi}>{part.slice(2, -2)}</strong>;
                    }
                    if (part.startsWith("`") && part.endsWith("`")) {
                      return (
                        <code
                          key={pi}
                          className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono"
                        >
                          {part.slice(1, -1)}
                        </code>
                      );
                    }
                    return <span key={pi}>{part}</span>;
                  })}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-1.5">
              <Loader2 className="w-4 h-4 animate-spin text-[#8c2bee]" />
              <span className="text-sm text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-200 dark:border-[#8c2bee]/20 bg-white dark:bg-[#160d22]">
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your mentor anything..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-[#8c2bee]/20 bg-slate-50 dark:bg-white/5 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8c2bee] text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
            className="p-3 rounded-xl bg-[#8c2bee] text-white hover:bg-[#7a1ed4] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#8c2bee]/30"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] text-slate-400 mt-2 text-center">
          AI responses are based on this chapter's content
        </p>
      </div>
    </div>
  );
}
