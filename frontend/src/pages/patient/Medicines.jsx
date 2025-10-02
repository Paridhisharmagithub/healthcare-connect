import { useState } from "react";
import { searchDrug } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function Medicines() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    const res = await searchDrug(query);
    if(res.data.results) setResults(res.data.results);
    else setResults([]);
  };

  return (
    <div>
      <Navbar userType="patient" />
      <div className="p-5">
        <h2 className="text-xl font-bold mb-3">Search Medicines</h2>
        <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Drug name" className="border p-2 rounded"/>
        <button onClick={handleSearch} className="ml-2 px-3 py-1 bg-blue-500 text-white rounded">Search</button>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((r,i) => (
            <div key={i} className="p-3 border rounded shadow">
              <h3 className="font-bold">{r.openfda?.brand_name?.[0] || "Unknown"}</h3>
              <p>{r.purpose?.[0]}</p>
              <p className="text-gray-500 text-sm">{r.warnings?.[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
