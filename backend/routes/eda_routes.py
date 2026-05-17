"""
EDA Routes - Exploratory Data Analysis
Returns chart-ready JSON data for Recharts
"""

from flask import Blueprint, jsonify
import numpy as np
from routes.dataset_routes import dataset_store

eda_bp = Blueprint("eda", __name__)


def get_df():
    if "df" not in dataset_store:
        return None
    return dataset_store["df"]


@eda_bp.route("/rainfall-trend", methods=["GET"])
def rainfall_trend():
    df = get_df()
    if df is None:
        return jsonify({"error": "No dataset loaded"}), 404

    col = "rainfall" if "rainfall" in df.columns else df.columns[-1]
    data = [{"index": i, "rainfall": round(float(v), 2)}
            for i, v in enumerate(df[col].values[:100])]
    return jsonify({"data": data, "column": col})


@eda_bp.route("/temperature-vs-rainfall", methods=["GET"])
def temperature_vs_rainfall():
    df = get_df()
    if df is None:
        return jsonify({"error": "No dataset loaded"}), 404

    temp_col = next((c for c in df.columns if "temp" in c.lower()), None)
    rain_col = next((c for c in df.columns if "rain" in c.lower()), df.columns[-1])
    if not temp_col:
        return jsonify({"error": "No temperature column found"}), 400

    data = [{"temperature": round(float(t), 2), "rainfall": round(float(r), 2)}
            for t, r in zip(df[temp_col].values[:150], df[rain_col].values[:150])]
    return jsonify({"data": data})


@eda_bp.route("/humidity-vs-rainfall", methods=["GET"])
def humidity_vs_rainfall():
    df = get_df()
    if df is None:
        return jsonify({"error": "No dataset loaded"}), 404

    hum_col  = next((c for c in df.columns if "humid" in c.lower()), None)
    rain_col = next((c for c in df.columns if "rain" in c.lower()), df.columns[-1])
    if not hum_col:
        return jsonify({"error": "No humidity column found"}), 400

    data = [{"humidity": round(float(h), 2), "rainfall": round(float(r), 2)}
            for h, r in zip(df[hum_col].values[:150], df[rain_col].values[:150])]
    return jsonify({"data": data})


@eda_bp.route("/correlation", methods=["GET"])
def correlation():
    df = get_df()
    if df is None:
        return jsonify({"error": "No dataset loaded"}), 404

    numeric = df.select_dtypes(include=[np.number])
    corr = numeric.corr().round(3)
    cols = corr.columns.tolist()

    matrix = []
    for r in cols:
        for c in cols:
            matrix.append({"row": r, "col": c, "value": float(corr.loc[r, c])})

    return jsonify({"columns": cols, "matrix": matrix})


@eda_bp.route("/seasonal", methods=["GET"])
def seasonal():
    """Simulate monthly/seasonal rainfall pattern."""
    df = get_df()
    if df is None:
        return jsonify({"error": "No dataset loaded"}), 404

    rain_col = next((c for c in df.columns if "rain" in c.lower()), df.columns[-1])
    values = df[rain_col].values
    months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

    # Chunk into 12 groups
    chunk = max(1, len(values) // 12)
    seasonal_data = []
    for i, month in enumerate(months):
        chunk_vals = values[i*chunk:(i+1)*chunk]
        avg = float(np.mean(chunk_vals)) if len(chunk_vals) > 0 else 0
        seasonal_data.append({"month": month, "avgRainfall": round(avg, 2)})

    return jsonify({"data": seasonal_data})


@eda_bp.route("/statistics", methods=["GET"])
def statistics():
    df = get_df()
    if df is None:
        return jsonify({"error": "No dataset loaded"}), 404

    stats = df.describe().round(3).to_dict()
    return jsonify({"stats": stats, "shape": list(df.shape), "columns": df.columns.tolist()})
