"""
Dataset Routes - Upload, Preview, Preprocess CSV
"""

from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
import io
import json

dataset_bp = Blueprint("dataset", __name__)

# In-memory dataset store (for demo; use DB in production)
dataset_store = {}

@dataset_bp.route("/upload", methods=["POST"])
def upload_dataset():
    """Upload and preprocess a CSV dataset."""
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    try:
        content = file.read().decode("utf-8")
        df = pd.read_csv(io.StringIO(content))

        # --- Basic Preprocessing ---
        original_shape = df.shape
        missing_before = int(df.isnull().sum().sum())

        # Fill numeric NaN with column mean
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        for col in numeric_cols:
            df[col].fillna(df[col].mean(), inplace=True)

        # Drop rows still having NaN
        df.dropna(inplace=True)
        missing_after = int(df.isnull().sum().sum())

        # Store globally for other routes
        dataset_store["df"] = df
        dataset_store["numeric_cols"] = numeric_cols

        # Preview (first 20 rows)
        preview = df.head(20).to_dict(orient="records")

        # Basic statistics
        stats = df.describe().round(3).to_dict()

        return jsonify({
            "success": True,
            "filename": file.filename,
            "original_shape": list(original_shape),
            "processed_shape": list(df.shape),
            "columns": df.columns.tolist(),
            "numeric_cols": numeric_cols,
            "missing_before": missing_before,
            "missing_after": missing_after,
            "preview": preview,
            "stats": stats
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@dataset_bp.route("/info", methods=["GET"])
def dataset_info():
    """Return current dataset info."""
    if "df" not in dataset_store:
        return jsonify({"error": "No dataset loaded"}), 404
    df = dataset_store["df"]
    return jsonify({
        "shape": list(df.shape),
        "columns": df.columns.tolist(),
        "numeric_cols": dataset_store.get("numeric_cols", [])
    })


@dataset_bp.route("/sample", methods=["GET"])
def sample_data():
    """Return or generate a sample dataset for demo."""
    np.random.seed(42)
    n = 200
    temperature = np.random.uniform(20, 40, n)
    humidity    = np.random.uniform(40, 100, n)
    windspeed   = np.random.uniform(0, 30, n)
    pressure    = np.random.uniform(990, 1020, n)
    moisture    = np.random.uniform(30, 90, n)
    visibility  = np.random.uniform(1, 10, n)

    # Rainfall dependent on humidity + moisture
    rainfall = (
        0.4 * humidity
        + 0.3 * moisture
        - 0.2 * temperature
        + np.random.normal(0, 5, n)
    ).clip(0, 150)

    df = pd.DataFrame({
        "temperature": temperature.round(2),
        "humidity":    humidity.round(2),
        "windspeed":   windspeed.round(2),
        "pressure":    pressure.round(2),
        "moisture":    moisture.round(2),
        "visibility":  visibility.round(2),
        "rainfall":    rainfall.round(2)
    })

    dataset_store["df"] = df
    dataset_store["numeric_cols"] = df.columns.tolist()

    return jsonify({
        "success": True,
        "filename": "sample_dataset.csv",
        "original_shape": list(df.shape),
        "processed_shape": list(df.shape),
        "columns": df.columns.tolist(),
        "numeric_cols": df.columns.tolist(),
        "missing_before": 0,
        "missing_after": 0,
        "preview": df.head(20).to_dict(orient="records"),
        "stats": df.describe().round(3).to_dict()
    })
