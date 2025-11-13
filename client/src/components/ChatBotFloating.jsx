import React, { useState, useEffect, useRef } from "react";

function ChatBotFloating() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", text: "Hi! Ask me anything…" },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setLoading(true);

    try {
      const resp = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: input }] }],
          }),
        }
      );

      const data = await resp.json();
      console.log("Gemini raw response:", data);

      let replyText =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.output ||
        data?.text ||
        data?.error?.message ||
        "Sorry, I couldn’t understand that.";

      const botMsg = { role: "bot", text: replyText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Network error. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 ">
      {open && (
        <div
          className="bg-gradient-to-br from-white/80 to-gray-100 dark:from-[#1E1E1E] dark:to-[#2A2A2A] border border-gray-300 dark:border-gray-700 
          rounded-xl shadow-2xl flex flex-col overflow-hidden resize"
          style={{
            fontFamily: "'Press Start 2P', cursive",
            width: "320px",
            height: "450px",
            minWidth: "250px",
            minHeight: "250px",
          }}
        >
          <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-400 text-white font-semibold cursor-move select-none rounded-t-lg shadow-md flex justify-center items-center gap-2">
            EduQuest Assistant
          </div>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-white dark:bg-[#1E1E1E] rounded-b-lg">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex ${
                  m.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <span
                  className={`inline-block p-2 rounded-xl max-w-[80%] break-words ${
                    m.role === "user"
                      ? "bg-blue-100 dark:bg-blue-800 text-black dark:text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-black dark:text-white"
                  }`}
                >
                  {m.text}
                </span>
              </div>
            ))}
            {loading && (
              <div className="text-gray-500 italic text-sm animate-pulse">
                Thinking...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t border-gray-300 dark:border-gray-700 flex gap-2">
            <input
              className="flex-1 rounded-l-lg px-3 py-2 bg-gray-50 dark:bg-[#2D2D2D] text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask something..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg font-semibold disabled:opacity-50 transition-colors"
              onClick={handleSend}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center">
        {!open && (
          <p className="mb-1 text-sm bg-white dark:bg-gray-800 shadow px-3 py-1 rounded-full text-gray-600 dark:text-gray-200">
            Ask something...
          </p>
        )}
        <button
          className="w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform duration-300 
          bg-gradient-to-tr from-blue-500 via-cyan-400 to-purple-500 ring-4 ring-blue-300/40"
          onClick={() => setOpen((o) => !o)}
          title="Ask something..."
        >
          <span className="text-3xl font-bold ">💬</span>
        </button>
      </div>
    </div>
  );
}

export default ChatBotFloating;
