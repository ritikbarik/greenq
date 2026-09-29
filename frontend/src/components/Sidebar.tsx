import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Ship,
  Fuel,
  Compass,
  TrendingUp,
  Cpu,
  GitBranch,
  BarChart3,
  LineChart,
  FileText,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';

interface SidebarProps {
  onOpenExplainer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onOpenExplainer }) => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/fleet', label: 'Fleet Management', icon: Ship },
    { to: '/fuels', label: 'Fuel Options', icon: Fuel },
    { to: '/mission', label: 'Mission Planner', icon: Compass },
    { to: '/prediction', label: 'Fuel Prediction (ML)', icon: TrendingUp },
    { to: '/optimization', label: 'QIGA Optimization', icon: Cpu },
    { to: '/scenarios', label: 'Decarbonization Scenarios', icon: GitBranch },
    { to: '/benchmark', label: 'Empirical Benchmark', icon: BarChart3 },
    { to: '/analytics', label: 'Fleet Analytics', icon: LineChart },
    { to: '/reports', label: 'PDF Report Export', icon: FileText },
    { to: '/settings', label: 'Assumptions & Settings', icon: Sliders },
  ];

  return (
    <aside className="gq-sidebar">
      {/* Brand Header */}
      <div className="p-3 border-bottom" style={{ borderColor: 'var(--border-subtle)' }}>
        <div className="d-flex align-items-center gap-2 mb-1">
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg, #10b981 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(16, 185, 129, 0.4)'
            }}
          >
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <h6 className="mb-0 fw-bold" style={{ letterSpacing: '0.8px', color: '#ffffff' }}>
              GREENQUANT
            </h6>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              Green Fleet Platform
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-grow-1 py-2 overflow-y-auto">
        <div className="px-3 mb-2" style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Platform Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info & Quantum Clarification Trigger */}
      <div className="p-3 border-top" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'rgba(6, 11, 20, 0.5)' }}>
        <button
          onClick={onOpenExplainer}
          className="w-100 btn-gq-secondary py-2 px-2 text-start justify-content-between mb-2"
          style={{ fontSize: '0.78rem' }}
        >
          <div className="d-flex align-items-center gap-2">
            <Layers size={15} color="var(--accent-cyan)" />
            <span>How QIGA Works</span>
          </div>
          <span className="gq-badge gq-badge-cyan" style={{ fontSize: '0.65rem' }}>Classical</span>
        </button>

        <div className="d-flex align-items-center justify-content-between pt-1">
          <div className="d-flex align-items-center gap-2">
            <span className="pulse-indicator pulse-green"></span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Backend Online (8001)</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
