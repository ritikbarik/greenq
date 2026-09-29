"""
Fair, empirical benchmarking suite comparing GA, PSO, and QIGA.
Uses the EXACT same objective function, parameters, and random seed.
Displays actual measured results from execution without artificial manipulation.
"""

from typing import Dict, Any, List
from datetime import datetime
from app.optimization.fitness import FleetOptimizationEvaluator
from app.optimization.genetic import ClassicalGeneticOptimizer
from app.optimization.pso import ParticleSwarmOptimizer
from app.optimization.qiga import QIGAOptimizer

def run_comparative_benchmark(
    vessels_catalog: List[Dict[str, Any]],
    distance_nm: float,
    cargo_demand: float,
    delivery_deadline_hours: float,
    weather_factor: float = 1.05,
    fuel_weight: float = 0.33,
    cost_weight: float = 0.33,
    emission_weight: float = 0.34,
    population_size: int = 40,
    iterations: int = 80,
    random_seed: int = 42
) -> Dict[str, Any]:
    evaluator = FleetOptimizationEvaluator(
        vessels_catalog=vessels_catalog,
        distance_nm=distance_nm,
        cargo_demand=cargo_demand,
        delivery_deadline_hours=delivery_deadline_hours,
        weather_factor=weather_factor,
        fuel_weight=fuel_weight,
        cost_weight=cost_weight,
        emission_weight=emission_weight
    )

    # 1. Classical GA
    ga = ClassicalGeneticOptimizer(
        evaluator=evaluator,
        population_size=population_size,
        iterations=iterations,
        random_seed=random_seed
    )
    ga_res = ga.optimize()

    # 2. PSO
    pso = ParticleSwarmOptimizer(
        evaluator=evaluator,
        population_size=population_size,
        iterations=iterations,
        random_seed=random_seed
    )
    pso_res = pso.optimize()

    # 3. Proposed QIGA
    qiga = QIGAOptimizer(
        evaluator=evaluator,
        population_size=population_size,
        iterations=iterations,
        random_seed=random_seed
    )
    qiga_res = qiga.optimize()

    results = {
        "GA": {
            "algorithm_name": "Classical Genetic Algorithm",
            "best_fitness": ga_res["best_fitness"],
            "total_fuel_tonnes": ga_res["total_fuel_tonnes"],
            "total_cost_usd": ga_res["total_cost_usd"],
            "total_co2_tonnes": ga_res["total_co2_tonnes"],
            "total_lifecycle_co2e_tonnes": ga_res["total_lifecycle_co2e_tonnes"],
            "execution_time_ms": ga_res["execution_time_ms"],
            "iterations": ga_res["iterations_completed"],
            "is_feasible": ga_res["is_feasible"],
            "violations_count": len(ga_res["constraint_violations"]),
            "convergence_history": ga_res["convergence_history"]
        },
        "PSO": {
            "algorithm_name": "Particle Swarm Optimization",
            "best_fitness": pso_res["best_fitness"],
            "total_fuel_tonnes": pso_res["total_fuel_tonnes"],
            "total_cost_usd": pso_res["total_cost_usd"],
            "total_co2_tonnes": pso_res["total_co2_tonnes"],
            "total_lifecycle_co2e_tonnes": pso_res["total_lifecycle_co2e_tonnes"],
            "execution_time_ms": pso_res["execution_time_ms"],
            "iterations": pso_res["iterations_completed"],
            "is_feasible": pso_res["is_feasible"],
            "violations_count": len(pso_res["constraint_violations"]),
            "convergence_history": pso_res["convergence_history"]
        },
        "QIGA": {
            "algorithm_name": "Quantum-Inspired Genetic Algorithm (Proposed)",
            "best_fitness": qiga_res["best_fitness"],
            "total_fuel_tonnes": qiga_res["total_fuel_tonnes"],
            "total_cost_usd": qiga_res["total_cost_usd"],
            "total_co2_tonnes": qiga_res["total_co2_tonnes"],
            "total_lifecycle_co2e_tonnes": qiga_res["total_lifecycle_co2e_tonnes"],
            "execution_time_ms": qiga_res["execution_time_ms"],
            "iterations": qiga_res["iterations_completed"],
            "is_feasible": qiga_res["is_feasible"],
            "violations_count": len(qiga_res["constraint_violations"]),
            "convergence_history": qiga_res["convergence_history"]
        }
    }

    # Summary
    summary = (
        f"Empirical benchmark executed on {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}. "
        f"All three algorithms evaluated under identical population ({population_size}) and iteration ({iterations}) budgets. "
        f"QIGA achieved best fitness of {qiga_res['best_fitness']:.4f} in {qiga_res['execution_time_ms']:.1f}ms, "
        f"compared to GA ({ga_res['best_fitness']:.4f}, {ga_res['execution_time_ms']:.1f}ms) "
        f"and PSO ({pso_res['best_fitness']:.4f}, {pso_res['execution_time_ms']:.1f}ms)."
    )

    return {
        "results": results,
        "comparison_summary": summary,
        "execution_timestamp": datetime.utcnow().isoformat()
    }
