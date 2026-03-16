import { useState, useEffect, useRef } from "react";
import { chatWithAI } from "../../services/api";
import Navbar from "../../components/Navbar";
import {
  Bot,
  Sparkles,
  Menu,
  ChevronLeft,
  Paperclip,
  X,
} from "lucide-react";

export default function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [history] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showSidebar, setShowSidebar] = useState(true);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const uid = localStorage.getItem("uid") || "test-user";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const removeFile = (index) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  const handleSend = async () => {
    if (!prompt.trim() && selectedFiles.length === 0) return;
    if (loading) return;

    const userMessage = prompt.trim() || "[Uploaded medical report]";

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
        files: selectedFiles,
      },
    ]);

    setPrompt("");
    setError(null);
    setLoading(true);

    try {
      const response = await chatWithAI(
        userMessage,
        historyForApi,
        selectedFiles,
        uid
      );

      const aiMsg = {
        type: "ai",
        content: response.response,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setError("Connection problem. Try again later.");
      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          content: "Connection problem. Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
      setSelectedFiles([]);
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
        {/* Sidebar Toggle */}
        <button
          className="absolute top-20 left-4 z-50 p-2 bg-white shadow rounded-full"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          {showSidebar ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>

        {/* Sidebar */}
        {showSidebar && (
          <div className="w-64 bg-white border-r overflow-y-auto">
            <div className="p-4 font-semibold border-b">Chat History</div>

            {history.length === 0 ? (
              <div className="p-4 text-gray-400 text-sm">
                No previous conversations
              </div>
            ) : (
              history.map((chat, idx) => (
                <button
                  key={idx}
                  className="text-left p-3 hover:bg-emerald-50 border-b w-full"
                >
                  {chat.title}
                </button>
              ))
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800">
                  AI Health Assistant
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload a medical report or ask a health question.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="bg-white px-4 py-2 rounded-xl shadow text-sm max-w-[70%]">
                    {message.content}
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-white border px-3 py-1 rounded-full text-sm"
                >
                  {file.name}
                  <X
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => removeFile(index)}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t p-3 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current.click()}
                className="p-2 bg-white border rounded-lg"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.docx"
                className="hidden"
                onChange={handleFileSelect}
              />

              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your health or upload a report..."
                className="flex-1 px-4 py-2 border rounded-xl resize-none"
                disabled={loading}
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl"
              >
                Send
              </button>
            </div>

            {error && <p className="text-xs text-red-500 mt-2">⚠ {error}</p>}

            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI responses are informational only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
