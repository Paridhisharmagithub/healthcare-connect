import React, { useEffect, useState } from "react";

const Consultation = () => {
  const [roomName, setRoomName] = useState("");
  const [inCall, setInCall] = useState(false);

  const startCall = () => {
    // Generate dynamic room name
    const name = "consult-" + Math.floor(Math.random() * 10000);
    setRoomName(name);
    setInCall(true);
  };

  const endCall = () => {
    setInCall(false);
    setRoomName("");
    // Remove iframe
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
        console.log("Joined room:", roomName);
      });

      return () => api.dispose();
    }
  }, [inCall, roomName]);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#EFFDFB", color: "#0D9688" }}>
      <h1 className="text-4xl font-bold mb-6 text-center">Patient Consultation 💬</h1>
      <p className="text-lg text-center mb-8">Connect with your doctor instantly. Temporary video call.</p>

      <div className="bg-white shadow-lg rounded-2xl p-6 mb-8 border border-[#0D9688]">
        <h2 className="text-2xl font-semibold mb-4 text-[#0D9688]">Scheduled Consultations</h2>
        <table className="w-full border-collapse text-left border border-gray-200">
          <thead style={{ backgroundColor: "#0D9688", color: "white" }}>
            <tr>
              <th className="p-3 border">Doctor</th>
              <th className="p-3 border">Date</th>
              <th className="p-3 border">Status</th>
              <th className="p-3 border text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-[#EFFDFB] transition">
              <td className="p-3 border">Dr. Sharma</td>
              <td className="p-3 border">2025-10-05</td>
              <td className="p-3 border text-yellow-600">Pending</td>
              <td className="p-3 border text-center">
                {!inCall ? (
                  <button
                    onClick={startCall}
                    className="px-4 py-2 bg-[#0D9688] text-white rounded-lg hover:opacity-90 transition"
                  >
                    Start Call
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
          </tbody>
        </table>
      </div>

      <div
        id="jitsi-container"
        className="w-full bg-white rounded-2xl shadow-md border border-[#0D9688] p-4"
      >
        {!inCall && (
          <p className="text-center text-gray-500">Video call will appear here once started 🎥</p>
        )}
      </div>
    </div>
  );
};

export default Consultation;
