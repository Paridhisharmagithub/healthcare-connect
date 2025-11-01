from flask import Flask, request, jsonify
from flask_cors import CORS
from firebase_admin import credentials, firestore
import firebase_admin
import google.generativeai as genai
import json, os, logging, tempfile
from dotenv import load_dotenv
from PIL import Image
import pytesseract
import fitz  # PyMuPDF
from docx import Document

# ---------------- Load Environment ----------------
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-health-backend")

# ---------------- Flask App ----------------
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# ---------------- Tesseract Setup ----------------
# Change path if installed in a different location
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# ---------------- Gemini AI Setup ----------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")

if GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(GEMINI_MODEL)
        logger.info("Gemini configured with model: %s", GEMINI_MODEL)
    except Exception as e:
        logger.exception("Failed to configure Gemini: %s", e)
        model = None
else:
    logger.warning("GEMINI_API_KEY not found — AI disabled")
    model = None

# ---------------- Firebase Setup ----------------
DB_AVAILABLE = False
try:
    cred_path = os.getenv("FIREBASE_SERVICE_ACCOUNT", "serviceAccountKey.json")
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        db = firestore.client()
        DB_AVAILABLE = True
        logger.info("Firebase initialized")
except Exception as e:
    logger.exception("Firebase init failed: %s", e)

# ---------------- Medicine Data ----------------
MEDICINES = []
try:
    with open("indian_medicine_data.json", "r", encoding="utf-8") as f:
        MEDICINES = json.load(f)
except Exception as e:
    logger.warning("Could not load medicine data: %s", e)

# ---------------- Health Assistant Prompt ----------------
HEALTH_ASSISTANT_PROMPT = """
You are a mindful, science-driven AI health assistant.
- Base all responses on reliable medical science.
- Suggest possible causes, preventive steps, lifestyle improvements.
- Never diagnose or prescribe.
- Include gentle reminders to consult a certified healthcare professional.
- Responses should be concise, empathetic, and understandable.
"""

# ---------------- Utilities ----------------
def safe_json_req():
    try:
        return request.get_json(force=True)
    except Exception:
        return None

def extract_text_from_image(file):
    img = Image.open(file.stream)
    return pytesseract.image_to_string(img)

def extract_text_from_pdf(file_path):
    text = ""
    try:
        doc = fitz.open(file_path)
        for page in doc:
            text += page.get_text()
    except Exception as e:
        logger.warning("PDF extraction failed: %s", e)
    return text

def extract_text_from_docx(file_path):
    text = ""
    try:
        doc = Document(file_path)
        text = "\n".join([p.text for p in doc.paragraphs])
    except Exception as e:
        logger.warning("DOCX extraction failed: %s", e)
    return text

# ---------------- Routes ----------------
@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status":"healthy","gemini_configured":bool(model)}), 200

@app.route("/api/chat", methods=["POST"])
def chat():
    if not model:
        return jsonify({"success": False, "error": "Gemini API key not configured."}), 503

    data = safe_json_req() or {}
    if not data.get("message") and not request.files:
        return jsonify({"success": False, "error": "Message required"}), 400

    user_message = (data.get("message") or "").strip()
    if not user_message and not request.files:
        return jsonify({"success": False, "error": "Message cannot be empty"}), 400

    # OCR handling
    ocr_text = ""
    if request.files:
        for f in request.files.getlist("files"):
            ext = os.path.splitext(f.filename)[1].lower()
            with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                f.save(tmp.name)
                if ext in [".jpg", ".jpeg", ".png", ".bmp", ".tiff"]:
                    ocr_text += extract_text_from_image(f) + "\n"
                elif ext == ".pdf":
                    ocr_text += extract_text_from_pdf(tmp.name) + "\n"
                elif ext == ".docx":
                    ocr_text += extract_text_from_docx(tmp.name) + "\n"

    # Emergency detection
    emergency_keywords = [
        "chest pain","difficulty breathing","severe bleeding",
        "unconscious","heart attack","stroke","can't breathe","cannot breathe"
    ]
    if any(k in user_message.lower() for k in emergency_keywords):
        return jsonify({"success": True, "response":"🚨 EMERGENCY ALERT! Call emergency services immediately.", "is_emergency": True}), 200

    # Conversation history
    chat_history = data.get("history", []) or []
    conversation = ""
    for msg in chat_history[-5:]:
        conversation += f"User: {msg.get('user','')}\nAssistant: {msg.get('assistant','')}\n"

    full_prompt = f"{HEALTH_ASSISTANT_PROMPT}\n\n{conversation}\nUser: {user_message}\n"
    if ocr_text:
        full_prompt += f"\nAlso, consider the following extracted document/report content:\n{ocr_text}\n"
    full_prompt += "Assistant:"

    try:
        gen_resp = model.generate_content(full_prompt)
        ai_text = getattr(gen_resp,"text",None) or str(gen_resp)
        return jsonify({"success": True, "response": ai_text.strip(), "is_emergency": False}), 200
    except Exception as e:
        logger.exception("Gemini call failed: %s", e)
        return jsonify({"success": False, "error":"AI generation failed", "details":str(e)}),500

# ---------------- Other endpoints ----------------
@app.route("/api/register-patient", methods=["POST"])
def register_patient():
    data = safe_json_req()
    if not data: return jsonify({"status":"error","message":"Invalid JSON"}),400
    if DB_AVAILABLE:
        try: db.collection("patients").document(data["uid"]).set(data)
        except Exception as e: return jsonify({"status":"error","message":"DB write failed"}),500
    return jsonify({"status":"success"}),200

@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    if DB_AVAILABLE:
        try:
            docs = db.collection("appointments").stream()
            return jsonify([d.to_dict() for d in docs]),200
        except Exception as e:
            return jsonify({"status":"error","message":"DB read failed"}),500
    return jsonify([]),200

@app.route("/api/book-appointment", methods=["POST"])
def book_appointment():
    data = safe_json_req()
    if DB_AVAILABLE:
        try: db.collection("appointments").add(data)
        except Exception as e:
            return jsonify({"status":"error","message":"DB write failed"}),500
    return jsonify({"status":"booked"}),200

@app.route("/api/search-medicine", methods=["GET"])
def search_medicine():
    name = (request.args.get("name") or "").lower()
    page=int(request.args.get("page",1))
    per_page=20
    filtered=[m for m in MEDICINES if not name or name in (m.get("name","").lower())]
    start=(page-1)*per_page
    end=start+per_page
    return jsonify({"results":filtered[start:end],"total_results":len(filtered),"page":page,"per_page":per_page}),200

@app.route("/api/approve-doctor", methods=["POST"])
def approve_doctor():
    data=safe_json_req()
    if DB_AVAILABLE:
        try: db.collection("doctors").document(data["uid"]).update({"approved":data["status"]})
        except Exception as e:
            return jsonify({"status":"error","message":"DB update failed"}),500
    return jsonify({"status":"updated"}),200

# ---------------- Run Flask ----------------
if __name__=="__main__":
    logger.info("Starting Flask on http://0.0.0.0:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
