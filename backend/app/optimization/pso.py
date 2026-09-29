"""
Particle Swarm Optimization (PSO) baseline for maritime fleet optimization.
Uses velocity and position vector updates with sigmoid thresholding for binary/discrete components.
Evaluates the EXACT same objective function, representation, and constraints as QIGA and GA.
"""

import time
import numpy as np
from typing import List, Dict, Any, Tuple
from app.optimization.fitness import FleetOptimizationEvaluator

class ParticleSwarmOptimizer:
    def __init__(
        self,
        evaluator: FleetOptimizationEvaluator,
        population_size: int = 40,
        iterations: int = 80,
        w_inertia: float = 0.72,
        c_cognitive: float = 1.49,
        c_social: float = 1.49,
        random_seed: int = 42
    ):
        self.evaluator = evaluator
        self.vessels = evaluator.vessels
        self.num_vessels = len(self.vessels)
        self.pop_size = population_size
        self.iterations = iterations
        self.w = w_inertia
        self.c1 = c_cognitive
        self.c2 = c_social
        self.random_seed = random_seed
        self.bits_per_vessel = 7
        self.total_dim = self.num_vessels * self.bits_per_vessel

    def _decode_position(self, pos: np.ndarray) -> Tuple[List[bool], List[float], List[str], List[bool]]:
        # Sigmoid to convert continuous position to binary decision
        prob = 1.0 / (1.0 + np.exp(-pos))
        bits = (prob >= 0.5).astype(int)

        deployed_mask = []
        speeds = []
        fuel_choices = []
        shore_power_flags = []

        for i in range(self.num_vessels):
            start = i * self.bits_per_vessel
            vsl = self.vessels[i]

            deployed = bool(bits[start] == 1)
            deployed_mask.append(deployed)

            shore_power = bool(bits[start + 1] == 1)
            shore_power_flags.append(shore_power)

            fuel_idx = (bits[start + 2] << 1) | bits[start + 3]
            compatible = vsl.get("compatible_fuels", "Marine Diesel").split(",")
            compatible = [f.strip() for f in compatible if f.strip()]
            if not compatible:
                compatible = ["Marine Diesel"]
            chosen_fuel = compatible[fuel_idx % len(compatible)]
            fuel_choices.append(chosen_fuel)

            speed_val = (bits[start + 4] << 2) | (bits[start + 5] << 1) | bits[start + 6]
            speed_ratio = speed_val / 7.0
            chosen_speed = vsl["min_speed"] + speed_ratio * (vsl["max_speed"] - vsl["min_speed"])
            speeds.append(round(chosen_speed, 2))

        return deployed_mask, speeds, fuel_choices, shore_power_flags, bits

    def _repair_solution(self, deployed_mask: List[bool]) -> List[bool]:
        total_cap = sum(self.vessels[i]["capacity"] for i, d in enumerate(deployed_mask) if d)
        if total_cap >= self.evaluator.cargo_demand:
            return deployed_mask

        inactive_indices = [i for i, d in enumerate(deployed_mask) if not d]
        inactive_indices.sort(key=lambda idx: self.vessels[idx]["capacity"], reverse=True)

        repaired = list(deployed_mask)
        for idx in inactive_indices:
            repaired[idx] = True
            total_cap += self.vessels[idx]["capacity"]
            if total_cap >= self.evaluator.cargo_demand:
                break

        return repaired

    def optimize(self) -> Dict[str, Any]:
        start_time = time.perf_counter()
        rng = np.random.RandomState(self.random_seed)

        # Initialize particle positions in [-3, 3] and velocities in [-1, 1]
        positions = rng.uniform(-3.0, 3.0, size=(self.pop_size, self.total_dim))
        velocities = rng.uniform(-1.0, 1.0, size=(self.pop_size, self.total_dim))

        pbest_positions = np.copy(positions)
        pbest_fitnesses = np.full(self.pop_size, float("inf"))

        gbest_position = None
        gbest_fitness = float("inf")
        convergence_history = []

        for iteration in range(self.iterations):
            for p in range(self.pop_size):
                deployed, speeds, fuels, shore, bits = self._decode_position(positions[p])
                repaired = self._repair_solution(deployed)
                
                # Reflect repair in position
                for v_i, is_dep in enumerate(repaired):
                    if is_dep:
                        positions[p][v_i * self.bits_per_vessel] = max(1.5, positions[p][v_i * self.bits_per_vessel])

                fit, metrics = self.evaluator.evaluate_solution(repaired, speeds, fuels, shore)

                if fit < pbest_fitnesses[p]:
                    pbest_fitnesses[p] = fit
                    pbest_positions[p] = np.copy(positions[p])

                if fit < gbest_fitness:
                    gbest_fitness = fit
                    gbest_position = np.copy(positions[p])

            convergence_history.append(round(float(gbest_fitness), 4))

            # Update particle velocities and positions
            r1 = rng.uniform(0.0, 1.0, size=(self.pop_size, self.total_dim))
            r2 = rng.uniform(0.0, 1.0, size=(self.pop_size, self.total_dim))

            velocities = (
                self.w * velocities
                + self.c1 * r1 * (pbest_positions - positions)
                + self.c2 * r2 * (gbest_position - positions)
            )
            # Velocity clamping [-4, 4]
            velocities = np.clip(velocities, -4.0, 4.0)
            positions = np.clip(positions + velocities, -6.0, 6.0)

        execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        deployed, speeds, fuels, shore, _ = self._decode_position(gbest_position)
        repaired = self._repair_solution(deployed)
        final_fitness, final_metrics = self.evaluator.evaluate_solution(repaired, speeds, fuels, shore)

        return {
            "algorithm": "PSO",
            "is_feasible": final_metrics["is_feasible"],
            "best_fitness": round(final_fitness, 4),
            "total_fuel_tonnes": final_metrics["total_fuel_tonnes"],
            "total_cost_usd": final_metrics["total_cost_usd"],
            "total_co2_tonnes": final_metrics["total_co2_tonnes"],
            "total_lifecycle_co2e_tonnes": final_metrics["total_lifecycle_co2e_tonnes"],
            "cargo_fulfilled_tonnes": final_metrics["cargo_fulfilled_tonnes"],
            "cargo_demand_tonnes": self.evaluator.cargo_demand,
            "max_delivery_time_hours": final_metrics["max_delivery_time_hours"],
            "deadline_hours": self.evaluator.deadline,
            "deployed_vessels": final_metrics["deployed_vessels"],
            "iterations_completed": self.iterations,
            "execution_time_ms": execution_time_ms,
            "convergence_history": convergence_history,
            "constraint_violations": final_metrics["violations"],
            "explainability_summary": f"PSO completed {self.iterations} swarm iterations in {execution_time_ms} ms."
        }
