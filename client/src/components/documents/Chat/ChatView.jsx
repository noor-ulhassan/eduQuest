import { useState } from "react";
import { Send, Loader2, FileText } from "lucide-react";
import MessageBubble from "./MessageBubble";
import { chatApi } from "../../../services/ragApiService";

const WELCOME_MESSAGE =
  "Hello! I'm your reading companion. I can answer questions about your uploaded document. What would you like to know?";

function ChatView({ documentId }) {
  const [messages, setMessages] = useState([
    { id: 1, text: WELCOME_MESSAGE, isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), text: userMessage, isUser: true },
    ]);
    setIsLoading(true);

    try {
      const { answer } = await chatApi.sendMessage({
        message: userMessage,
        history: messages.map((m) => ({
          role: m.isUser ? "user" : "assistant",
          content: m.text,
        })),
        documentId,
      });
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: answer, isUser: false },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: `Error: ${err.message || "Something went wrong. Please try again."}`,
          isUser: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // No document uploaded yet
  if (!documentId) {
    return (
      <div className="h-[calc(100vh-180px)] flex items-center justify-center text-gray-500">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No document loaded</p>
          <p className="text-sm mt-1">Upload a PDF first to start chatting.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col bg-white rounded-xl border border-gray-200">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg.text} isUser={msg.isUser} />
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the document..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send size={18} />
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatView;
