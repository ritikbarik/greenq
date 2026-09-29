# GREENQUANT

### Quantum-Inspired Green Fleet Optimization & Fuel Prediction Platform
> **Tagline:** *Optimize Fleet. Reduce Fuel. Cut Emissions.*

[![Python](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6.svg)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 1. Problem Statement

Maritime shipping accounts for approximately 3% of global greenhouse-gas emissions. Ship operators face the multi-faceted challenge of:
1. Predicting non-linear bunker fuel consumption across disparate vessel types, displacements, and weather conditions.
2. Deploying a heterogeneous fleet to satisfy cargo demand under strict delivery deadlines.
3. Balancing competing operational objectives: minimizing bunker fuel consumption, daily time-charter and shore-power costs, and lifecycle (Well-to-Wake) greenhouse gas emissions.

---

## 2. Solution Overview

**GREENQUANT** is a full-stack, academic/SIH-grade decision support platform that combines:
* **Physics-Informed ML Fuel Regressor:** Predicts voyage consumption using hydrodynamic cubic speed laws ($P \propto \Delta^{2/3} \cdot v^3$) with instant sensitivity explainability.
* **Quantum-Inspired Genetic Algorithm (QIGA):** A classical optimization method utilizing probabilistic Q-bit superposition and unitary rotation gates to explore high-dimensional combinatorial deployment spaces rapidly.
* **Decarbonization Scenario Simulator:** Evaluates transition pathways across Marine Diesel, LNG, Green E-Methanol, Liquid Hydrogen, Green Ammonia, and Berth Shore Power (Cold Ironing).
* **Empirical Head-to-Head Benchmarking:** Runs Classical GA, Particle Swarm Optimization (PSO), and Proposed QIGA under identical problem instances and random seeds without synthetic inflation.
* **Interactive GIS Nautical Routing:** Renders geodesic waypoints and fleet positions on Leaflet dark matter maps.
* **Verified Audit PDF Generator:** Exports client/regulator-ready reports.

---

## 3. Important Clarification on Quantum Computing

> **"Quantum-inspired" means the optimization algorithm utilizes probabilistic concepts derived from quantum mechanics (Q-bits, superposition, probability amplitudes, and unitary quantum rotation gates) while executing strictly on conventional classical microprocessors (x86/ARM). The platform does NOT require or falsely claim actual physical quantum computation.**

---

## 4. System Architecture

```text
d:/GREENQ/
├── frontend/                     # React 19 + TypeScript + Vite + Bootstrap 5
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, MetricCard, QuantumExplainerModal
│   │   ├── pages/                # Dashboard, Fleet, Fuels, Mission, Prediction, Optimization, etc.
│   │   ├── maps/                 # Leaflet RouteMap with simulated geodesic waypoints
│   │   ├── services/             # Typed Axios API client
│   │   ├── types/                # Strict TypeScript data models
│   │   └── App.tsx
│   └── vite.config.ts            # Configured on port 5180 with proxy to port 8001
│
├── backend/                      # Python 3.12 + FastAPI + Scikit-Learn + NumPy + Pandas
│   ├── app/
│   │   ├── main.py               # Lifespan startup, seeding, and CORS middleware
│   │   ├── api/v1/               # REST endpoints (vessels, fuels, predict, optimize, benchmark, etc.)
│   │   ├── ml/                   # Regressor pipeline + hydrodynamic synthetic dataset generator
│   │   ├── optimization/         # QIGA, Classical GA, PSO, Fitness Evaluator, Benchmark suite
│   │   ├── emissions/            # IMO Tank-to-Wake & Well-to-Wake lifecycle calculator
│   │   ├── cost/                 # OPEX, bunker fuel, shore power, and delay penalty model
│   │   ├── simulation/           # Decarbonization scenario analysis engine
│   │   └── database/             # SQLAlchemy ORM + SQLite portable database
│   ├── data/                     # Persisted models and SQLite database
│   └── tests/                    # Pytest verification suite
│
└── docs/
    └── mathematical_model.md     # Detailed formulations and QIGA proofs
```

---

## 5. Live Ports & Quick Start

### Active Local Endpoints
* **Web Frontend Dashboard:** `http://localhost:5180/`
* **Backend API & Swagger Docs:** `http://localhost:8001/docs`
* **API Health Check:** `http://localhost:8001/api/v1/health`

### Starting the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
```

### Starting the Frontend
```bash
cd frontend
npm install
npm run dev
# Vite runs on http://localhost:5180/
```

### Running Backend Unit & Engine Tests
```bash
cd backend
venv\Scripts\pytest tests/test_backend.py -v
```

---

## 6. Optimization Algorithms Implemented

| Algorithm | Representation | Exploration Mechanism | Execution Hardware |
|:---|:---|:---|:---|
| **Classical GA** | Discrete Binary $\{0, 1\}^m$ | 2-Point Crossover & Bit-flip Mutation | Classical CPU |
| **Particle Swarm (PSO)** | Continuous Velocity/Position $\mathbf{v}, \mathbf{x}$ | Inertia + Cognitive + Social Updates | Classical CPU |
| **Proposed QIGA** | Continuous Amplitudes $[\alpha_j, \beta_j]$ with $\|\alpha_j\|^2 + \|\beta_j\|^2 = 1$ | Probabilistic Measurement + Quantum Rotation Gate $U(\Delta \theta)$ + Pauli-X Mutation | Classical CPU |

---

## 7. Decarbonization Pathways Analyzed

* **Marine Diesel (MGO/VLSFO):** Baseline IMO fuel; $3.151 \text{ tCO}_2/\text{t}$ direct, $3.580 \text{ tCO}_2\text{e}/\text{t}$ lifecycle.
* **LNG (Dual-Fuel):** $2.750 \text{ tCO}_2/\text{t}$ direct; $3.120 \text{ tCO}_2\text{e}/\text{t}$ lifecycle (accounting for upstream methane slip).
* **Green E-Methanol:** Biogenic/synthetic liquid; $1.375 \text{ tCO}_2/\text{t}$ combustion, $0.480 \text{ tCO}_2\text{e}/\text{t}$ net lifecycle.
* **Green Hydrogen (LH2):** Zero direct combustion emissions; $0.180 \text{ tCO}_2\text{e}/\text{t}$ cryogenic lifecycle.
* **Green Ammonia (NH3):** Zero direct combustion emissions; $0.220 \text{ tCO}_2\text{e}/\text{t}$ green synthesis lifecycle.
* **Shore Power (Cold Ironing):** Zero berth emissions; powered via port grid ($0.350 \text{ tCO}_2\text{e}/\text{MWh}$).
