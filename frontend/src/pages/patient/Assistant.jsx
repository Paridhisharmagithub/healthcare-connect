import { useState, useRef, useEffect } from "react";
import { chatWithAI } from "../../services/api";
import Navbar from "../../components/Navbar";
import { Loader2, SendHorizonal } from "lucide-react";

export default function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const handleSend = async () => {
    if (!prompt.trim()) return;
    setChat([...chat, { sender: "user", text: prompt }]);
    setPrompt("");
    setLoading(true);

    try {
  const res = await chatWithAI(prompt);
  const aiResponse = res.data.predictions?.[0]?.content || "No response";
  setChat((prev) => [...prev, { sender: "ai", text: aiResponse }]);
} catch (err) {
  setChat((prev) => [
    ...prev,
    { sender: "ai", text: "Error connecting to AI service." },
  ]);
}
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100 min-h-screen">
      <Navbar userType="patient" />
      <div className="max-w-4xl mx-auto p-6 mt-6 bg-white shadow-2xl rounded-2xl">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-4">
          🩺 AI Health Assistant
        </h2>

        {/* Chat Area */}
        <div className="h-[60vh] overflow-y-auto p-4 border rounded-xl bg-gray-50 shadow-inner">
          {chat.map((msg, i) => (
            <div
              key={i}
              className={`flex my-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 max-w-[70%] rounded-2xl text-sm ${
                  msg.sender === "user"
                    ? "bg-blue-600 text-white rounded-br-none"
                    : "bg-gray-200 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-600 rounded-2xl rounded-bl-none p-3 text-sm animate-pulse">
                <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={chatEndRef}></div>
        </div>

        {/* Input Area */}
        <div className="flex mt-4">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask your health-related question..."
            className="border p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSend}
            className="ml-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <>
                <SendHorizonal className="h-5 w-5" />
                Send
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
