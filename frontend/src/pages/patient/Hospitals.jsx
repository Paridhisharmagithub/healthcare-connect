import { useState } from "react";
import Navbar from "../../components/Navbar";
import { MapPin, Navigation, Hospital as HospitalIcon, Phone, Clock, Loader } from "lucide-react";

export default function Hospitals() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation is not supported by your browser");
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      (err) => {
        setError("Unable to get your location. Please enable location services.");
        setLoading(false);
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      <Navbar userType="patient" userName="John Doe" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <HospitalIcon className="w-8 h-8 text-emerald-600" />
            Find Nearby Hospitals
          </h1>
          <p className="text-gray-600">Locate healthcare facilities near you</p>
        </div>

        {/* Location Button */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <button
            onClick={getLocation}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-xl transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                Getting your location...
              </>
            ) : (
              <>
                <Navigation className="w-6 h-6" />
                Find Hospitals Near Me
              </>
            )}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-start gap-2">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Map */}
        {location && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" />
                Healthcare Facilities Near You
              </h2>
            </div>
            <iframe
              className="w-full h-96"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${location[1] - 0.05}%2C${
                location[0] - 0.05
              }%2C${location[1] + 0.05}%2C${location[0] + 0.05}&layer=mapnik&marker=${location[0]}%2C${
                location[1]
              }`}
              style={{ border: 0 }}
            />
            <div className="p-6 bg-emerald-50">
              <p className="text-sm text-gray-600">
                📍 Your current location: {location[0].toFixed(4)}, {location[1].toFixed(4)}
              </p>
            </div>
          </div>
        )}

        {/* Sample Hospital List */}
        {location && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Nearby Hospitals</h2>
            <div className="space-y-4">
              {[
                { name: "City Hospital", distance: "1.2 km", phone: "+91 98765 43210" },
                { name: "Apollo Clinic", distance: "2.5 km", phone: "+91 98765 43211" },
                { name: "Government Hospital", distance: "3.8 km", phone: "+91 98765 43212" },
              ].map((hospital, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-6 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500 rounded-full p-3">
                      <HospitalIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <MapPin className="w-4 h-4" />
                        {hospital.distance} away
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4" />
                        {hospital.phone}
                      </p>
                    </div>
                  </div>
                  <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition">
                    Get Directions
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}