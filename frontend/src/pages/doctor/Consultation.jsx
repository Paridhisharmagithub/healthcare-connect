import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

const DoctorConsultation = () => {
  const [roomName, setRoomName] = useState("");
  const [inCall, setInCall] = useState(false);

  // Example: patient se aaya hua room
  const consultations = [
    {
      id: 1,
      patient: "John Doe",
      date: "2025-10-05",
      status: "Approved",
      room: "consult-1234",
    },
  ];

  const joinCall = (room) => {
    setRoomName(room);
    setInCall(true);
  };

  const endCall = () => {
    setInCall(false);
    setRoomName("");
    const container = document.getElementById("jitsi-container");
    if (container) container.innerHTML = "";
  };

  useEffect(() => {
    if (inCall && roomName) {
      const domain = "meet.jit.si";

      const options = {
        roomName: roomName,
        width: "100%",
        height: 600,
        parentNode: document.getElementById("jitsi-container"),
        userInfo: {
          displayName: "Dr. Smith 👩‍⚕️",
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "hangup",
            "chat",
            "screen-sharing",
          ],
        },
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);

      api.addEventListener("videoConferenceJoined", () => {
        console.log("Doctor joined room:", roomName);
      });

      return () => api.dispose();
    }
  }, [inCall, roomName]);

  return (
    <div className="min-h-screen p-8 bg-[#EFFDFB] text-[#0D9688]">
      <Navbar userType="doctor" userName="Dr. Smith" />

      <h1 className="text-4xl font-bold mb-6 text-center">
        Doctor Consultation 
      </h1>

      <p className="text-lg text-center mb-8">
        Manage and join patient consultations easily.
      </p>

      {/* Consultation Table */}
      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-[#0D9688]">
        <h2 className="text-2xl font-semibold mb-4">
          Patient Appointments
        </h2>

        <table className="w-full border-collapse text-left border border-gray-200">
          <thead className="bg-[#0D9688] text-white">
            <tr>
              <th className="p-3 border">Patient</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {consultations.map((c) => (
              <tr key={c.id} className="hover:bg-[#EFFDFB] transition">
                <td className="p-3 border">{c.patient}</td>
                <td className="p-3 border">{c.date}</td>
                <td className="p-3 border text-green-600">
                  {c.status}
                </td>
                <td className="p-3 border text-center">
                  {!inCall ? (
                    <button
                      onClick={() => joinCall(c.room)}
                      className="px-4 py-2 bg-[#0D9688] text-white rounded-lg hover:opacity-90 transition"
                    >
                      Join Call
                    </button>
                  ) : (
                    <button
                      onClick={endCall}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:opacity-90 transition"
                    >
                      End Call
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Video Container */}
      <div
        id="jitsi-container"
        className="w-full bg-white rounded-2xl shadow-md border border-[#0D9688] p-4"
      >
        {!inCall && (
          <p className="text-center text-gray-500">
            Consultation video will appear here 
          </p>
        )}
      </div>
    </div>
  );
};

export default DoctorConsultation;