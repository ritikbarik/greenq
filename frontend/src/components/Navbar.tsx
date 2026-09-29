import React from 'react';
import { useLocation } from 'react-router-dom';
import { Leaf, Cpu, ShieldCheck, Terminal, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenExplainer: () => void;
}

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Executive Maritime Dashboard', subtitle: 'Real-time overview of green fleet performance, emissions, and fuel consumption' },
  '/fleet': { title: 'Fleet Asset Management', subtitle: 'Manage vessel specifications, speed profiles, and fuel compatibility' },
  '/fuels': { title: 'Fuel & Energy Pathways', subtitle: 'Direct and lifecycle emission factors, energy density, and pricing parameters' },
  '/mission': { title: 'Mission & Voyage Planning', subtitle: 'Configure origin, destination, cargo demand, and operational constraints' },
  '/prediction': { title: 'ML Fuel Consumption Engine', subtitle: 'Hydrodynamic machine learning pipeline with cubic speed law explainability' },
  '/optimization': { title: 'Quantum-Inspired Fleet Optimization (QIGA)', subtitle: 'Multi-objective Pareto optimization across fuel, operating cost, and GHG emissions' },
  '/scenarios': { title: 'Alternative Decarbonization Scenarios', subtitle: 'Assess LNG, Methanol, Ammonia, Hydrogen and Shore Power transition pathways' },
  '/benchmark': { title: 'Empirical Algorithm Benchmarking', subtitle: 'Head-to-head comparison of QIGA against GA and PSO baselines under identical parameters' },
  '/analytics': { title: 'Fleet Analytics & Sensitivity', subtitle: 'Speed-power curves, displacement impact, and weather sensitivity visualizations' },
  '/reports': { title: 'Audit & Compliance Reports', subtitle: 'Generate verifiable PDF reports containing mathematical model, fleet plan, and benchmarks' },
  '/settings': { title: 'Model Assumptions & Factor Calibration', subtitle: 'Inspect and configure IMO emission coefficients, delay penalties, and weight priorities' },
};

export const Navbar: React.FC<NavbarProps> = ({ onOpenExplainer }) => {
  const location = useLocation();
  const current = PAGE_TITLES[location.pathname] || {
    title: 'Green Maritime Fleet Management',
    subtitle: 'GREENQUANT Platform'
  };

  return (
    <header
      className="px-4 py-3 border-bottom d-flex align-items-center justify-content-between sticky-top"
      style={{
        backgroundColor: 'rgba(6, 11, 20, 0.92)',
        backdropFilter: 'blur(10px)',
        borderColor: 'var(--border-subtle)',
        zIndex: 900
      }}
    >
      <div>
        <h5 className="mb-0 fw-bold" style={{ color: '#ffffff', letterSpacing: '-0.3px' }}>
          {current.title}
        </h5>
        <p className="mb-0" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {current.subtitle}
        </p>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Academic / Prototype Badge */}
        <span className="gq-badge gq-badge-green d-none d-md-inline-flex">
          <Leaf size={13} />
          <span>IMO GHG Aligned</span>
        </span>

        <span className="gq-badge gq-badge-cyan d-none d-md-inline-flex">
          <Cpu size={13} />
          <span>QIGA Simulation</span>
        </span>

        {/* Explain Button */}
        <button
          onClick={onOpenExplainer}
          className="btn-gq-secondary py-1 px-3"
          style={{ fontSize: '0.8rem' }}
          title="Explain Quantum-Inspired Concept"
        >
          <Compass size={14} color="var(--accent-cyan)" />
          <span>Explain QIGA</span>
        </button>
      </div>
    </header>
  );
};
