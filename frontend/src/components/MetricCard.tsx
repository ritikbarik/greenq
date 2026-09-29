import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  variant?: 'green' | 'cyan' | 'amber' | 'blue';
  badge?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subtext,
  icon: Icon,
  variant = 'cyan',
  badge,
}) => {
  const variantStyles = {
    green: {
      color: 'var(--accent-green)',
      bgIcon: 'rgba(16, 185, 129, 0.12)',
      borderIcon: 'rgba(16, 185, 129, 0.25)',
      cardClass: 'gq-card-green',
    },
    cyan: {
      color: 'var(--accent-cyan)',
      bgIcon: 'rgba(56, 189, 248, 0.12)',
      borderIcon: 'rgba(56, 189, 248, 0.25)',
      cardClass: '',
    },
    amber: {
      color: 'var(--accent-amber)',
      bgIcon: 'rgba(245, 158, 11, 0.12)',
      borderIcon: 'rgba(245, 158, 11, 0.25)',
      cardClass: '',
    },
    blue: {
      color: 'var(--accent-blue)',
      bgIcon: 'rgba(59, 130, 246, 0.12)',
      borderIcon: 'rgba(59, 130, 246, 0.25)',
      cardClass: '',
    },
  }[variant];

  return (
    <div className={`gq-card ${variantStyles.cardClass}`}>
      <div className="d-flex align-items-start justify-content-between mb-2">
        <span className="metric-label">{label}</span>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            backgroundColor: variantStyles.bgIcon,
            border: `1px solid ${variantStyles.borderIcon}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={18} color={variantStyles.color} />
        </div>
      </div>

      <div className="d-flex align-items-baseline gap-2 mb-1">
        <span className="metric-value">{value}</span>
        {unit && <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 500 }}>{unit}</span>}
      </div>

      <div className="d-flex align-items-center justify-content-between mt-2 pt-1 border-top" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
        {subtext && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtext}</span>}
        {badge && (
          <span className={`gq-badge gq-badge-${variant === 'green' ? 'green' : variant === 'amber' ? 'amber' : 'cyan'}`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
};
