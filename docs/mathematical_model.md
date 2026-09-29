# Mathematical Model & Algorithmic Formulation

## GREENQUANT: Quantum-Inspired Green Fleet Optimization Platform

---

### 1. Classical Quantum-Inspired Genetic Algorithm (QIGA)

#### 1.1 Q-Bit Probability Representation

In QIGA, the smallest unit of genetic information is the **Q-bit** $q_j$, defined as a two-dimensional complex/real probability amplitude vector:

$$|q_j\rangle = \alpha_j |0\rangle + \beta_j |1\rangle$$

where $\alpha_j, \beta_j \in \mathbb{R}$ satisfy the quantum normalization criterion:

$$|\alpha_j|^2 + |\beta_j|^2 = 1$$

* $|\alpha_j|^2$: Probability that observing Q-bit $j$ collapses to classical state $0$.
* $|\beta_j|^2$: Probability that observing Q-bit $j$ collapses to classical state $1$.

**Population Superposition:** A chromosome consisting of $m$ Q-bits:

$$Q = \begin{bmatrix} \alpha_1 & \alpha_2 & \dots & \alpha_m \\ \beta_1 & \beta_2 & \dots & \beta_m \end{bmatrix}$$

can represent a superposition of $2^m$ states simultaneously with compact memory overhead.

#### 1.2 Initialization

All Q-bits are initialized into equal superposition:

$$\alpha_j = \frac{1}{\sqrt{2}}, \quad \beta_j = \frac{1}{\sqrt{2}} \quad \forall j \in \{1, \dots, m\}$$

Hence, initially $P(x_j = 1) = |\beta_j|^2 = 0.5$.

#### 1.3 Measurement Process

A classical binary solution vector $\mathbf{x} = [x_1, x_2, \dots, x_m] \in \{0, 1\}^m$ is obtained by sampling a random float $r_j \sim \mathcal{U}(0, 1)$ for each Q-bit:

$$x_j = \begin{cases} 1 & \text{if } r_j < |\beta_j|^2 \\ 0 & \text{otherwise} \end{cases}$$

#### 1.4 Quantum Rotation Gate (Amplitudes Update)

To guide the Q-bit population toward the global best solution $\mathbf{b} = [b_1, \dots, b_m]$, unitary quantum rotation gates $U(\Delta \theta_j)$ are applied:

$$\begin{bmatrix} \alpha_j' \\ \beta_j' \end{bmatrix} = U(\Delta \theta_j) \begin{bmatrix} \alpha_j \\ \beta_j \end{bmatrix} = \begin{bmatrix} \cos(\Delta \theta_j) & -\sin(\Delta \theta_j) \\ \sin(\Delta \theta_j) & \cos(\Delta \theta_j) \end{bmatrix} \begin{bmatrix} \alpha_j \\ \beta_j \end{bmatrix}$$

The rotation angle $\Delta \theta_j = s(\alpha_j, \beta_j) \cdot \Delta \theta_0$ is evaluated from the standard rotation lookup table:

| $x_j$ | $b_j$ | $f(\mathbf{x}) < f(\mathbf{b})$ | $\Delta \theta$ direction |
|:---:|:---:|:---:|:---:|
| 0 | 0 | False | 0 |
| 0 | 1 | False | $+0.01\pi$ (rotate toward 1) |
| 1 | 0 | False | $-0.01\pi$ (rotate toward 0) |
| 1 | 1 | False | 0 |

#### 1.5 Quantum NOT Mutation (Pauli-X)

To avoid local stagnation, a quantum NOT gate is applied with probability $p_m$:

$$\sigma_x \begin{bmatrix} \alpha_j \\ \beta_j \end{bmatrix} = \begin{bmatrix} 0 & 1 \\ 1 & 0 \end{bmatrix} \begin{bmatrix} \alpha_j \\ \beta_j \end{bmatrix} = \begin{bmatrix} \beta_j \\ \alpha_j \end{bmatrix}$$

---

### 2. Maritime Fuel Consumption Formulation (Hydrodynamic Physics)

According to naval architecture and the **Admiralty Coefficient Law**, propulsion power $P$ is proportional to ship displacement $\Delta$ and the cube of speed $v$:

$$P = \frac{\Delta^{2/3} \cdot v^3}{C_{\text{adm}}}$$

Daily voyage fuel consumption rate $F_{\text{daily}}$ (tonnes/day) for vessel $i$ is formulated as:

$$F_{\text{daily}, i} = F_{\text{design}, i} \cdot \left(\frac{v_i}{v_{\text{design}, i}}\right)^3 \cdot \left(\frac{\Delta_i}{\Delta_{\text{design}, i}}\right)^{0.67} \cdot W_{\text{sea}} \cdot \eta_{\text{fuel}}$$

Where:
* $v_i$: Chosen operational speed in knots ($v_{\min, i} \le v_i \le v_{\max, i}$)
* $W_{\text{sea}}$: Weather sea state resistance factor (1.0 = calm, 1.25 = rough)
* $\eta_{\text{fuel}} = \frac{\text{LHV}_{\text{diesel}}}{\text{LHV}_{\text{fuel}}}$: Lower heating value energy density conversion factor
* Voyage duration (hours): $T_i = \frac{D}{v_i}$
* Total voyage fuel (tonnes): $F_{\text{total}, i} = F_{\text{daily}, i} \cdot \frac{T_i}{24}$

---

### 3. Multi-Objective Fitness Function & Constraints

#### 3.1 Objective Function

Minimize composite normalized fitness $F$:

$$\min F = w_{\text{fuel}} \left(\frac{\sum F_{\text{total}, i}}{F_{\text{norm}}}\right) + w_{\text{cost}} \left(\frac{\sum C_{\text{total}, i}}{C_{\text{norm}}}\right) + w_{\text{emission}} \left(\frac{\sum E_{\text{total}, i}}{E_{\text{norm}}}\right) + \sum P_k$$

subject to weights satisfying:
$$w_{\text{fuel}} + w_{\text{cost}} + w_{\text{emission}} = 1.0, \quad w_k \ge 0$$

#### 3.2 Operational Constraints & Penalties

1. **Cargo Demand Constraint:**
   $$\sum_{i \in \text{Deployed}} \text{Cap}_i \ge \text{Demand}_{\text{cargo}}$$
   Penalty if violated: $P_{\text{cargo}} = 3500 \cdot \left(1 + \frac{\text{Shortfall}}{\text{Demand}}\right)^2$

2. **Delivery Deadline Constraint:**
   $$\max_{i \in \text{Deployed}} T_i \le T_{\text{deadline}}$$
   Penalty if violated: $P_{\text{deadline}} = 2500 \cdot \left(1 + \frac{\Delta T}{T_{\text{deadline}}}\right)^2$

3. **Speed Boundary:**
   $$v_{\min, i} \le v_i \le v_{\max, i} \quad \forall i$$

4. **Fuel Compatibility:**
   $$\text{Fuel}_i \in \text{CompatibleFuels}_i$$

5. **Emission Cap (Optional):**
   $$\sum E_{\text{total}, i} \le E_{\max}$$

---

### 4. Emissions Accounting

* **Operational Emissions (Tank-to-Wake):**
  $$E_{\text{TTW}} = F_{\text{total}} \cdot f_{\text{TTW}} \quad [\text{tCO}_2]$$
* **Lifecycle GHG Emissions (Well-to-Wake):**
  $$E_{\text{WTW}} = F_{\text{total}} \cdot f_{\text{WTW}} \quad [\text{tCO}_2\text{e}]$$
* **Transport Carbon Intensity:**
  $$\text{CII} = \frac{E_{\text{TTW}} \cdot 10^6}{\text{Cargo} \cdot (D \cdot 1.852)} \quad [\text{gCO}_2 / \text{tonne-km}]$$
