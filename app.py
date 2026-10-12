from flask import Flask, render_template, request
import tensorflow as tf
import numpy as np
from PIL import Image, UnidentifiedImageError
import os
import json
from datetime import datetime

app = Flask(__name__)

# Load trained AI model
MODEL_PATH = "model/waste_model.keras"
model = tf.keras.models.load_model(MODEL_PATH)

# Waste categories
class_names = [
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic",
    "trash"
]

HISTORY_PATH = "prediction_history.json"

def load_history():
    if not os.path.exists(HISTORY_PATH):
        return []

    try:
        with open(HISTORY_PATH, "r", encoding="utf-8") as file:
            data = json.load(file)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []

def save_history(history):
    with open(HISTORY_PATH, "w", encoding="utf-8") as file:
        json.dump(history, file, indent=4)

# Home page
@app.route("/")
def home():
    return render_template("index.html")

# Image prediction
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return "No image uploaded.", 400

    file = request.files["image"]

    if file.filename == "":
        return "No image selected.", 400

    try:
        image = Image.open(file).convert("RGB")
        image = image.resize((224, 224))

        image_array = np.array(image)
        image_array = np.expand_dims(image_array, axis=0)

        prediction = model.predict(image_array, verbose=0)

        predicted_index = int(np.argmax(prediction[0]))
        predicted_class = class_names[predicted_index]
        confidence = float(prediction[0][predicted_index] * 100)

        history = load_history()
        history.append({
            "category": predicted_class,
            "confidence": round(confidence, 2),
            "date_time": datetime.now().strftime(
                "%Y-%m-%d %H:%M:%S"
            )
        })
        save_history(history)

        return render_template(
            "index.html",
            prediction=predicted_class,
            confidence=f"{confidence:.2f}"
        )

    except (UnidentifiedImageError, OSError, ValueError):
        return "Could not process this image. Please try another.", 400

# Dashboard page
@app.route("/dashboard")
def dashboard():
    history = load_history()

    categories = class_names
    counts = {category: 0 for category in categories}

    for item in history:
        category = item.get("category")
        if category in counts:
            counts[category] += 1

    return render_template(
        "dashboard.html",
        total_predictions=len(history),
        categories=categories,
        counts=counts,
        category_counts=[
            counts[category] for category in categories
        ]
    )

if __name__ == "__main__":
    app.run(debug=True)