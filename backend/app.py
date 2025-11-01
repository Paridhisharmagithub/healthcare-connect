# app.py (full updated with correct Gemini)
from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore
import firebase_admin
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
import logging

# -------------------- Load environment --------------------
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-health-backend")

app = Flask(__name__)

# -------------------- CORS --------------------
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# -------------------- Gemini AI Setup --------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")  # updated default

if not GEMINI_API_KEY:
    logger.warning("GEMINI_API_KEY not found in .env (AI features will be disabled).")
    model = None
else:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)
        logger.info("Gemini configured with model: %s", GEMINI_MODEL)
    except Exception as e:
        logger.exception("Failed to configure Gemini: %s", e)
        GEMINI_API_KEY = None
        model = None

# -------------------- Firebase Setup --------------------
DB_AVAILABLE = False
try:
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT", "serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        DB_AVAILABLE = True
        logger.info("Firebase initialized.")
    else:
        logger.warning("Firebase service account not found at %s — skipping Firebase init.", cred_path)
except Exception as e:
    logger.exception("Firebase init failed: %s", e)
    DB_AVAILABLE = False

# -------------------- Medicine Data --------------------
MEDICINES = []
try:
    with open("indian_medicine_data.json", "r", encoding="utf-8") as f:
        MEDICINES = json.load(f)
    logger.info("Loaded medicine dataset: %d items", len(MEDICINES))
except Exception as e:
    logger.warning("Could not load medicine data: %s", e)

# -------------------- Health Assistant Prompt --------------------
HEALTH_ASSISTANT_PROMPT = (
    "You are a helpful AI health assistant. Provide accurate general health information, "
    "explain terms simply, and always remind users to consult a qualified medical professional when needed. "
    "Do not provide diagnoses or prescriptions. Keep answers concise and empathetic."
)

# -------------------- Utilities --------------------
def safe_json_req():
    try:
        return request.get_json(force=True)
    except Exception:
        return None

# -------------------- Routes --------------------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "gemini_configured": bool(model),
        "message": "AI Health Assistant API is running"
    }), 200

@app.route("/api/chat", methods=["POST"])
def chat():
    if not GEMINI_API_KEY or not model:
        return jsonify({"success": False, "error": "Gemini API key not configured on server."}), 503

    data = safe_json_req()
    if not data or "message" not in data:
        return jsonify({"success": False, "error": "Message is required."}), 400

    user_message = (data.get("message") or "").strip()
    if not user_message:
        return jsonify({"success": False, "error": "Message cannot be empty."}), 400

    # Emergency detection
    emergency_keywords = [
        "chest pain", "difficulty breathing", "severe bleeding",
        "unconscious", "heart attack", "stroke", "can't breathe", "cannot breathe"
    ]
    if any(k in user_message.lower() for k in emergency_keywords):
        emergency_response = (
            "🚨 EMERGENCY ALERT 🚨\n\n"
            "The symptoms you described may be serious. Please:\n"
            "1. Call emergency services immediately (108 in India, 911 in US)\n"
            "2. Go to the nearest emergency room\n"
            "3. Do not delay — seek immediate medical attention."
        )
        return jsonify({"success": True, "response": emergency_response, "is_emergency": True}), 200

    # Build prompt with optional history
    chat_history = data.get("history", []) or []
    conversation = ""
    for msg in chat_history[-5:]:
        conversation += f"User: {msg.get('user','')}\nAssistant: {msg.get('assistant','')}\n"

    full_prompt = f"{HEALTH_ASSISTANT_PROMPT}\n\n{conversation}\nUser: {user_message}\nAssistant:"
    logger.info("Prompt length: %d chars", len(full_prompt))

    try:
        gen_resp = model.generate_content(full_prompt)
        ai_text = getattr(gen_resp, "text", None) or str(gen_resp)
        ai_text = ai_text.strip()
        logger.info("Generated reply length: %d chars", len(ai_text))
        return jsonify({"success": True, "response": ai_text, "is_emergency": False}), 200
    except Exception as e:
        logger.exception("Gemini call failed: %s", e)
        return jsonify({"success": False, "error": "AI generation failed", "details": str(e)}), 500

# -------------------- Patient / Appointments / Medicine --------------------
@app.route("/api/register-patient", methods=["POST"])
def register_patient():
    data = safe_json_req()
    if not data:
        return jsonify({"status": "error", "message": "Invalid JSON"}), 400
    if DB_AVAILABLE:
        try:
            db.collection("patients").document(data["uid"]).set(data)
        except Exception as e:
            logger.exception("Failed to save patient: %s", e)
            return jsonify({"status": "error", "message": "DB write failed"}), 500
    return jsonify({"status": "success"}), 200

@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    if DB_AVAILABLE:
        try:
            docs = db.collection("appointments").stream()
            appointments = [doc.to_dict() for doc in docs]
            return jsonify(appointments), 200
        except Exception as e:
            logger.exception("Failed to fetch appointments: %s", e)
            return jsonify({"status": "error", "message": "DB read failed"}), 500
    return jsonify([]), 200

@app.route("/api/book-appointment", methods=["POST"])
def book_appointment():
    data = safe_json_req()
    if DB_AVAILABLE:
        try:
            db.collection("appointments").add(data)
        except Exception as e:
            logger.exception("Failed to book appointment: %s", e)
            return jsonify({"status": "error", "message": "DB write failed"}), 500
    return jsonify({"status": "booked"}), 200

@app.route("/api/search-medicine", methods=["GET"])
def search_medicine():
    name = (request.args.get("name") or "").lower()
    page = int(request.args.get("page", 1))
    per_page = 20
    filtered = []
    for m in MEDICINES:
        if not name or name in (m.get("name","").lower()):
            filtered.append(m)
    total = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page
    return jsonify({
        "results": filtered[start:end],
        "total_results": total,
        "page": page,
        "per_page": per_page
    }), 200

@app.route("/api/approve-doctor", methods=["POST"])
def approve_doctor():
    data = safe_json_req()
    if DB_AVAILABLE:
        try:
            db.collection("doctors").document(data["uid"]).update({"approved": data["status"]})
        except Exception as e:
            logger.exception("Failed approve doctor: %s", e)
            return jsonify({"status": "error", "message": "DB update failed"}), 500
    return jsonify({"status": "updated"}), 200

# -------------------- Run Flask --------------------
if __name__ == "__main__":
    logger.info("Starting Flask on http://0.0.0.0:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
