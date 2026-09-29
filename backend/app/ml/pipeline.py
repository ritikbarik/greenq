"""
Machine Learning Training, Evaluation, and Prediction Pipeline.
Trains Random Forest / Gradient Boosting regressor on maritime operational features.
Provides actual evaluation metrics (MAE, RMSE, R2) and explainable sensitivity analysis.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, Optional
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from app.config import settings
from app.ml.dataset_generator import save_default_dataset_if_needed, generate_synthetic_dataset

CATEGORICAL_FEATURES = ["vessel_type", "fuel_type"]
NUMERICAL_FEATURES = ["capacity", "cargo_load", "distance", "speed", "engine_power", "weather_factor"]
FEATURE_ORDER = CATEGORICAL_FEATURES + NUMERICAL_FEATURES
TARGET_COLUMN = "fuel_consumption"

class FuelPredictionMLPipeline:
    def __init__(self, model_file: str = settings.MODEL_FILE, dataset_file: str = settings.DATASET_FILE):
        self.model_file = model_file
        self.dataset_file = dataset_file
        self.pipeline: Optional[Pipeline] = None
        self.metrics: Dict[str, Any] = {}
        self.actual_vs_predicted_sample: list = []
        self.feature_importances: Dict[str, float] = {}

    def build_preprocessor(self) -> ColumnTransformer:
        return ColumnTransformer(
            transformers=[
                ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES),
                ("num", StandardScaler(), NUMERICAL_FEATURES)
            ]
        )

    def train(self, model_type: str = "RandomForest", n_samples: int = 2500) -> Dict[str, Any]:
        """Trains ML model on dataset and computes honest metrics."""
        save_default_dataset_if_needed(self.dataset_file)
        df = pd.read_csv(self.dataset_file)
        
        X = df[FEATURE_ORDER]
        y = df[TARGET_COLUMN]

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=settings.DEFAULT_RANDOM_SEED
        )

        preprocessor = self.build_preprocessor()

        if model_type == "GradientBoosting":
            regressor = GradientBoostingRegressor(
                n_estimators=120, learning_rate=0.08, max_depth=5, random_state=settings.DEFAULT_RANDOM_SEED
            )
            model_name = "GradientBoostingRegressor"
        else:
            regressor = RandomForestRegressor(
                n_estimators=100, max_depth=12, random_state=settings.DEFAULT_RANDOM_SEED, n_jobs=-1
            )
            model_name = "RandomForestRegressor"

        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("regressor", regressor)
        ])

        pipeline.fit(X_train, y_train)
        self.pipeline = pipeline

        # Evaluation
        y_pred = pipeline.predict(X_test)
        mae = float(mean_absolute_error(y_test, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
        r2 = float(r2_score(y_test, y_pred))

        # Extract feature importances
        onehot_cols = list(pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(CATEGORICAL_FEATURES))
        all_features = onehot_cols + NUMERICAL_FEATURES
        raw_importances = regressor.feature_importances_
        
        importance_dict = {}
        for feat, imp in zip(all_features, raw_importances):
            # Aggregate onehot to parent feature or keep
            importance_dict[feat] = round(float(imp), 4)
        
        # Sort top 10
        sorted_importances = dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True)[:10])

        # Actual vs predicted sample (first 40 test samples for charting)
        sample_results = []
        for act, pred in zip(y_test.iloc[:40], y_pred[:40]):
            sample_results.append({
                "actual": round(float(act), 2),
                "predicted": round(float(pred), 2),
                "residual": round(float(act - pred), 2)
            })

        self.metrics = {
            "model_name": model_name,
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2_score": round(r2, 4),
            "training_samples": len(X_train),
            "testing_samples": len(X_test),
            "feature_importances": sorted_importances,
            "actual_vs_predicted_sample": sample_results
        }

        # Save to disk
        os.makedirs(os.path.dirname(self.model_file), exist_ok=True)
        joblib.dump({"pipeline": self.pipeline, "metrics": self.metrics}, self.model_file)
        print(f"[ML Pipeline] Trained {model_name}: R2={r2:.4f}, MAE={mae:.2f}, RMSE={rmse:.2f}")

        return self.metrics

    def load_or_train(self) -> Pipeline:
        if self.pipeline is not None:
            return self.pipeline

        if os.path.exists(self.model_file):
            try:
                saved = joblib.load(self.model_file)
                self.pipeline = saved["pipeline"]
                self.metrics = saved.get("metrics", {})
                return self.pipeline
            except Exception as e:
                print(f"[ML Pipeline] Could not load saved model ({e}), retraining...")
        
        self.train()
        return self.pipeline

    def predict(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Runs inference and generates physical explainability breakdown."""
        pipeline = self.load_or_train()
        
        df_in = pd.DataFrame([{
            "vessel_type": input_data["vessel_type"],
            "fuel_type": input_data["fuel_type"],
            "capacity": float(input_data["capacity"]),
            "cargo_load": float(input_data["cargo_load"]),
            "distance": float(input_data["distance"]),
            "speed": float(input_data["speed"]),
            "engine_power": float(input_data.get("engine_power", 18000.0)),
            "weather_factor": float(input_data.get("weather_factor", 1.05))
        }])

        pred_val = float(pipeline.predict(df_in[FEATURE_ORDER])[0])
        pred_val = max(1.0, round(pred_val, 2))

        # Sensitivity calculations (what happens if speed changes by +2 knots, cargo by +10%, etc.)
        df_speed_up = df_in.copy()
        df_speed_up["speed"] += 2.0
        pred_speed_up = float(pipeline.predict(df_speed_up[FEATURE_ORDER])[0])

        df_speed_down = df_in.copy()
        df_speed_down["speed"] = max(8.0, df_speed_down["speed"].iloc[0] - 2.0)
        pred_speed_down = float(pipeline.predict(df_speed_down[FEATURE_ORDER])[0])

        # Specific consumption
        specific_per_nm = round(pred_val / max(1.0, input_data["distance"]), 4)

        explanation = {
            "speed_cube_impact": (
                f"Increasing speed by 2 knots (+{round(2.0/input_data['speed']*100, 1)}%) increases fuel "
                f"consumption by approx {round(((pred_speed_up - pred_val)/pred_val)*100, 1)}% due to hydrodynamic cubic drag resistance (P ∝ v³)."
            ),
            "slow_steaming_saving": (
                f"Reducing speed by 2 knots saves approx "
                f"{round(((pred_val - pred_speed_down)/pred_val)*100, 1)}% in fuel."
            ),
            "displacement_factor": (
                f"Vessel load ratio is {round(input_data['cargo_load']/max(1.0, input_data['capacity'])*100, 1)}% of design capacity."
            ),
            "weather_impact": (
                f"Weather factor {input_data.get('weather_factor', 1.05)} accounts for wave resistance and adverse current."
            )
        }

        return {
            "predicted_fuel_tonnes": pred_val,
            "specific_consumption_per_nm": specific_per_nm,
            "explanation": explanation
        }

ml_pipeline = FuelPredictionMLPipeline()
