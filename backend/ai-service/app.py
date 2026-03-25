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

# PDF support
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

# ---------------- MongoDB ----------------

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

# ---------------- Tesseract ----------------

if os.getenv("TESSERACT_PATH"):
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")

# ---------------- Gemini ----------------

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(
    os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")
)

# ---------------- Prompts ----------------

SYSTEM_PROMPT = """
You are a helpful AI health assistant.

STRICT FORMAT:
- Use Markdown
- Use headings (##, ###)
- Use bullet points
- Keep answers structured
- DO NOT say you cannot read reports
"""

REPORT_PROMPT = """
Analyze the medical report and explain:

1. Important values
2. Abnormal values
3. What it means
4. Suggestions
5. Final advice
"""

# ---------------- OCR ----------------

def extract_image(path):
    try:
        return pytesseract.image_to_string(Image.open(path))
    except Exception as e:
        logger.error(f"OCR image error: {e}")
        return ""

def extract_pdf(path):
    text = ""

    if not PDF_SUPPORTED:
        return ""

    try:
        doc = fitz.open(path)

        for page in doc:
            page_text = page.get_text()

            if page_text.strip():
                text += page_text
            else:
                # OCR fallback
                pix = page.get_pixmap()
                img_path = path + ".png"
                pix.save(img_path)

                text += extract_image(img_path)

        doc.close()

    except Exception as e:
        logger.error(f"PDF error: {e}")

    return text

def extract_docx(path):
    try:
        doc = Document(path)
        return "\n".join(p.text for p in doc.paragraphs)
    except Exception as e:
        logger.error(f"DOCX error: {e}")
        return ""

# ---------------- Routes ----------------

@app.get("/health")
def health():
    return jsonify({"status": "ok"})

# ---------------- Medicine Search ----------------

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
        collection.find(query).skip(skip).limit(per_page)
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
            "composition": f"{m.get('composition_1','')} {m.get('composition_2','')}".strip()
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

    if request.content_type and "multipart" in request.content_type:
        data = request.form
    else:
        data = request.get_json(silent=True) or {}

    message = (data.get("message") or "").strip()

    # history parsing
    history_field = data.get("history", "[]")
    if isinstance(history_field, str):
        try:
            history = json.loads(history_field)
        except:
            history = []
    else:
        history = history_field or []

    if not message and not request.files:
        return jsonify({"error": "Message required"}), 400

    # ---------------- Extract Files ----------------

    extracted_text = ""

    for f in request.files.getlist("files"):
        ext = os.path.splitext(f.filename)[1].lower()

        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            f.save(tmp.name)

        try:
            if ext in [".jpg", ".png", ".jpeg"]:
                extracted_text += extract_image(tmp.name)

            elif ext == ".pdf":
                extracted_text += extract_pdf(tmp.name)

            elif ext == ".docx":
                extracted_text += extract_docx(tmp.name)

        finally:
            try:
                os.unlink(tmp.name)
            except:
                pass

    logger.info(f"📄 Extracted text preview:\n{extracted_text[:500]}")

    # 🚨 If file uploaded but no text extracted
    if request.files and not extracted_text.strip():
        return jsonify({
            "response": "⚠️ I couldn't read your report. Please upload a clearer file.",
            "is_emergency": False
        })

    # ---------------- Prompt ----------------

    if extracted_text.strip():
        prompt = f"""
{SYSTEM_PROMPT}

{REPORT_PROMPT}

Medical Report:
{extracted_text}

User Question:
{message}

Answer properly in structured format.
"""
    else:
        convo = ""
        for h in history[-5:]:
            convo += f"User: {h.get('user')}\nAssistant: {h.get('assistant')}\n"

        prompt = f"""
{SYSTEM_PROMPT}

{convo}

User: {message}

Assistant:
"""

    # ---------------- Gemini ----------------

    try:
        result = model.generate_content(prompt)
        text = result.text if hasattr(result, "text") else str(result)
    except Exception as e:
        logger.error(f"Gemini error: {e}")
        return jsonify({
            "response": "AI service temporarily unavailable.",
            "is_emergency": False
        })

    return jsonify({
        "response": text.strip(),
        "is_emergency": False
    })

# ---------------- Run ----------------

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))