from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os, json, logging, tempfile, sqlite3
from dotenv import load_dotenv
from PIL import Image
import pytesseract
from docx import Document

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

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "medicine.db")

def get_db():
    return sqlite3.connect(DB_PATH, check_same_thread=False)

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

# ---------------- Utils ----------------
def extract_image(file):
    return pytesseract.image_to_string(Image.open(file.stream))

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

@app.get("/api/search-medicine")
def search_medicine():
    name = (request.args.get("name") or "").strip()
    page = int(request.args.get("page", 1))
    per_page = 20
    offset = (page - 1) * per_page

    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            id, name, price, manufacturer_name,
            type, pack_size_label, composition_1, composition_2
        FROM medicines
        WHERE LOWER(name) LIKE ?
        LIMIT ? OFFSET ?
    """, (f"%{name.lower()}%", per_page, offset))

    rows = cur.fetchall()

    cur.execute(
        "SELECT COUNT(*) FROM medicines WHERE LOWER(name) LIKE ?",
        (f"%{name.lower()}%",)
    )
    total = cur.fetchone()[0]

    cur.close()
    conn.close()

    results = [
        {
            "id": r[0],
            "name": r[1],
            "price": r[2],
            "manufacturer": r[3],
            "type": r[4],
            "pack_size": r[5],
            "composition": f"{r[6]} {r[7]}".strip()
        }
        for r in rows
    ]

    return jsonify({
        "results": results,
        "total_results": total,
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

    emergency_words = [
        "chest pain", "difficulty breathing",
        "heart attack", "stroke", "unconscious"
    ]
    if any(w in message.lower() for w in emergency_words):
        return jsonify({
            "response": "🚨 EMERGENCY! Contact local emergency services immediately.",
            "is_emergency": True
        })

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
