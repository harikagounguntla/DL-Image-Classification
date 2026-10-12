# AI Waste Classification Using Deep Learning

## Project Overview
This project uses deep learning and image classification to identify different types of waste, helping support waste segregation and waste management.

## Waste Categories
The model classifies waste into six categories:
- Cardboard
- Glass
- Metal
- Paper
- Plastic
- Trash

## Technologies Used
- Python
- TensorFlow / Keras
- Flask
- NumPy
- Pillow
- HTML, CSS, and JavaScript

## Features
- Upload an image of waste for classification
- Predict the waste category using a trained deep learning model
- View prediction history and category statistics on a dashboard

## Project Structure
- `app.py` — Flask web application
- `model/waste_model.keras` — Trained classification model
- `templates/` — HTML pages
- `static/` — CSS and JavaScript files
- `train_model.py` — Model training script
- `test_model.py` — Model testing script
- `requirements.txt` — Python dependencies

## How to Run Locally
1. Clone this repository.
2. Create and activate a Python virtual environment.
3. Install the dependencies:
   `pip install -r requirements.txt`
4. Start the application:
   `python app.py`
5. Open `http://127.0.0.1:5000/` in your browser.

## Dashboard
Open `http://127.0.0.1:5000/dashboard` to view the prediction dashboard while the application is running.

## Future Improvements
- Improve model accuracy with more training data.
- Deploy the application online.
- Add more waste categories and recycling recommendations.