import { useState } from "react";
import { uploadReport } from "../../services/api";
import Navbar from "../../components/Navbar";
import { Upload, FileText, CheckCircle, AlertCircle, Loader, Download } from "lucide-react";

export default function UploadReport() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadReport(formData);
      setResult(res.data);
    } catch (error) {
      alert("Upload failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <FileText className="w-8 h-8 text-emerald-600" />
            Upload Medical Report
          </h1>
          <p className="text-gray-600">Upload your medical reports for instant AI-powered analysis</p>
        </div>

        {/* Upload Area */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-3 border-dashed rounded-xl p-12 text-center transition-all ${
              dragActive
                ? "border-emerald-500 bg-emerald-50"
                : "border-gray-300 hover:border-emerald-400"
            }`}
          >
            <Upload className={`w-16 h-16 mx-auto mb-4 ${dragActive ? "text-emerald-500" : "text-gray-400"}`} />
            
            {!file ? (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Drop your report here or click to browse
                </h3>
                <p className="text-gray-600 mb-4">Supports: PDF, JPG, PNG (Max 10MB)</p>
                <label className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold cursor-pointer hover:shadow-lg transition-all">
                  <Upload className="w-5 h-5" />
                  Select File
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              </>
            ) : (
              <div className="flex items-center justify-center gap-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <div className="text-left">
                  <p className="font-semibold text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="ml-4 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {file && (
            <button
              onClick={handleUpload}
              disabled={loading}
              className="mt-6 w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Analyzing Report...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Upload & Analyze
                </>
              )}
            </button>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
              Analysis Results
            </h2>

            {/* Extracted Text */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Extracted Text:</h3>
              <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                  {result.ocr_text || "No text extracted"}
                </pre>
              </div>
            </div>

            {/* Download Button */}
            {result.file_url && (
              <a
                href={result.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-200 transition"
              >
                <Download className="w-5 h-5" />
                Download Report
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}