import { useState } from "react";
import Navbar from "../../components/Navbar";
import { Pill, Search, Loader, ShoppingCart, X } from "lucide-react";
import axios from "axios";
import { searchMedicine } from "../../services/api";


/**
 * Medicines.jsx
 * - search backend for medicines
 * - displays cards (themed)
 * - each card has a Buy button -> opens modal for qty/add-to-cart/buy-now
 */

const getBadgeClasses = (type = "") => {
  const t = (type || "").toLowerCase();
  if (t.includes("allop") || t.includes("allopathy")) return "bg-emerald-50 text-emerald-800";
  if (t.includes("ayur")) return "bg-amber-50 text-amber-800";
  if (t.includes("homeo") || t.includes("homeopath")) return "bg-indigo-50 text-indigo-800";
  if (t.includes("unani")) return "bg-cyan-50 text-cyan-800";
  return "bg-gray-100 text-gray-700";
};

export default function Medicines() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Cart and modal state
  const [cart, setCart] = useState([]); // { id, name, price, qty, manufacturer }
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [selectedQty, setSelectedQty] = useState(1);

  const openBuyModal = (med) => {
    setSelectedMed(med);
    setSelectedQty(1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedMed(null);
    setSelectedQty(1);
  };

  const addToCart = (med, qty) => {
    const priceRaw = med["price(\u20b9)"] || med.price || "0";
    const price = Number(String(priceRaw).replace(/[^0-9.]/g, "")) || 0;
    setCart((prev) => {
      const existing = prev.find((p) => p.id === med.id);
      if (existing) {
        return prev.map((p) => (p.id === med.id ? { ...p, qty: p.qty + qty } : p));
      }
      return [...prev, { id: med.id, name: med.name, price, qty, manufacturer: med.manufacturer_name }];
    });
    closeModal();
    // optional: show toast/snackbar here
  };

  const buyNow = (med, qty) => {
    // Mock buy flow: you can replace with real checkout integration
    addToCart(med, qty);
    alert(`Proceeding to checkout for ${qty} × ${med.name} (mock) 💳`);
    // After this you can redirect to a checkout page or payment gateway
  };


  const handleSearch = async () => {
    if (!query.trim()) return alert("Please enter a medicine name");

    setLoading(true);
    setSearched(true);

    try {
      const res = await searchMedicine(query, "", "", 1);

      setResults(res.results || []);
    } catch (error) {
      alert("Search failed");
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
        <div className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center justify-center gap-2 mb-2">
            <Pill className="w-8 h-8 text-emerald-600" />
            Medicine Search
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Search Indian medicines and buy quickly. 🛒
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter medicine name (e.g., Paracetamol)"
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 transition"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
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

            {/* simple cart status */}
            <div className="flex items-center gap-2 md:ml-4">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <div className="text-sm font-medium text-gray-700">
                  {cart.length} item{cart.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 text-center">
              {results.length > 0 ? `Found ${results.length} medicines` : `No results for "${query}"`}
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Searching medicines...</p>
              </div>
            ) : results.length === 0 ? (
              <p className="text-gray-500 text-center">Try a different medicine name</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((med) => (
                  <div
                    key={med.id}
                    className="p-4 border rounded-2xl hover:shadow-lg transition transform hover:-translate-y-0.5 bg-white/80 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      {/* icon */}
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-none"
                        style={{ background: "linear-gradient(135deg,#0D9688 0%, #00C2B3 100%)" }}
                      >
                        <Pill className="w-6 h-6 text-white" />
                      </div>

                      {/* main info */}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-md md:text-lg font-semibold text-gray-900 truncate" title={med.name}>
                          {med.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 truncate" title={med.manufacturer_name}>
                          {med.manufacturer_name || "Unknown Manufacturer"}
                        </p>

                        <div className="mt-3 text-sm text-gray-700 whitespace-normal break-words" style={{ maxHeight: "4.5rem", overflow: "hidden" }} title={`${med.short_composition1 || ""} ${med.short_composition2 || ""}`}>
                          {med.short_composition1} {med.short_composition2}
                        </div>
                      </div>

                      {/* badge + price */}
                      <div className="flex flex-col items-end gap-2 flex-none ml-2">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getBadgeClasses(med.type)}`}>
                          {med.type ? med.type.charAt(0).toUpperCase() + med.type.slice(1) : "N/A"}
                        </span>
                        <div className="text-sm font-bold text-emerald-700">₹{med["price(\u20b9)"] || "-"}</div>
                      </div>
                    </div>

                    {/* footer: pack + buy */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="text-xs text-gray-500 truncate max-w-[60%]">{med.pack_size_label || "Pack info not available"}</div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openBuyModal(med)}
                          className="px-3 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-sm font-semibold hover:opacity-95 transition"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => addToCart(med, 1)}
                          className="px-3 py-2 border border-emerald-200 rounded-lg text-emerald-700 text-sm font-medium hover:bg-emerald-50 transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && selectedMed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeModal}></div>
          <div className="relative max-w-xl w-full bg-white rounded-2xl shadow-xl p-6 z-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{selectedMed.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedMed.manufacturer_name}</p>
                <div className="mt-2 text-sm text-gray-700">
                  <strong>Composition:</strong> {selectedMed.short_composition1} {selectedMed.short_composition2}
                </div>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={closeModal} aria-label="Close">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="text-2xl font-bold text-emerald-700">₹{selectedMed["price(\u20b9)"] || "-"}</div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-1 border rounded-lg"
                >
                  -
                </button>
                <div className="px-3 py-1 border rounded-lg">{selectedQty}</div>
                <button onClick={() => setSelectedQty((q) => q + 1)} className="px-3 py-1 border rounded-lg">
                  +
                </button>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => addToCart(selectedMed, selectedQty)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:opacity-95"
              >
                Add to Cart
              </button>

              <button
                onClick={() => buyNow(selectedMed, selectedQty)}
                className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-400 text-white rounded-lg font-semibold"
              >
                Buy Now
              </button>

              <button onClick={closeModal} className="ml-auto text-sm text-gray-500 underline">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
