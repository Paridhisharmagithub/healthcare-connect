from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import os
from dotenv import load_dotenv
import time
import json
import os
import requests
from flask import Flask, request, jsonify
from dotenv import load_dotenv

load_dotenv() 
GEMINI_KEY = os.getenv("GEMINI_KEY")
AI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"



app = Flask(__name__)
CORS(app)


with open("indian_medicine_data.json", "r", encoding="utf-8") as f:
    medicines = json.load(f)

# Firebase Initialization
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


# -------------------- Patient APIs --------------------
@app.route("/api/register-patient", methods=["POST"])
def register_patient():
    data = request.json
    db.collection("patients").document(data["uid"]).set(data)
    return jsonify({"status":"success"})


@app.route("/api/appointments", methods=["GET"])
def get_appointments():
    docs = db.collection("appointments").stream()
    appointments = [doc.to_dict() for doc in docs]
    return jsonify(appointments)


@app.route("/api/book-appointment", methods=["POST"])
def book_appointment():
    data = request.json
    db.collection("appointments").add(data)
    return jsonify({"status":"booked"})


@app.route("/api/upload-report", methods=["POST"])
def upload_report():
    file = request.files['file']
    # TODO: Upload to Azure blob and OCR processing
    ocr_text = "Sample OCR text"  # Replace with Azure OCR result
    db.collection("reports").add({
        "filename": file.filename,
        "ocr_text": ocr_text
    })
    return jsonify({"ocr_text": ocr_text, "file_url": f"/reports/{file.filename}"})


@app.route("/api/search-medicine", methods=["GET"])
def search_medicine():
    """
    Search medicines by name, type, manufacturer.
    Query params: name (str), type (str), manufacturer (str), page (int, optional)
    Pagination: 20 results per page
    """
    name_query = request.args.get("name", "").lower()
    type_query = request.args.get("type", "").lower()
    manufacturer_query = request.args.get("manufacturer", "").lower()
    page = int(request.args.get("page", 1))
    per_page = 20

    filtered = []
    for med in medicines:
        if name_query and name_query not in med["name"].lower():
            continue
        if type_query and type_query not in med["type"].lower():
            continue
        if manufacturer_query and manufacturer_query not in med["manufacturer_name"].lower():
            continue
        filtered.append(med)

    # Pagination
    total_results = len(filtered)
    start = (page - 1) * per_page
    end = start + per_page
    paginated = filtered[start:end]

    return jsonify({
        "results": paginated,
        "total_results": total_results,
        "page": page,
        "per_page": per_page
    })



@app.route("/api/ai-chat", methods=["POST"])
def ai_chat():
    prompt = request.json.get("prompt")
    if not prompt:
        return jsonify({"error": "Prompt required"}), 400

    headers = {
        "Authorization": f"Bearer {GEMINI_KEY}",
        "Content-Type": "application/json"
    }

    # Correct payload structure for Gemini 2.5
    payload = {
        "input": {
            "text": prompt
        }
    }

    try:
        r = requests.post(AI_ENDPOINT, headers=headers, json=payload)
        r.raise_for_status()
        data = r.json()
        ai_text = data.get("candidates", [{}])[0].get("output", "")
        return jsonify({"predictions": [{"content": ai_text}]})
    except Exception as e:
        print("Gemini API error:", e)
        return jsonify({"error": "AI service error"}), 500

if __name__ == "__main__":
    app.run(debug=True)




# -------------------- Doctor APIs --------------------
@app.route("/api/approve-doctor", methods=["POST"])
def approve_doctor():
    data = request.json
    db.collection("doctors").document(data["uid"]).update({"approved": data["status"]})
    return jsonify({"status":"updated"})


# -------------------- Run Flask --------------------
if __name__ == "__main__":
    app.run(debug=True)
