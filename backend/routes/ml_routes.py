"""
ML Routes - Train and compare ML models
Models: Linear Regression, Decision Tree, Random Forest, XGBoost
"""

from flask import Blueprint, jsonify
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings("ignore")

from routes.dataset_routes import dataset_store

ml_bp = Blueprint("ml", __name__)

# Store trained models and results
ml_store = {}


def get_xy(df):
    """Split dataset into features and target."""
    rain_col = next((c for c in df.columns if "rain" in c.lower()), df.columns[-1])
    feature_cols = [c for c in df.select_dtypes(include=[np.number]).columns if c != rain_col]
    X = df[feature_cols].values
    y = df[rain_col].values
    return X, y, feature_cols, rain_col


@ml_bp.route("/train", methods=["POST"])
def train_models():
    """Train all ML models and return comparison metrics."""
    if "df" not in dataset_store:
        return jsonify({"error": "No dataset loaded"}), 404

    df = dataset_store["df"]
    X, y, feature_cols, rain_col = get_xy(df)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    models = {
        "Linear Regression": LinearRegression(),
        "Decision Tree":     DecisionTreeRegressor(max_depth=6, random_state=42),
        "Random Forest":     RandomForestRegressor(n_estimators=50, max_depth=8, random_state=42),
    }

    # Try XGBoost
    try:
        from xgboost import XGBRegressor
        models["XGBoost"] = XGBRegressor(n_estimators=50, max_depth=4, random_state=42, verbosity=0)
    except ImportError:
        pass

    results = []
    best_r2 = -999
    best_model_name = ""

    for name, model in models.items():
        model.fit(X_train_s, y_train)
        preds = model.predict(X_test_s)

        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
        mae  = float(mean_absolute_error(y_test, preds))
        r2   = float(r2_score(y_test, preds))
        acc  = max(0.0, round(r2 * 100, 2))

        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name

        results.append({
            "model": name,
            "accuracy": acc,
            "rmse": round(rmse, 3),
            "mae":  round(mae, 3),
            "r2":   round(r2, 3)
        })

    # Store scaler + best model for prediction
    best_model = models[best_model_name]
    ml_store["scaler"]     = scaler
    ml_store["best_model"] = best_model
    ml_store["best_name"]  = best_model_name
    ml_store["feature_cols"] = feature_cols
    ml_store["all_models"] = {n: m for n, m in models.items()}

    # Prediction samples for chart
    sample_preds = best_model.predict(X_test_s[:30])
    prediction_chart = [
        {"index": i, "actual": round(float(y_test[i]), 2), "predicted": round(float(sample_preds[i]), 2)}
        for i in range(len(sample_preds))
    ]

    return jsonify({
        "success": True,
        "results": results,
        "best_model": best_model_name,
        "best_r2": round(best_r2, 3),
        "feature_cols": feature_cols,
        "target_col": rain_col,
        "prediction_chart": prediction_chart
    })


@ml_bp.route("/results", methods=["GET"])
def get_results():
    if not ml_store:
        return jsonify({"error": "Models not trained yet"}), 404
    return jsonify({
        "best_model": ml_store.get("best_name", ""),
        "feature_cols": ml_store.get("feature_cols", [])
    })
