import { useState, useEffect, useRef } from "react";
import { chatWithAI } from "../../services/api";
import Navbar from "../../components/Navbar";
import {
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  Paperclip,
  X,
  Menu,
  ChevronLeft,
} from "lucide-react";

export default function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ RESTORED (important)
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const uid = localStorage.getItem("uid") || "test-user";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFileInput = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const loadConversation = (chat) => {
    setMessages(chat.messages || []);
  };

  const handleSend = async () => {
    if (!prompt.trim() && selectedFiles.length === 0) return;
    if (loading) return;

    const userMessage = prompt.trim() || "[Attached files]";

    const historyForApi = [
      ...messages.slice(-9),
      { type: "user", content: userMessage },
    ]
      .slice(-10)
      .map((m) => ({
        user: m.type === "user" ? m.content : "",
        assistant: m.type === "ai" ? m.content : "",
      }));

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: userMessage,
        files: selectedFiles.length ? selectedFiles : undefined,
      },
    ]);

    setPrompt("");
    setError(null); // ✅ now valid
    setLoading(true);

    try {
      const response = await chatWithAI(
        userMessage,
        historyForApi,
        selectedFiles,
        uid
      );

      if (response && response.success) {
        const aiMsg = {
          type: "ai",
          content: response.response,
          isEmergency: response.is_emergency || false,
        };

        setMessages((prev) => [...prev, aiMsg]);

        setHistory((prev) => {
          const updated = [...prev];
          const idx = updated.findIndex((h) => h.id === uid);

          if (idx > -1) {
            updated[idx] = {
              ...updated[idx],
              messages: [
                ...updated[idx].messages,
                { type: "user", content: userMessage },
                aiMsg,
              ],
            };
          } else {
            updated.push({
              id: uid,
              title: userMessage.slice(0, 30),
              messages: [{ type: "user", content: userMessage }, aiMsg],
            });
          }
          return updated;
        });
      } else {
        const backendMsg =
          response?.error || response?.details || "AI error";
        setError(backendMsg);
        setMessages((prev) => [
          ...prev,
          {
            type: "ai",
            content: "Sorry — couldn't generate a reply.",
            isError: true,
          },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const msg =
        err?.response?.data?.error || err?.message || "Network Error";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Connection problem. Try again later.",
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setSelectedFiles([]);
      clearFileInput();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar toggle */}
        <button
          className="absolute top-20 left-4 z-50 p-2 bg-white shadow rounded-full border border-gray-200 hover:bg-emerald-50 transition"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? (
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700" />
          )}
        </button>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto h-[calc(100vh-64px)]">
            <div className="p-4 font-semibold text-lg text-gray-700 border-b border-gray-200">
              Chat History
            </div>
            {history.length === 0 ? (
              <div className="p-4 text-gray-400 text-sm">
                No previous conversations
              </div>
            ) : (
              history.map((chat, idx) => (
                <button
                  key={chat.id || idx}
                  onClick={() => loadConversation(chat)}
                  className="text-left p-3 hover:bg-emerald-50 border-b border-gray-100 truncate text-sm"
                >
                  {chat.title || `Chat ${idx + 1}`}
                </button>
              ))
            )}
          </div>
        )}

        {/* Chat area */}
        <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">
                  Welcome to AI Health Assistant!
                </h3>
                <p className="text-gray-600 text-sm">
                  Ask me health-related questions and get instant answers
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-2 ${
                    message.type === "user"
                      ? "flex-row-reverse"
                      : "flex-row"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-indigo-500">
                    {message.type === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className="bg-gray-100 px-3 py-2 rounded-xl max-w-[70%] text-sm">
                    {message.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your health question here..."
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl resize-none"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="mt-2 px-5 py-2 bg-emerald-600 text-white rounded-xl"
            >
              Send
            </button>

            {error && (
              <p className="text-xs text-red-500 mt-2">
                ⚠ {error}
              </p>
            )}

            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI responses are for informational purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
