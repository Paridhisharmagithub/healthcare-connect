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

# ---------------- PDF SUPPORT ----------------
try:
    import fitz  # PyMuPDF
    PDF_SUPPORTED = True
except ImportError:
    fitz = None
    PDF_SUPPORTED = False

# ---------------- SETUP ----------------
load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ai-service")

app = Flask(__name__)
CORS(app)

# ---------------- MONGODB ----------------
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

# ---------------- TESSERACT ----------------
if os.getenv("TESSERACT_PATH"):
    pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_PATH")

# ---------------- GEMINI ----------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel(
    os.getenv("GEMINI_MODEL", "models/gemini-2.5-flash")
)

# ---------------- PROMPTS ----------------
SYSTEM_PROMPT = """
You are a helpful AI health assistant.

STRICT FORMAT:
- Use Markdown
- Use headings (##, ###)
- Use bullet points
- Keep answers structured
- Be clear and helpful
"""

REPORT_PROMPT = """
Analyze the medical report and explain:

1. Important values
2. Abnormal values
3. What it means
4. Suggestions
5. Final advice
"""

# ---------------- OCR FUNCTIONS ----------------
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

# ---------------- HEALTH ----------------
@app.get("/health")
def health():
    return jsonify({"status": "ok"})

# ---------------- MEDICINE SEARCH ----------------
@app.get("/api/search-medicine")
def search_medicine():
    try:
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
                "id": str(m.get("_id", "")),
                "name": m.get("name", ""),
                "price": m.get("price") or m.get("price(₹)", ""),
                "manufacturer": m.get("manufacturer_name", ""),
                "type": m.get("type", ""),
                "pack_size": m.get("pack_size_label", ""),
                "composition": f"{m.get('short_composition1','')} {m.get('short_composition2','')}".strip()
            })

        return jsonify({
            "results": results,
            "total_results": total,
            "page": page,
            "per_page": per_page
        })

    except Exception as e:
        logger.error(f"🔥 Medicine search error: {e}")
        return jsonify({"error": str(e)}), 500

# ---------------- AI CHAT ----------------
@app.post("/ai/chat")
def ai_chat():
    try:
        # Detect multipart or JSON
        if request.content_type and "multipart" in request.content_type:
            data = request.form
        else:
            data = request.get_json(silent=True) or {}

        message = (data.get("message") or "").strip()

        # Parse history
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

        # ---------------- FILE EXTRACTION ----------------
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

        logger.info(f"📄 Extracted preview:\n{extracted_text[:300]}")

        # If file uploaded but nothing extracted
        if request.files and not extracted_text.strip():
            return jsonify({
                "response": "⚠️ Couldn't read the report clearly. Try a better image/PDF.",
                "is_emergency": False
            })

        # ---------------- PROMPT ----------------
        if extracted_text.strip():
            prompt = f"""
{SYSTEM_PROMPT}

{REPORT_PROMPT}

Medical Report:
{extracted_text}

User Question:
{message}

Answer in structured format.
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

        # ---------------- GEMINI ----------------
        result = model.generate_content(prompt)
        text = result.text if hasattr(result, "text") else str(result)

        return jsonify({
            "response": text.strip(),
            "is_emergency": False
        })

    except Exception as e:
        logger.error(f"🔥 AI error: {e}")
        return jsonify({
            "response": "AI service temporarily unavailable.",
            "is_emergency": False
        }), 500

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))