import tensorflow as tf
import numpy as np
from PIL import Image

# ============================================================
# SETTINGS
# ============================================================

MODEL_PATH = "model/waste_model.keras"

IMAGE_PATH = (
    r"C:\Users\harik\OneDrive\Desktop\Image Clasification\test_images\cardboard.jpg"
)

# IMPORTANT:
# Must be exactly the same order as training
CLASS_NAMES = [
    "cardboard",
    "glass",
    "metal",
    "paper",
    "plastic",
    "trash"
]

IMAGE_SIZE = (224, 224)

# ============================================================
# LOAD MODEL
# ============================================================

print("Loading model...")

model = tf.keras.models.load_model(MODEL_PATH)

print("Model loaded successfully.")

# ============================================================
# LOAD IMAGE
# ============================================================

image = Image.open(IMAGE_PATH).convert("RGB")

print("Original image size:", image.size)

image = image.resize(IMAGE_SIZE)

# Convert to float32
image_array = np.array(image).astype("float32")

# IMPORTANT:
# DO NOT divide by 255 here.
#
# The model already contains:
#
# Rescaling(1 / 127.5, offset=-1)
#
# Therefore the model itself converts:
# 0-255 -> -1 to +1

# Add batch dimension
image_array = np.expand_dims(image_array, axis=0)

# ============================================================
# PREDICTION
# ============================================================

prediction = model.predict(image_array, verbose=0)

probabilities = prediction[0]

predicted_index = np.argmax(probabilities)

predicted_class = CLASS_NAMES[predicted_index]

confidence = probabilities[predicted_index] * 100

# ============================================================
# DISPLAY ALL PROBABILITIES
# ============================================================

print("\n========================================")
print("AI WASTE CLASSIFICATION RESULT")
print("========================================")

print(f"Predicted waste : {predicted_class}")
print(f"Confidence      : {confidence:.2f}%")

print("\nAll class probabilities:")

for i, class_name in enumerate(CLASS_NAMES):

    probability = probabilities[i] * 100

    print(
        f"{class_name:10} : {probability:.2f}%"
    )

print("========================================")