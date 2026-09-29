import React from 'react';
import { X, Cpu, Info, CheckCircle2, AlertTriangle, Layers, ArrowRight } from 'lucide-react';

interface QuantumExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuantumExplainerModal: React.FC<QuantumExplainerModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="gq-card"
        style={{
          maxWidth: '750px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: '#0a1220',
          borderColor: 'var(--border-cyan)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between pb-3 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
          <div className="d-flex align-items-center gap-2">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Cpu size={20} color="var(--accent-cyan)" />
            </div>
            <div>
              <h5 className="mb-0 fw-bold text-white">Quantum-Inspired Genetic Algorithm (QIGA)</h5>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Scientific Principles & Architecture Transparency</span>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-sm btn-link text-muted p-0">
            <X size={20} />
          </button>
        </div>

        {/* Essential Academic Clarification Alert */}
        <div className="my-3 p-3 rounded" style={{ backgroundColor: 'rgba(56, 189, 248, 0.08)', border: '1px solid var(--border-cyan)' }}>
          <div className="d-flex align-items-start gap-2">
            <Info size={18} color="var(--accent-cyan)" className="mt-1 flex-shrink-0" />
            <div>
              <strong className="text-white" style={{ fontSize: '0.85rem' }}>Important Clarification on Quantum Computation:</strong>
              <p className="mb-0 mt-1" style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.45' }}>
                "Quantum-inspired" means this optimization algorithm uses concepts derived from quantum physics—specifically
                <strong> Q-bit probabilistic representations</strong>, <strong>superposition</strong>, and <strong>unitary quantum rotation gates</strong>—while executing strictly on
                <strong> conventional classical microprocessors (x86/ARM)</strong>. The system does <em>not</em> claim or require physical cryogenic quantum hardware (QPU).
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Quantum Concepts */}
        <h6 className="fw-bold text-white mt-3 mb-2" style={{ fontSize: '0.9rem' }}>Mathematical Formulation:</h6>
        
        <div className="row g-2 mb-3">
          <div className="col-md-6">
            <div className="p-3 rounded h-100" style={{ background: 'rgba(15, 28, 48, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="gq-badge gq-badge-cyan">1. Q-Bit State</span>
              </div>
              <div className="gq-math-box my-2">
                |q⟩ = α|0⟩ + β|1⟩<br />
                |α|² + |β|² = 1
              </div>
              <p className="mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Rather than storing fixed binary 0 or 1, each Q-bit stores continuous probability amplitudes [α, β], allowing a single chromosome to represent 2ᴺ states concurrently.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded h-100" style={{ background: 'rgba(15, 28, 48, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="gq-badge gq-badge-green">2. Measurement Process</span>
              </div>
              <div className="gq-math-box my-2">
                P(observation = 1) = |β|²<br />
                P(observation = 0) = |α|²
              </div>
              <p className="mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Classical candidate fleet solutions are sampled via measurement collapse. A random float r ∈ [0, 1) is sampled: if r &lt; |β|², the decision bit is 1.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded h-100" style={{ background: 'rgba(15, 28, 48, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="gq-badge gq-badge-cyan">3. Quantum Rotation Gate</span>
              </div>
              <div className="gq-math-box my-2">
                U(Δθ) = [ cos(Δθ)  -sin(Δθ) ]<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;[ sin(Δθ)&nbsp;&nbsp;&nbsp;cos(Δθ) ]
              </div>
              <p className="mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Amplitudes are smoothly updated via Givens rotation matrix toward the global best solution, driving fast convergence while preserving population diversity.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="p-3 rounded h-100" style={{ background: 'rgba(15, 28, 48, 0.6)', border: '1px solid var(--border-subtle)' }}>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="gq-badge gq-badge-amber">4. Quantum Mutation (Pauli-X)</span>
              </div>
              <div className="gq-math-box my-2">
                X [α, β]ᵀ = [β, α]ᵀ
              </div>
              <p className="mb-0" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Applies quantum NOT transformation to invert probability amplitudes with a mutation probability pₘ, preventing premature convergence to local minima.
              </p>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <h6 className="fw-bold text-white mb-2" style={{ fontSize: '0.85rem' }}>Classical GA vs QIGA:</h6>
        <div className="table-responsive">
          <table className="gq-table" style={{ fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Classical Genetic Algorithm (GA)</th>
                <th>Quantum-Inspired Genetic Algorithm (QIGA)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Gene Representation</td>
                <td>Deterministic discrete bits (0 or 1)</td>
                <td>Probabilistic amplitude vectors [α, β]</td>
              </tr>
              <tr>
                <td>Population Diversity</td>
                <td>Requires large population sizes (100-500)</td>
                <td>High diversity with small populations (20-50)</td>
              </tr>
              <tr>
                <td>Exploration Mechanism</td>
                <td>Crossover and random mutation</td>
                <td>Quantum measurement &amp; rotation gates U(Δθ)</td>
              </tr>
              <tr>
                <td>Convergence Behavior</td>
                <td>Prone to premature stagnation</td>
                <td>Smooth probability gradient descent towards Pareto front</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="d-flex justify-content-end pt-3 mt-2 border-top" style={{ borderColor: 'var(--border-subtle)' }}>
          <button onClick={onClose} className="btn-gq-primary py-2 px-4" style={{ fontSize: '0.85rem' }}>
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
