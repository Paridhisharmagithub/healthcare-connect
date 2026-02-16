from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json
import logging
import tempfile
from dotenv import load_dotenv
from PIL import Image
import pytesseract
from docx import Document
from pymongo import MongoClient

# ---------------- Optional PDF support ----------------

try:
    import fitz  # PyMuPDF
    PDF_SUPPORTED = True
except ImportError:
    fitz = None
    PDF_SUPPORTED = False

# ---------------- Setup ----------------

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = Flask(__name__)
CORS(app)

# ---------------- MongoDB Atlas Connection ----------------

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]


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

* Never diagnose or prescribe.
* Suggest lifestyle improvements.
* Encourage consulting a certified doctor.
* Be empathetic and concise.
  """

# ---------------- Utils ----------------

def extract_image(path_or_file):
    """Accept either a filesystem path (str) or a Flask/Werkzeug FileStorage."""
    if isinstance(path_or_file, str):
        return pytesseract.image_to_string(Image.open(path_or_file))
    # FileStorage-style object
    return pytesseract.image_to_string(Image.open(path_or_file.stream))


def extract_pdf(path):
    if not PDF_SUPPORTED:
        return "[PDF uploaded – text extraction not available]"
    text = ""
    doc = fitz.open(path)
    for page in doc:
        text += page.get_text()
    doc.close()
    return text


def extract_docx(path):
    doc = Document(path)
    return "\n".join(p.text for p in doc.paragraphs)

# ---------------- Routes ----------------

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

# ---------------- MongoDB Medicine Search ----------------

@app.get("/api/search-medicine")
def search_medicine():
    name = (request.args.get("name") or "").strip().lower()
    page = int(request.args.get("page", 1))
    per_page = 20
    skip = (page - 1) * per_page

    query = {}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}

    total = collection.count_documents(query)

    medicines = list(
        collection.find(query)
        .skip(skip)
        .limit(per_page)
    )

    results = []
    for m in medicines:
        results.append({
            "id": str(m.get("_id")),
            "name": m.get("name"),
            "price": m.get("price"),
            "manufacturer": m.get("manufacturer_name"),
            "type": m.get("type"),
            "pack_size": m.get("pack_size_label"),
            "composition": f"{m.get('composition_1','')} {m.get('composition_2','')}'.strip()" if False else f"{m.get('composition_1','')} {m.get('composition_2','')}".strip()
        })

    return jsonify({
        "results": results,
        "total_results": total,
        "page": page,
        "per_page": per_page
    })


# ---------------- AI Chat ----------------

@app.post("/ai/chat")
def ai_chat():
    data = request.form if (request.content_type and request.content_type.startswith("multipart")) else (request.get_json(silent=True) or {})
    message = (data.get("message") or "").strip()

    # flexible history parsing (accepts JSON string or list)
    history_field = data.get("history", "[]")
    if isinstance(history_field, str):
        try:
            history = json.loads(history_field)
        except Exception:
            history = []
    else:
        history = history_field or []

    if not message and not request.files:
        return jsonify({"error": "Message required"}), 400

    emergency_words = [
        "chest pain",
        "difficulty breathing",
        "heart attack",
        "stroke",
        "unconscious",
    ]

    if any(w in message.lower() for w in emergency_words):
        return jsonify({
            "response": "🚨 EMERGENCY! Contact local emergency services immediately.",
            "is_emergency": True,
        })

    extracted = ""
    for f in request.files.getlist("files"):
        ext = os.path.splitext(f.filename)[1].lower()
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            f.save(tmp.name)
        try:
            if ext in [".jpg", ".jpeg", ".png"]:
                extracted += extract_image(tmp.name)
            elif ext == ".pdf":
                extracted += extract_pdf(tmp.name)
            elif ext == ".docx":
                extracted += extract_docx(tmp.name)
        finally:
            try:
                os.unlink(tmp.name)
            except Exception:
                pass

    convo = ""
    for h in (history or [])[-5:]:
        convo += f"User: {h.get('user')}\nAssistant: {h.get('assistant')}\n"

    prompt = f"""{SYSTEM_PROMPT}\n\n{convo}User: {message}\n\nAdditional document context:\n{extracted}\n\nAssistant:"""

    result = model.generate_content(prompt)
    text = getattr(result, "text", "") or str(result)

    return jsonify({
        "response": text.strip(),
        "is_emergency": False,
    })


# ---------------- Run ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))
