from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import PredictionRecord
from app.schemas.schemas import FuelPredictionInput, FuelPredictionOutput, ModelMetricsResponse
from app.ml.pipeline import ml_pipeline
from app.emissions.calculator import emission_calculator
from app.emissions.calculator import DEFAULT_EMISSION_FACTORS

router = APIRouter(prefix="/predict", tags=["Fuel Prediction"])

@router.post("/fuel", response_model=FuelPredictionOutput)
def predict_fuel_consumption(req: FuelPredictionInput, db: Session = Depends(get_db)):
    try:
        # Run ML inference
        pred_res = ml_pipeline.predict(req.model_dump())
        fuel_tonnes = pred_res["predicted_fuel_tonnes"]

        # Calculate emissions
        emis = emission_calculator.calculate(
            fuel_type=req.fuel_type,
            fuel_consumption_tonnes=fuel_tonnes,
            cargo_load_tonnes=req.cargo_load,
            distance_km=req.distance * 1.852
        )

        # Estimate fuel cost
        fuel_meta = DEFAULT_EMISSION_FACTORS.get(req.fuel_type, DEFAULT_EMISSION_FACTORS["Marine Diesel"])
        cost_est = round(fuel_tonnes * fuel_meta.get("default_price", 680.0), 2)

        # Save record
        rec = PredictionRecord(
            vessel_type=req.vessel_type,
            capacity=req.capacity,
            cargo_load=req.cargo_load,
            distance=req.distance,
            speed=req.speed,
            fuel_type=req.fuel_type,
            engine_power=req.engine_power,
            weather_factor=req.weather_factor,
            predicted_fuel=fuel_tonnes,
            model_name=ml_pipeline.metrics.get("model_name", "RandomForestRegressor")
        )
        db.add(rec)
        db.commit()

        return {
            "predicted_fuel_tonnes": fuel_tonnes,
            "specific_consumption_per_nm": pred_res["specific_consumption_per_nm"],
            "fuel_cost_estimate_usd": cost_est,
            "co2_emissions_tonnes": emis["operational_co2_tonnes"],
            "lifecycle_emissions_tonnes": emis["lifecycle_co2e_tonnes"],
            "model_used": ml_pipeline.metrics.get("model_name", "RandomForestRegressor"),
            "explanation": pred_res["explanation"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@router.get("/metrics", response_model=ModelMetricsResponse)
def get_model_metrics():
    pipeline = ml_pipeline.load_or_train()
    metrics = ml_pipeline.metrics
    if not metrics:
        metrics = ml_pipeline.train()
    return metrics

@router.post("/retrain", response_model=ModelMetricsResponse)
def retrain_model(model_type: str = "RandomForest"):
    valid_types = ["RandomForest", "GradientBoosting"]
    if model_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid model_type. Must be one of {valid_types}")
    metrics = ml_pipeline.train(model_type=model_type)
    return metrics
