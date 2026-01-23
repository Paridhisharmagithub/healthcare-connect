from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os, json, logging, tempfile
from dotenv import load_dotenv
from PIL import Image
import pytesseract
import fitz  # PyMuPDF
from docx import Document

# ---------------- Setup ----------------
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = Flask(__name__)
CORS(app)  # internal service only

# ---------------- Tesseract ----------------
pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")

# ---------------- Gemini ----------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(
    os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")
)

# ---------------- Prompt ----------------
SYSTEM_PROMPT = """
You are a science-based AI health assistant.
- Never diagnose or prescribe.
- Suggest lifestyle improvements.
- Encourage consulting a certified doctor.
- Be empathetic and concise.
"""
# ---------------- Medicine Data ----------------
MEDICINES = []

try:
    with open("indian_medicine_data.json", "r", encoding="utf-8") as f:
        MEDICINES = json.load(f)
except Exception as e:
    logger.warning(f"Could not load medicine data: {e}")

# ---------------- Utils ----------------
def extract_image(file):
    return pytesseract.image_to_string(Image.open(file.stream))

def extract_pdf(path):
    text = ""
    doc = fitz.open(path)
    for page in doc:
        text += page.get_text()
    return text

def extract_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

# ---------------- Routes ----------------
@app.get("/health")
def health():
    return jsonify({"status": "ok"})

@app.route("/api/search-medicine", methods=["GET"])
def search_medicine():
    name = (request.args.get("name") or "").lower()
    page = int(request.args.get("page", 1))
    per_page = 20

    filtered = [m for m in MEDICINES if not name or name in m.get("name", "").lower()]
    start = (page - 1) * per_page
    end = start + per_page

    return jsonify({
        "results": filtered[start:end],
        "total_results": len(filtered),
        "page": page,
        "per_page": per_page
    })

@app.post("/ai/chat")
def ai_chat():
    data = request.form if request.content_type.startswith("multipart") else request.json

    message = data.get("message", "").strip()
    history = json.loads(data.get("history", "[]"))

    if not message and not request.files:
        return jsonify({"error": "Message required"}), 400

    # Emergency detection
    emergency_words = [
        "chest pain", "difficulty breathing",
        "heart attack", "stroke", "unconscious"
    ]
    if any(w in message.lower() for w in emergency_words):
        return jsonify({
            "response": "🚨 EMERGENCY! Contact local emergency services immediately.",
            "is_emergency": True
        })

    # OCR
    extracted = ""
    for f in request.files.getlist("files"):
        ext = os.path.splitext(f.filename)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            f.save(tmp.name)
            if ext in [".jpg", ".jpeg", ".png"]:
                extracted += extract_image(f)
            elif ext == ".pdf":
                extracted += extract_pdf(tmp.name)
            elif ext == ".docx":
                extracted += extract_docx(tmp.name)

    convo = ""
    for h in history[-5:]:
        convo += f"User: {h.get('user')}\nAssistant: {h.get('assistant')}\n"

    prompt = f"""
{SYSTEM_PROMPT}

{convo}
User: {message}

Additional document context:
{extracted}

Assistant:
"""

    result = model.generate_content(prompt)
    text = getattr(result, "text", str(result))

    return jsonify({
        "response": text.strip(),
        "is_emergency": False
    })

# ---------------- Run ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
