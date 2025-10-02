import { useState } from "react";
import Navbar from "../../components/Navbar";

export default function Hospitals() {
  const [location, setLocation] = useState(null);

  const getLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(pos => {
      setLocation([pos.coords.latitude, pos.coords.longitude]);
    });
  };

  return (
    <div>
      <Navbar userType="patient" />
      <div className="p-5">
        <button onClick={getLocation} className="px-3 py-1 bg-blue-500 text-white rounded">Find Hospitals Near Me</button>
        {location && (
          <iframe
            className="mt-5 w-full h-96"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${location[1]-0.05}%2C${location[0]-0.05}%2C${location[1]+0.05}%2C${location[0]+0.05}&layer=mapnik&marker=${location[0]}%2C${location[1]}`}
            style={{ border:0 }}
          />
        )}
      </div>
    </div>
  );
}
