// src/pages/patient/Assistant.jsx
import { useState, useEffect, useRef } from "react";
// correct when api.js is at src/services/api.js
import { chatWithAI } from "../../services/api";
import Navbar from "../../components/Navbar";
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    const userMessage = prompt.trim();
    setPrompt("");
    setError(null);
    setMessages((prev) => [...prev, { type: "user", content: userMessage }]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map((m) => ({
        user: m.type === "user" ? m.content : "",
        assistant: m.type === "ai" ? m.content : "",
      }));

      const data = await chatWithAI(userMessage, history);
      if (data.success) {
        setMessages((prev) => [
          ...prev,
          { type: "ai", content: data.response, isEmergency: data.is_emergency || false },
        ]);
      } else {
        setError(data.error || "AI responded with an error");
        setMessages((prev) => [
          ...prev,
          { type: "ai", content: "Unable to fetch reply right now.", isError: true },
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      const msg = err?.response?.data?.error || err?.message || "Network Error";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        { type: "ai", content: "Connection problem. Try again later.", isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sampleQuestions = [
    "What are the symptoms of diabetes?",
    "How to reduce high blood pressure naturally?",
    "What should I eat for better immunity?",
    "When should I see a doctor for fever?",
    "What is the difference between cold and flu?",
    "How to manage stress and anxiety?",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <MessageCircle className="w-8 h-8 text-emerald-600" />
            AI Health Assistant
          </h1>
          <p className="text-gray-600">Powered by Google Gemini AI</p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-semibold">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col" style={{ height: "calc(100vh - 350px)" }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Bot className="w-12 h-12 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Welcome to AI Health Assistant!</h3>
                <p className="text-gray-600 mb-6">Ask me health-related questions and get instant answers</p>

                <div className="max-w-md mx-auto">
                  <p className="text-sm text-gray-500 mb-3">Try these questions:</p>
                  <div className="grid gap-2">
                    {sampleQuestions.map((q, i) => (
                      <button key={i} onClick={() => setPrompt(q)} className="text-left px-4 py-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-sm text-gray-700 transition border border-emerald-100">💡 {q}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className={`flex gap-3 ${message.type === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.type === "user" ? "bg-gradient-to-br from-emerald-500 to-teal-600" : message.isEmergency ? "bg-gradient-to-br from-red-500 to-orange-600" : "bg-gradient-to-br from-indigo-500 to-purple-600"}`}>
                    {message.type === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>

                  <div className={`flex-1 px-4 py-3 rounded-2xl ${message.type === "user" ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white" : message.isEmergency ? "bg-red-50 text-red-900 border-2 border-red-300" : message.isError ? "bg-orange-50 text-orange-900 border border-orange-200" : "bg-gray-100 text-gray-800"} max-w-[80%]`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 px-4 py-3 rounded-2xl bg-gray-100 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="flex gap-3">
              <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} onKeyDown={handleKeyDown} placeholder="Type your health question here..." className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition resize-none" disabled={loading} rows="1" style={{ minHeight: "48px", maxHeight: "120px" }} />
              <button onClick={handleSend} disabled={loading || !prompt.trim()} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              AI responses are for informational purposes only. Consult a doctor for medical advice.
            </p>
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ <strong>Important:</strong> This AI assistant provides general health information only. It is not a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </div>
  );
}
