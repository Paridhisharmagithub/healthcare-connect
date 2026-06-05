import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";

const APPOINTMENTS = "appointments";

async function getPatientName(uid, fallbackEmail) {
  const patientDoc = await getDoc(doc(db, "patients", uid));
  if (patientDoc.exists() && patientDoc.data().name) {
    return patientDoc.data().name;
  }
  return fallbackEmail || "Patient";
}

export async function bookAppointment({ doctor, date }) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in to book an appointment.");
  }

  const doctorName = (doctor || "").trim();
  if (!doctorName || !date) {
    throw new Error("Doctor name and date are required.");
  }

  const patientName = await getPatientName(user.uid, user.email);

  await addDoc(collection(db, APPOINTMENTS), {
    patientId: user.uid,
    patientName,
    doctorName,
    doctorNameLower: doctorName.toLowerCase(),
    date,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

export async function listPatientAppointments() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, APPOINTMENTS),
    where("patientId", "==", user.uid),
    orderBy("date", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function listDoctorAppointments() {
  const user = auth.currentUser;
  if (!user) return [];

  const doctorDoc = await getDoc(doc(db, "doctors", user.uid));
  if (!doctorDoc.exists()) return [];

  const doctorNameLower = (doctorDoc.data().name || "").trim().toLowerCase();
  if (!doctorNameLower) return [];

  const q = query(
    collection(db, APPOINTMENTS),
    where("doctorNameLower", "==", doctorNameLower),
    orderBy("date", "desc")
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateAppointmentStatus(appointmentId, status) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be logged in.");
  }

  await updateDoc(doc(db, APPOINTMENTS, appointmentId), { status });
}
