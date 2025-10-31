// src/pages/patient/Hospitals.jsx
import { useState } from "react";
import Navbar from "../../components/Navbar";
import {
  MapPin,
  Navigation,
  Hospital as HospitalIcon,
  Phone,
  Clock,
  Loader,
  ExternalLink,
  Search,
  AlertTriangle,
} from "lucide-react";

/**
 * Robust Hospitals.jsx
 * - Uses browser geolocation (with manual fallback)
 * - Tries multiple Overpass mirrors with retries & backoff
 * - Nominatim search with timeout+retry
 * - Checks tile availability before showing embedded OSM map
 * - If tiles/timeouts occur, shows fallback UI and 'View on map' buttons
 */

/* Mirrors & endpoints (try them in order) */
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
];

const NOMINATIM_ENDPOINTS = [
  "https://nominatim.openstreetmap.org/search?format=json&q=",
  // If you later add a proxy or another mirror, add it here.
];

/* small utility: sleep */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Haversine distance in km */
const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/* Image-based tile availability check (no CORS issues) */
const checkTileAvailable = (tileUrl, timeoutMs = 5000) =>
  new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        img.src = ""; // stop
        resolve(false);
      }
    }, timeoutMs);
    img.onload = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(true);
      }
    };
    img.onerror = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(false);
      }
    };
    // Use a tiny OSM tile — zoom 0 tile exists globally
    img.src = tileUrl;
  });

/* fetch with timeout helper */
const fetchWithTimeout = async (url, opts = {}, timeoutMs = 10000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    clearTimeout(id);
    return res;
  } finally {
    clearTimeout(id);
  }
};

/* Try Overpass mirrors sequentially, with retries/backoff */
const callOverpassWithFallback = async (query, attemptsPerEndpoint = 2) => {
  // For each endpoint, try attemptsPerEndpoint times with exponential backoff
  for (let epIdx = 0; epIdx < OVERPASS_ENDPOINTS.length; epIdx++) {
    const endpoint = OVERPASS_ENDPOINTS[epIdx];
    for (let attempt = 0; attempt < attemptsPerEndpoint; attempt++) {
      try {
        const res = await fetchWithTimeout(endpoint, {
          method: "POST",
          headers: { "Content-Type": "text/plain" },
          body: query,
        }, 20000); // 20s timeout per attempt
        if (!res.ok) throw new Error(`Overpass ${res.status}`);
        const json = await res.json();
        return json;
      } catch (err) {
        // console.warn(`Overpass attempt ${attempt + 1} failed for ${endpoint}:`, err);
        // backoff before retry
        await sleep(1000 * Math.pow(2, attempt)); // 1s, 2s, ...
      }
    }
    // if endpoint exhausted, try next mirror after a small pause
    await sleep(300);
  }
  // none worked
  throw new Error("All Overpass mirrors failed or timed out");
};

/* Nominatim search with retry + timeout */
const nominatimSearchWithRetry = async (place, attempts = 2) => {
  for (let epIdx = 0; epIdx < NOMINATIM_ENDPOINTS.length; epIdx++) {
    const base = NOMINATIM_ENDPOINTS[epIdx];
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const res = await fetchWithTimeout(base + encodeURIComponent(place), {}, 10000);
        if (!res.ok) throw new Error(`Nominatim ${res.status}`);
        const json = await res.json();
        return json;
      } catch (err) {
        // console.warn("Nominatim attempt failed:", err);
        await sleep(800 * (attempt + 1));
      }
    }
  }
  // if all fail:
  throw new Error("Geocoding failed (Nominatim) — try again later");
};

export default function Hospitals() {
  const [location, setLocation] = useState(null); // { lat, lon }
  const [loading, setLoading] = useState(false);
  const [hospitals, setHospitals] = useState([]);
  const [error, setError] = useState("");
  const [manualPlace, setManualPlace] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [mapAvailable, setMapAvailable] = useState(true); // whether tile server responsive

  /* Try to detect tile availability on mount or when user triggers location */
  const probeTileServers = async () => {
    // Try a known OSM tile URL - zoom 0, tile 0/0/0.png is tiny and exists
    const tileUrls = [
      "https://tile.openstreetmap.org/0/0/0.png",
      "https://a.tile.openstreetmap.org/0/0/0.png",
      "https://b.tile.openstreetmap.org/0/0/0.png",
      // You can add other provider tiles here (Carto, Stamen) if you plan to use them
    ];
    for (const t of tileUrls) {
      try {
        const ok = await checkTileAvailable(t, 4000);
        if (ok) return true;
      } catch (_) {}
    }
    return false;
  };

  /* Main getLocation (browser geolocation) */
  const getLocation = () => {
    setError("");
    setHospitals([]);
    setLoading(true);
    // Start tile probe in background
    probeTileServers().then((ok) => setMapAvailable(ok)).catch(() => setMapAvailable(false));

    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setLocation({ lat, lon });

        // fetch with a conservative default radius, and fallback if no results
        try {
          await fetchNearbyWithFallback(lat, lon);
        } catch (e) {
          setError(e.message || "Failed to fetch nearby hospitals");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError("Unable to get your location. Please enable location services or search manually.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  };

  /* Manual search -> geocode + fetch */
  const searchPlaceAndFind = async () => {
    if (!manualPlace.trim()) return alert("Please enter a place or pincode");
    setError("");
    setLoading(true);
    setHospitals([]);
    // probe tiles
    probeTileServers().then((ok) => setMapAvailable(ok)).catch(() => setMapAvailable(false));

    try {
      const json = await nominatimSearchWithRetry(manualPlace, 2);
      if (!json || json.length === 0) {
        setError("Place not found. Try a nearby city/locality or pincode.");
        setLoading(false);
        return;
      }
      const { lat, lon } = json[0];
      setLocation({ lat: Number(lat), lon: Number(lon) });
      await fetchNearbyWithFallback(Number(lat), Number(lon));
    } catch (e) {
      setError(e.message || "Geocoding failed. Try later.");
    } finally {
      setLoading(false);
    }
  };

  /* fetch nearby with radius fallback logic */
  const fetchNearbyWithFallback = async (lat, lon) => {
    // try smaller radius first (fast) then increase if no results
    const radii = [3000, 5000, 10000]; // meters
    for (const r of radii) {
      try {
        const items = await fetchNearbyOverpass(lat, lon, r);
        if (items && items.length > 0) {
          setHospitals(items);
          return;
        }
        // no results — try next radius
      } catch (err) {
        // if Overpass failed hard, bubble up only after trying other mirrors/radii
        // continue to next radius / endpoint logic handled in fetchNearbyOverpass
        // but if the error indicates all mirrors failed, we rethrow after full loop
        // store last error
        // continue
      }
      // small wait to respect rate limits
      await sleep(300);
    }
    // If here => either no facilities found in radii or all calls failed
    setHospitals([]);
    throw new Error("No nearby facilities found or service temporarily unavailable.");
  };

  /* Build Overpass query and call mirrors via callOverpassWithFallback */
  const fetchNearbyOverpass = async (lat, lon, radius = 3000) => {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lon});
        way["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lon});
        relation["amenity"~"hospital|clinic|doctors"](around:${radius},${lat},${lon});
      );
      out center tags;
    `;
    const data = await callOverpassWithFallback(query, 2);
    const items = (data.elements || [])
      .map((el) => {
        const lat2 = el.lat ?? el.center?.lat;
        const lon2 = el.lon ?? el.center?.lon;
        if (!lat2 || !lon2) return null;
        const tags = el.tags || {};
        const name = tags.name || tags["operator"] || "Unnamed Facility";
        const phone = tags.phone || tags["contact:phone"] || tags.telephone || "";
        const addrParts = [];
        if (tags["addr:street"]) addrParts.push(tags["addr:street"]);
        if (tags["addr:housenumber"]) addrParts.push(tags["addr:housenumber"]);
        if (tags["addr:city"]) addrParts.push(tags["addr:city"]);
        if (tags["addr:state"]) addrParts.push(tags["addr:state"]);
        const address = addrParts.join(", ") || tags["addr:full"] || tags["address"] || "";
        return {
          id: `${el.type}/${el.id}`,
          name,
          phone,
          address,
          lat: lat2,
          lon: lon2,
          distanceKm: Number(getDistanceKm(lat, lon, lat2, lon2).toFixed(2)),
        };
      })
      .filter(Boolean);
    // sort by distance and dedupe by lat/lon/name
    items.sort((a, b) => a.distanceKm - b.distanceKm);
    const seen = new Set();
    const deduped = [];
    for (const it of items) {
      const key = `${it.name}|${it.lat.toFixed(5)}|${it.lon.toFixed(5)}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(it);
      }
    }
    return deduped;
  };

  const openOSM = (lat, lon) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`, "_blank");
  };

  const openDirections = (lat, lon) => {
    const dest = encodeURIComponent(`${lat},${lon}`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <HospitalIcon className="w-8 h-8 text-emerald-600" />
            Find Nearby Hospitals
          </h1>
          <p className="text-gray-600">Locate healthcare facilities around you (real-time).</p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={getLocation}
            disabled={loading}
            className="col-span-1 flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Finding nearby...
              </>
            ) : (
              <>
                <Navigation className="w-5 h-5" />
                Find Hospitals Near Me
              </>
            )}
          </button>

          <button
            onClick={() => setShowManual((s) => !s)}
            className="col-span-1 px-4 py-3 border rounded-xl text-gray-700 bg-white hover:shadow-sm transition flex items-center gap-3 justify-center"
          >
            <MapPin className="w-5 h-5 text-emerald-600" />
            {showManual ? "Hide search" : "Search by place / pincode"}
          </button>

          <div className="col-span-1 flex items-center justify-end text-sm text-gray-500">
            Radius: 3 km (default) — expands if needed
          </div>
        </div>

        {/* Manual search */}
        {showManual && (
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
            <div className="flex gap-3">
              <input
                value={manualPlace}
                onChange={(e) => setManualPlace(e.target.value)}
                placeholder="Enter city / locality / pincode"
                className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
              <button
                onClick={searchPlaceAndFind}
                className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium flex items-center"
              >
                <Search className="w-4 h-4 inline-block mr-2" />
                Search
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Tip: Use locality or pincode for faster results.</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>{error}</div>
          </div>
        )}

        {/* Results + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div>
            <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {hospitals.length > 0 ? "Nearby Healthcare Facilities" : "No facilities loaded"}
              </h2>

              {loading && hospitals.length === 0 ? (
                <div className="text-center py-8">
                  <Loader className="w-12 h-12 text-emerald-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Fetching nearby hospitals...</p>
                </div>
              ) : hospitals.length === 0 ? (
                <p className="text-gray-500">Click "Find Hospitals Near Me" or search a place.</p>
              ) : (
                <div className="space-y-4">
                  {hospitals.map((h) => (
                    <div key={h.id} className="p-4 rounded-xl border hover:shadow-md transition bg-white/80">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center text-white flex-none">
                            <HospitalIcon className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{h.name}</h3>
                            {h.address ? (
                              <p className="text-sm text-gray-600 truncate">{h.address}</p>
                            ) : (
                              <p className="text-sm text-gray-500">Address not available</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                              {h.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3.5 h-3.5" /> {h.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" /> {h.distanceKm} km
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <button
                            onClick={() => openOSM(h.lat, h.lon)}
                            className="px-3 py-1 text-xs bg-white border rounded-md text-emerald-700 hover:bg-emerald-50"
                          >
                            <ExternalLink className="w-4 h-4 inline-block mr-1" />
                            View on map
                          </button>
                          <button
                            onClick={() => openDirections(h.lat, h.lon)}
                            className="px-3 py-1 text-xs bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-md"
                          >
                            Get directions
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Map */}
          <div>
            <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 h-full flex flex-col">
              <h3 className="font-semibold text-gray-800 mb-3">Map</h3>

              {mapAvailable ? (
                location ? (
                  <div className="flex-1 border rounded-lg overflow-hidden">
                    <iframe
                      title="nearby-hospitals-map"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        (hospitals[0]?.lon ?? location.lon) - 0.02
                      }%2C${(hospitals[0]?.lat ?? location.lat) - 0.02}%2C${
                        (hospitals[0]?.lon ?? location.lon) + 0.02
                      }%2C${(hospitals[0]?.lat ?? location.lat) + 0.02}&layer=mapnik&marker=${
                        hospitals[0]?.lat ?? location.lat
                      }%2C${hospitals[0]?.lon ?? location.lon}`}
                      className="w-full h-96"
                      style={{ border: 0 }}
                    />
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <p>Map will appear after you search or allow location access.</p>
                  </div>
                )
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-4">
                  <p className="text-gray-600">Map tiles are currently unavailable (network / rate limits).</p>
                  <p className="text-sm text-gray-500">Use the "View on map" buttons on each result to open OSM directly.</p>
                  <div className="mt-2">
                    <button
                      onClick={() => probeTileServers().then((ok) => setMapAvailable(ok))}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                    >
                      Retry map
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 text-xs text-gray-500">
                Tip: Click <strong>Get directions</strong> to open Google Maps (origin left blank to use your device's location).
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
