import { useState } from "react";
import { uploadReport } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Select a file");
    const formData = new FormData();
    formData.append("file", file);
    const res = await uploadReport(formData);
    setResult(res.data);
  };

  return (
    <div>
      <Navbar userType="patient" />
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">Upload Medical Report</h2>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <button onClick={handleUpload} className="ml-3 px-3 py-1 bg-blue-500 text-white rounded">Upload</button>
        {result && (
          <div className="mt-5 p-3 border rounded">
            <h3 className="font-semibold">Extracted Text:</h3>
            <pre>{result.ocr_text}</pre>
            <a href={result.file_url} target="_blank" className="text-blue-600 underline">View File</a>
          </div>
        )}
      </div>
    </div>
  );
}
