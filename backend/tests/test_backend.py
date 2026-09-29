import pytest
from app.emissions.calculator import emission_calculator
from app.cost.calculator import cost_calculator
from app.ml.pipeline import ml_pipeline
from app.optimization.fitness import FleetOptimizationEvaluator
from app.optimization.qiga import QIGAOptimizer
from app.optimization.genetic import ClassicalGeneticOptimizer
from app.optimization.pso import ParticleSwarmOptimizer
from app.services.seed_service import DEMO_VESSELS

def test_emission_calculation():
    res = emission_calculator.calculate("Marine Diesel", 100.0)
    assert res["operational_co2_tonnes"] == 315.1
    assert res["lifecycle_co2e_tonnes"] == 358.0

    res_zero = emission_calculator.calculate("Hydrogen", 50.0)
    assert res_zero["operational_co2_tonnes"] == 0.0
    assert res_zero["is_zero_tailpipe"] is True

def test_cost_calculation():
    res = cost_calculator.calculate(
        fuel_consumption_tonnes=100.0,
        fuel_price_per_tonne=700.0,
        vessel_operating_cost_daily=30000.0,
        travel_time_hours=48.0,
        shore_power_used=True
    )
    assert res["fuel_cost"] == 70000.0
    assert res["vessel_operating_cost"] == 60000.0
    assert res["shore_power_cost"] > 0
    assert res["total_cost"] > 130000.0

def test_ml_pipeline_prediction():
    sample_input = {
        "vessel_type": "Container Ship",
        "fuel_type": "Marine Diesel",
        "capacity": 85000.0,
        "cargo_load": 70000.0,
        "distance": 3000.0,
        "speed": 18.0,
        "engine_power": 50000.0,
        "weather_factor": 1.05
    }
    pred = ml_pipeline.predict(sample_input)
    assert pred["predicted_fuel_tonnes"] > 0
    assert "speed_cube_impact" in pred["explanation"]

def test_optimization_engines():
    catalog = DEMO_VESSELS[:6]
    evaluator = FleetOptimizationEvaluator(
        vessels_catalog=catalog,
        distance_nm=3000.0,
        cargo_demand=120000.0,
        delivery_deadline_hours=240.0,
        weather_factor=1.05
    )

    # Test QIGA
    qiga = QIGAOptimizer(evaluator=evaluator, population_size=15, iterations=10, random_seed=42)
    qiga_res = qiga.optimize()
    assert qiga_res["algorithm"] == "QIGA"
    assert len(qiga_res["convergence_history"]) == 10
    assert qiga_res["best_fitness"] > 0

    # Test GA
    ga = ClassicalGeneticOptimizer(evaluator=evaluator, population_size=15, iterations=10, random_seed=42)
    ga_res = ga.optimize()
    assert ga_res["algorithm"] == "GA"
    assert len(ga_res["convergence_history"]) == 10

    # Test PSO
    pso = ParticleSwarmOptimizer(evaluator=evaluator, population_size=15, iterations=10, random_seed=42)
    pso_res = pso.optimize()
    assert pso_res["algorithm"] == "PSO"
    assert len(pso_res["convergence_history"]) == 10
