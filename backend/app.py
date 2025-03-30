from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import cv2
from google.cloud import vision
import io
from openai import OpenAI
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)



materials = ["denim", "wool", "cotton", "silk", "leather", "linen", "polyester", "nylon"]
items = ["pant", "sweater", "shirt", "jacket", "dress", "scarf", "hat", "glove", "shoes", "skirt", "jeans", "coat"]


CX = os.getenv("CX")
API_KEY = os.getenv("API_KEY")

def detect_labels(image_path):
    """Detects labels in an image using Google Cloud Vision API."""

    print("detectinglabels")

    client = vision.ImageAnnotatorClient()


    with io.open(image_path, 'rb') as image_file:
        content = image_file.read()

    image = vision.Image(content=content)

    response = client.label_detection(image=image, max_results=20)

    labels = response.label_annotations

    label_descriptions = [label.description for label in labels]

    if response.error.message:
        raise Exception(f"Error occurred: {response.error.message}")

    return label_descriptions

def google_image_search(query, type_filter=None, color_filter=None):
    query = "embroidered " + query
    if type_filter:
        query += " " + " ".join(type_filter)
    if color_filter:
        query += " " + " ".join(color_filter)

    search_url = f"https://www.googleapis.com/customsearch/v1?q={query}&cx={CX}&key={API_KEY}&searchType=image"

    print(search_url)
    response = requests.get(search_url)
    
    return response.json() if response.status_code == 200 else {'errorrrrr': response.text}

@app.route('/search_images/', methods=["POST"])
def search_images():
    if request.method == 'OPTIONS':
      return '', 200 

    data = request.json
    query = data.get('query')
    filters = data.get('filters', {})
    type_filter = filters.get('type', [])
    color_filter = filters.get('colors', [])

    google_results = google_image_search(query, type_filter, color_filter)

    return jsonify(google_results)

@app.route("/analyze/", methods=["POST"])
def analyze_clothing():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]

    if file.filename == '':
      return jsonify({'error': 'No selected file'}), 400

    contents = file.read()

    image = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(image, cv2.IMREAD_COLOR)

    temp_image_path = "temp_image.jpg"
    cv2.imwrite(temp_image_path, img)


    try:
        labels = detect_labels(temp_image_path)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    detected_materials = []
    detected_items = []

    labels = [label.lower() for label in labels]

    detected_materials = [material for material in materials if any(material in label.lower() for label in labels)]
    detected_items = [item for item in items if any(item in label.lower() for label in labels)]

    if not detected_materials:
        detected_materials = ["not detected"]
    if not detected_items:
        detected_items = ["not detected"]

    result = {
        "materials": detected_materials,
        "items": detected_items
    }

    return jsonify({"message": "Image received", "result": result})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)