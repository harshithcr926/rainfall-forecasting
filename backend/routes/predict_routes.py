"""
Predict Routes - Rainfall prediction from user input
"""

from flask import Blueprint, jsonify, request
import numpy as np

from routes.dataset_routes import dataset_store
from routes.ml_routes import ml_store

predict_bp = Blueprint("predict", __name__)

# Prediction history (in-memory)
prediction_history = []


@predict_bp.route("/rainfall", methods=["POST"])
def predict_rainfall():
    """Predict rainfall from weather parameters."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data"}), 400

    # Extract inputs
    temperature = float(data.get("temperature", 25))
    humidity    = float(data.get("humidity", 70))
    windspeed   = float(data.get("windspeed", 10))
    pressure    = float(data.get("pressure", 1010))
    moisture    = float(data.get("moisture", 60))
    visibility  = float(data.get("visibility", 5))

    # --- Use trained ML model if available ---
    if ml_store.get("best_model") and ml_store.get("scaler"):
        try:
            scaler  = ml_store["scaler"]
            model   = ml_store["best_model"]
            feats   = ml_store["feature_cols"]

            input_map = {
                "temperature": temperature,
                "humidity":    humidity,
                "windspeed":   windspeed,
                "pressure":    pressure,
                "moisture":    moisture,
                "visibility":  visibility
            }

            X = np.array([[input_map.get(f, 0) for f in feats]])
            X_s = scaler.transform(X)
            pred = float(model.predict(X_s)[0])
            model_used = ml_store["best_name"]
        except Exception as e:
            pred = _heuristic_predict(temperature, humidity, windspeed, pressure, moisture)
            model_used = "Heuristic (fallback)"
    else:
        pred = _heuristic_predict(temperature, humidity, windspeed, pressure, moisture)
        model_used = "Heuristic (no model trained)"

    pred = max(0.0, round(pred, 2))

    # Rainfall probability (0-100%)
    probability = min(100.0, round((pred / 150) * 100, 1))

    # Rainfall level classification
    if pred < 2.5:
        level = "No Rain"
        insight = "Clear skies expected. Low humidity conditions."
    elif pred < 10:
        level = "Light Rain"
        insight = "Slight chance of drizzle. Carry an umbrella just in case."
    elif pred < 35:
        level = "Moderate Rain"
        insight = "Moderate rainfall expected. Expect wet conditions."
    elif pred < 65:
        level = "Heavy Rain"
        insight = "Heavy rainfall likely. Avoid outdoor activities."
    else:
        level = "Very Heavy Rain"
        insight = "Severe rainfall. Stay indoors. Possible flooding."

    result = {
        "predicted_rainfall": pred,
        "probability": probability,
        "level": level,
        "insight": insight,
        "model_used": model_used,
        "inputs": {
            "temperature": temperature,
            "humidity":    humidity,
            "windspeed":   windspeed,
            "pressure":    pressure,
            "moisture":    moisture,
            "visibility":  visibility
        }
    }

    prediction_history.append(result)

    return jsonify(result)


@predict_bp.route("/history", methods=["GET"])
def get_history():
    return jsonify({"history": prediction_history[-20:]})


def _heuristic_predict(temperature, humidity, windspeed, pressure, moisture):
    """Simple heuristic when no model is trained."""
    rain = (
        0.4 * humidity
        + 0.3 * moisture
        - 0.2 * temperature
        + 0.05 * windspeed
        - 0.02 * (pressure - 1013)
    )
    return max(0.0, rain)
