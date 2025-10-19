import { useState } from "react";
import { searchDrug } from "../../services/api";
import Navbar from "../../components/Navbar";
import { Pill, Search, AlertTriangle, Info, Loader } from "lucide-react";

export default function Medicines() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return alert("Please enter a medicine name");
    
    setLoading(true);
    setSearched(true);
    try {
      const res = await searchDrug(query);
      if (res.data.results) {
        setResults(res.data.results);
      } else {
        setResults([]);
      }
    } catch (error) {
      alert("Search failed: " + error.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Pill className="w-8 h-8 text-emerald-600" />
            Medicine Search
          </h1>
          <p className="text-gray-600">Search for medicines and get detailed information</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter medicine name (e.g., Aspirin, Paracetamol)"
                className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Search Results {results.length > 0 && `(${results.length})`}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Searching medicines...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-12">
                <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No results found for "{query}"</p>
                <p className="text-sm text-gray-400 mt-2">Try searching with a different name or spelling</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {results.map((medicine, i) => (
                  <div
                    key={i}
                    className="p-6 border-2 border-purple-100 rounded-xl hover:shadow-lg transition bg-purple-50"
                  >
                    {/* Medicine Name */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="bg-purple-500 rounded-full p-2">
                        <Pill className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">
                          {medicine.openfda?.brand_name?.[0] || medicine.openfda?.generic_name?.[0] || "Unknown Medicine"}
                        </h3>
                        {medicine.openfda?.manufacturer_name?.[0] && (
                          <p className="text-sm text-gray-600">by {medicine.openfda.manufacturer_name[0]}</p>
                        )}
                      </div>
                    </div>

                    {/* Purpose */}
                    {medicine.purpose?.[0] && (
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Info className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-700 text-sm">Purpose:</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-6">{medicine.purpose[0]}</p>
                      </div>
                    )}

                    {/* Warnings */}
                    {medicine.warnings?.[0] && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="font-semibold text-gray-700 text-sm">Warnings:</span>
                        </div>
                        <p className="text-sm text-gray-600 pl-6 line-clamp-3">{medicine.warnings[0]}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}