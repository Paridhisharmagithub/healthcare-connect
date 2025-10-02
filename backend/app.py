from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import requests
import os

app = Flask(__name__)
CORS(app)

# Firebase Initialization
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Environment variables
AZURE_KEY = os.environ.get("AZURE_KEY")
OPENFDA_URL = "https://api.fda.gov/drug/label.json"
GEMINI_KEY = os.environ.get("GEMINI_KEY")

# ---------------------
# PATIENT APIs
# ---------------------
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
    # Save in Firestore
    doc_ref = db.collection("reports").add({
        "filename": file.filename,
        "ocr_text": ocr_text
    })
    return jsonify({"ocr_text": ocr_text, "file_url": f"/reports/{file.filename}"})

@app.route("/api/search-drug", methods=["GET"])
def search_drug():
    query = request.args.get("q")
    r = requests.get(OPENFDA_URL, params={"search": f"brand_name:{query}"})
    return jsonify(r.json())

@app.route("/api/ai-chat", methods=["POST"])
def ai_chat():
    prompt = request.json.get("prompt")
    # TODO: Connect to Gemini API
    response = {"predictions":[{"content":"AI response placeholder"}]}
    return jsonify(response)

# ---------------------
# DOCTOR APIs
# ---------------------
@app.route("/api/approve-doctor", methods=["POST"])
def approve_doctor():
    data = request.json
    db.collection("doctors").document(data["uid"]).update({"approved": data["status"]})
    return jsonify({"status":"updated"})

# ---------------------
# RUN APP
# ---------------------
if __name__ == "__main__":
    app.run(debug=True)
