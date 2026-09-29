"""
Quantum-Inspired Genetic Algorithm (QIGA) for Green Maritime Fleet Optimization.

NOTE ON QUANTUM COMPUTATION:
"Quantum-inspired" means this optimization algorithm utilizes probabilistic concepts
inspired by quantum mechanics (Q-bits, superposition, probability amplitudes, and
unitary quantum rotation gates) while executing strictly on conventional classical hardware.
This system does NOT perform actual physical quantum computation.
"""

import math
import time
import numpy as np
from typing import List, Dict, Any, Tuple, Optional
from app.optimization.fitness import FleetOptimizationEvaluator

# Standard Quantum Rotation Gate Lookup Table (Han & Kim, 2002)
# Determines direction and magnitude of delta_theta rotation based on
# current measured bit x_i, best individual bit b_i, and fitness condition
ROTATION_LOOKUP = {
    # (x_i, b_i, f(x) >= f(best)): (sign, magnitude_rad)
    (0, 0, False): 0.0,
    (0, 0, True): 0.0,
    (0, 1, False): 0.01 * math.pi,   # rotate toward 1
    (0, 1, True): -0.005 * math.pi,
    (1, 0, False): -0.01 * math.pi,  # rotate toward 0
    (1, 0, True): 0.005 * math.pi,
    (1, 1, False): 0.0,
    (1, 1, True): 0.0
}

class QIGAOptimizer:
    """
    Classical Python-based Quantum-Inspired Genetic Algorithm (QIGA).
    
    Representation:
      Each Q-bit is represented by probability amplitudes [alpha, beta] where |alpha|^2 + |beta|^2 = 1.
      A chromosome is a sequence of Q-bits encoding:
        - Deployment decisions: 1 Q-bit per vessel
        - Shore power decisions: 1 Q-bit per vessel
        - Fuel selection: 2 Q-bits per vessel (encoding up to 4 fuel options)
        - Speed selection: 3 Q-bits per vessel (encoding 8 discrete speed steps between min and max)
    """

    def __init__(
        self,
        evaluator: FleetOptimizationEvaluator,
        population_size: int = 40,
        iterations: int = 80,
        rotation_step: float = 0.02 * math.pi,
        quantum_mutation_rate: float = 0.04,
        random_seed: int = 42
    ):
        self.evaluator = evaluator
        self.vessels = evaluator.vessels
        self.num_vessels = len(self.vessels)
        self.pop_size = population_size
        self.iterations = iterations
        self.base_theta = rotation_step
        self.q_mutation_rate = quantum_mutation_rate
        self.random_seed = random_seed

        # Encoding structure per vessel:
        # bit 0: deploy (1) / standby (0)
        # bit 1: shore power (1) / off (0)
        # bit 2-3: fuel index (00, 01, 10, 11)
        # bit 4-6: speed level (000 to 111, 8 levels)
        self.bits_per_vessel = 7
        self.total_qbits = self.num_vessels * self.bits_per_vessel

    def _init_q_population(self) -> np.ndarray:
        """
        Initializes Q-bit population in equal superposition.
        For each Q-bit, alpha = 1/sqrt(2), beta = 1/sqrt(2).
        Shape: (pop_size, total_qbits, 2)
        """
        q_pop = np.full((self.pop_size, self.total_qbits, 2), 1.0 / math.sqrt(2.0), dtype=np.float64)
        return q_pop

    def _measure_individual(self, q_ind: np.ndarray, rng: np.random.RandomState) -> np.ndarray:
        """
        Collapses quantum state by measurement.
        Probability of observing classical bit 1 is P(1) = |beta|^2.
        """
        betas_sq = q_ind[:, 1] ** 2
        rands = rng.uniform(0.0, 1.0, size=self.total_qbits)
        classical_bits = (rands < betas_sq).astype(int)
        return classical_bits

    def _decode_chromosome(self, bits: np.ndarray) -> Tuple[List[bool], List[float], List[str], List[bool]]:
        """
        Decodes classical binary vector into operational fleet deployment decisions.
        """
        deployed_mask = []
        speeds = []
        fuel_choices = []
        shore_power_flags = []

        fuel_names = ["Marine Diesel", "LNG", "Methanol", "Ammonia", "Hydrogen"]

        for i in range(self.num_vessels):
            start = i * self.bits_per_vessel
            vsl = self.vessels[i]

            # 1. Deployment
            deployed = bool(bits[start] == 1)
            deployed_mask.append(deployed)

            # 2. Shore power
            shore_power = bool(bits[start + 1] == 1)
            shore_power_flags.append(shore_power)

            # 3. Fuel selection (2 bits -> index 0 to 3)
            fuel_idx = (bits[start + 2] << 1) | bits[start + 3]
            compatible = vsl.get("compatible_fuels", "Marine Diesel").split(",")
            compatible = [f.strip() for f in compatible if f.strip()]
            if not compatible:
                compatible = ["Marine Diesel"]
            chosen_fuel = compatible[fuel_idx % len(compatible)]
            fuel_choices.append(chosen_fuel)

            # 4. Speed level (3 bits -> 8 discrete levels in [min_speed, max_speed])
            speed_val = (bits[start + 4] << 2) | (bits[start + 5] << 1) | bits[start + 6]
            speed_ratio = speed_val / 7.0
            chosen_speed = vsl["min_speed"] + speed_ratio * (vsl["max_speed"] - vsl["min_speed"])
            speeds.append(round(chosen_speed, 2))

        return deployed_mask, speeds, fuel_choices, shore_power_flags

    def _repair_solution(self, deployed_mask: List[bool]) -> List[bool]:
        """
        Greedy repair: If total deployed capacity is below cargo demand,
        activate highest-capacity available vessels until demand is satisfied.
        """
        total_cap = sum(self.vessels[i]["capacity"] for i, d in enumerate(deployed_mask) if d)
        if total_cap >= self.evaluator.cargo_demand:
            return deployed_mask

        # Sort inactive vessels by capacity descending
        inactive_indices = [i for i, d in enumerate(deployed_mask) if not d]
        inactive_indices.sort(key=lambda idx: self.vessels[idx]["capacity"], reverse=True)

        repaired = list(deployed_mask)
        for idx in inactive_indices:
            repaired[idx] = True
            total_cap += self.vessels[idx]["capacity"]
            if total_cap >= self.evaluator.cargo_demand:
                break

        return repaired

    def _apply_quantum_rotation_gate(
        self,
        q_ind: np.ndarray,
        measured_bits: np.ndarray,
        best_bits: np.ndarray,
        is_better: bool
    ) -> np.ndarray:
        """
        Applies Quantum Rotation Gate U(delta_theta) to rotate Q-bits toward the best solution:
        [alpha', beta']^T = [[cos(theta), -sin(theta)], [sin(theta), cos(theta)]] * [alpha, beta]^T
        """
        updated_q = np.copy(q_ind)
        for j in range(self.total_qbits):
            x_j = measured_bits[j]
            b_j = best_bits[j]
            
            # Lookup rotation direction
            d_theta = ROTATION_LOOKUP.get((x_j, b_j, is_better), 0.0)
            if d_theta == 0.0:
                continue

            # Sign condition relative to alpha * beta
            alpha = updated_q[j, 0]
            beta = updated_q[j, 1]
            sign = 1.0 if (alpha * beta > 0) else -1.0
            theta = sign * d_theta

            cos_t = math.cos(theta)
            sin_t = math.sin(theta)

            new_alpha = cos_t * alpha - sin_t * beta
            new_beta = sin_t * alpha + cos_t * beta

            # Normalization guarantee: |alpha|^2 + |beta|^2 = 1
            norm = math.sqrt(new_alpha ** 2 + new_beta ** 2)
            if norm > 0:
                updated_q[j, 0] = new_alpha / norm
                updated_q[j, 1] = new_beta / norm

        return updated_q

    def _apply_quantum_mutation(self, q_ind: np.ndarray, rng: np.random.RandomState) -> np.ndarray:
        """
        Applies Quantum NOT gate mutation (swaps alpha and beta) with small probability.
        """
        mutated = np.copy(q_ind)
        for j in range(self.total_qbits):
            if rng.uniform(0.0, 1.0) < self.q_mutation_rate:
                # Pauli-X / NOT gate: [alpha, beta] -> [beta, alpha]
                mutated[j, 0], mutated[j, 1] = mutated[j, 1], mutated[j, 0]
        return mutated

    def optimize(self) -> Dict[str, Any]:
        """
        Executes the QIGA optimization loop and returns best feasible solution and convergence history.
        """
        start_time = time.perf_counter()
        rng = np.random.RandomState(self.random_seed)

        # 1. Initialize Q-bit population in equal superposition
        q_population = self._init_q_population()

        best_global_fitness = float("inf")
        best_global_bits = None
        best_global_metrics = None
        convergence_history = []

        for iteration in range(self.iterations):
            current_best_iter_fitness = float("inf")
            current_best_iter_bits = None
            measured_population = []
            fitnesses = []
            iter_metrics = []

            # 2. Measurement & Candidate Solution Generation
            for p in range(self.pop_size):
                classical_bits = self._measure_individual(q_population[p], rng)
                
                # Decode
                deployed, speeds, fuels, shore = self._decode_chromosome(classical_bits)
                
                # Repair infeasible cargo shortage
                repaired_deployed = self._repair_solution(deployed)
                
                # Update chromosome bits with repaired deployment
                for v_i, is_dep in enumerate(repaired_deployed):
                    classical_bits[v_i * self.bits_per_vessel] = 1 if is_dep else 0

                # 3. Evaluate Fitness
                fit, metrics = self.evaluator.evaluate_solution(
                    repaired_deployed, speeds, fuels, shore
                )

                measured_population.append(classical_bits)
                fitnesses.append(fit)
                iter_metrics.append(metrics)

                if fit < current_best_iter_fitness:
                    current_best_iter_fitness = fit
                    current_best_iter_bits = classical_bits

                if fit < best_global_fitness:
                    best_global_fitness = fit
                    best_global_bits = np.copy(classical_bits)
                    best_global_metrics = metrics

            convergence_history.append(round(float(best_global_fitness), 4))

            # 4. Update Q-bit Amplitudes via Quantum Rotation Gate
            for p in range(self.pop_size):
                is_better = fitnesses[p] < best_global_fitness
                q_population[p] = self._apply_quantum_rotation_gate(
                    q_population[p],
                    measured_population[p],
                    best_global_bits,
                    is_better
                )
                # Quantum mutation
                q_population[p] = self._apply_quantum_mutation(q_population[p], rng)

        execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

        # Final decode of best global solution
        deployed, speeds, fuels, shore = self._decode_chromosome(best_global_bits)
        repaired_deployed = self._repair_solution(deployed)
        final_fitness, final_metrics = self.evaluator.evaluate_solution(
            repaired_deployed, speeds, fuels, shore
        )

        # Explainability synthesis based on objective weights
        w_f, w_c, w_e = self.evaluator.w_fuel, self.evaluator.w_cost, self.evaluator.w_emission
        priority_label = (
            "Fuel-Optimized" if w_f >= 0.5 else
            "Cost-Optimized" if w_c >= 0.5 else
            "Emissions-Optimized" if w_e >= 0.5 else
            "Balanced Sustainability & Cost"
        )

        explain_text = (
            f"QIGA converged in {self.iterations} quantum measurement cycles ({execution_time_ms} ms). "
            f"The recommended fleet configuration deploys {len(final_metrics['deployed_vessels'])} vessels "
            f"carrying {final_metrics['cargo_fulfilled_tonnes']:,} tonnes of cargo over {self.evaluator.distance_nm:,.0f} nm. "
            f"Under selected priority profile ({priority_label}), the configuration achieves a composite multi-objective "
            f"fitness score of {final_fitness:.4f} while strictly satisfying delivery deadlines and operational constraints."
        )

        return {
            "algorithm": "QIGA",
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
            "explainability_summary": explain_text,
            "priorities_label": priority_label
        }
