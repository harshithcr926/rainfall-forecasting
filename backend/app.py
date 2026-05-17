"""
AI-Driven Rainfall Forecasting System - Flask Backend
Mini Project | 2nd Year Engineering
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, origins="*")

# Import route blueprints
from routes.dataset_routes import dataset_bp
from routes.ml_routes import ml_bp
from routes.dl_routes import dl_bp
from routes.rl_routes import rl_bp
from routes.predict_routes import predict_bp
from routes.eda_routes import eda_bp

app.register_blueprint(dataset_bp, url_prefix="/api/dataset")
app.register_blueprint(ml_bp,      url_prefix="/api/ml")
app.register_blueprint(dl_bp,      url_prefix="/api/dl")
app.register_blueprint(rl_bp,      url_prefix="/api/rl")
app.register_blueprint(predict_bp, url_prefix="/api/predict")
app.register_blueprint(eda_bp,     url_prefix="/api/eda")

@app.route("/")
def home():
    return jsonify({
        "message": "Rainfall Forecasting API is running",
        "version": "1.0.0",
        "project": "AI-Driven Rainfall Forecasting System"
    })

@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
