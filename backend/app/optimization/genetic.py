"""
Classical Genetic Algorithm (GA) baseline for green maritime fleet optimization.
Uses binary chromosomes, two-point crossover, bit-flip mutation, and elitism selection.
Uses the EXACT same objective function, representation, and constraints as QIGA for honest benchmarking.
"""

import time
import numpy as np
from typing import List, Dict, Any, Tuple
from app.optimization.fitness import FleetOptimizationEvaluator

class ClassicalGeneticOptimizer:
    def __init__(
        self,
        evaluator: FleetOptimizationEvaluator,
        population_size: int = 40,
        iterations: int = 80,
        crossover_rate: float = 0.85,
        mutation_rate: float = 0.03,
        random_seed: int = 42
    ):
        self.evaluator = evaluator
        self.vessels = evaluator.vessels
        self.num_vessels = len(self.vessels)
        self.pop_size = population_size
        self.iterations = iterations
        self.cx_rate = crossover_rate
        self.mut_rate = mutation_rate
        self.random_seed = random_seed
        self.bits_per_vessel = 7
        self.total_bits = self.num_vessels * self.bits_per_vessel

    def _decode_chromosome(self, bits: np.ndarray) -> Tuple[List[bool], List[float], List[str], List[bool]]:
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

        return deployed_mask, speeds, fuel_choices, shore_power_flags

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

        # Initial random binary population
        pop = rng.randint(0, 2, size=(self.pop_size, self.total_bits))

        best_global_fitness = float("inf")
        best_global_bits = None
        best_global_metrics = None
        convergence_history = []

        for iteration in range(self.iterations):
            fitnesses = []
            metrics_list = []

            for p in range(self.pop_size):
                deployed, speeds, fuels, shore = self._decode_chromosome(pop[p])
                repaired = self._repair_solution(deployed)
                for v_i, is_dep in enumerate(repaired):
                    pop[p][v_i * self.bits_per_vessel] = 1 if is_dep else 0

                fit, metrics = self.evaluator.evaluate_solution(repaired, speeds, fuels, shore)
                fitnesses.append(fit)
                metrics_list.append(metrics)

                if fit < best_global_fitness:
                    best_global_fitness = fit
                    best_global_bits = np.copy(pop[p])
                    best_global_metrics = metrics

            convergence_history.append(round(float(best_global_fitness), 4))

            # Tournament Selection
            new_pop = [np.copy(best_global_bits)]  # Elitism (keep 1 best)
            while len(new_pop) < self.pop_size:
                # Tournament size 3
                t1 = rng.choice(self.pop_size, 3, replace=False)
                t2 = rng.choice(self.pop_size, 3, replace=False)
                winner1 = t1[np.argmin([fitnesses[idx] for idx in t1])]
                winner2 = t2[np.argmin([fitnesses[idx] for idx in t2])]

                p1, p2 = np.copy(pop[winner1]), np.copy(pop[winner2])

                # Two-point crossover
                if rng.uniform(0.0, 1.0) < self.cx_rate:
                    pts = np.sort(rng.choice(self.total_bits, 2, replace=False))
                    p1[pts[0]:pts[1]], p2[pts[0]:pts[1]] = p2[pts[0]:pts[1]], np.copy(p1[pts[0]:pts[1]])

                # Bit-flip mutation
                for bit_idx in range(self.total_bits):
                    if rng.uniform(0.0, 1.0) < self.mut_rate:
                        p1[bit_idx] = 1 - p1[bit_idx]
                    if rng.uniform(0.0, 1.0) < self.mut_rate:
                        p2[bit_idx] = 1 - p2[bit_idx]

                new_pop.append(p1)
                if len(new_pop) < self.pop_size:
                    new_pop.append(p2)

            pop = np.array(new_pop)

        execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)
        deployed, speeds, fuels, shore = self._decode_chromosome(best_global_bits)
        repaired = self._repair_solution(deployed)
        final_fitness, final_metrics = self.evaluator.evaluate_solution(repaired, speeds, fuels, shore)

        return {
            "algorithm": "GA",
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
            "explainability_summary": f"Classical GA completed {self.iterations} iterations in {execution_time_ms} ms."
        }
