import { useState } from "react";
import { chatWithAI } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function Assistant() {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState([]);

  const handleSend = async () => {
    const res = await chatWithAI(prompt);
    setResponses([...responses, { prompt, answer: res.data.predictions?.[0]?.content || "No response" }]);
    setPrompt("");
  };

  return (
    <div>
      <Navbar userType="patient"/>
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">AI Health Assistant</h2>
        <div className="flex">
          <input type="text" value={prompt} onChange={e=>setPrompt(e.target.value)} className="border p-2 rounded w-full"/>
          <button onClick={handleSend} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">Send</button>
        </div>
        <div className="mt-5 space-y-3">
          {responses.map((r,i) => (
            <div key={i} className="p-3 border rounded">
              <p><strong>You:</strong> {r.prompt}</p>
              <p><strong>AI:</strong> {r.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
