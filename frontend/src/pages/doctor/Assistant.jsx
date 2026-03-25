import { useState, useEffect, useRef } from "react";
import { chatWithAI } from "../../services/api";
import Navbar from "../../components/Navbar";
import {
  Bot,
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
  const filesRef = useRef([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ FILE SELECT
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    console.log("📂 Selected:", files);

    setSelectedFiles(files);
    filesRef.current = files; // 🔥 IMPORTANT
  };

  const removeFile = (index) => {
    const updated = [...selectedFiles];
    updated.splice(index, 1);
    setSelectedFiles(updated);
  };

  // ✅ SEND
  const handleSend = async () => {
    const filesToSend = filesRef.current; // 🔥 USE REF

    console.log("🚀 Sending files:", filesToSend);

    if (!prompt.trim() && filesToSend.length === 0) return;
    if (loading) return;

    const userMessage = prompt.trim() || "[Uploaded medical report]";

    try {
      const response = await chatWithAI(
        userMessage,
        [],
        filesToSend // ✅ NOT selectedFiles
      );

      setMessages((prev) => [
        ...prev,
        { type: "user", content: userMessage },
        { type: "ai", content: response.response },
      ]);

    } catch (err) {
      console.error(err);
    }

    // reset
    setSelectedFiles([]);
    filesRef.current = []; // 🔥 clear ref
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

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800">
                  AI Health Assistant
                </h3>
                <p className="text-gray-600 text-sm">
                  Upload a report or ask a question
                </p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div className="bg-white px-4 py-2 rounded-xl shadow text-sm max-w-[70%]">
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* FILE PREVIEW */}
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

          {/* INPUT */}
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
                placeholder="Ask or upload report..."
                className="flex-1 px-4 py-2 border rounded-xl"
              />

              <button
                onClick={handleSend}
                disabled={loading}
                className="px-5 py-2 bg-emerald-600 text-white rounded-xl"
              >
                Send
              </button>
            </div>

            {error && (
              <p className="text-xs text-red-500 mt-2">⚠ {error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}