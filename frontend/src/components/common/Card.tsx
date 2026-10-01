import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, action, className = '' }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            {title && <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm tracking-tight">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  badge?: string;
  badgeType?: 'warning' | 'danger' | 'success' | 'info';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendType = 'neutral',
  badge,
  badgeType = 'info',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-sap-blue/60 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {icon}
        </div>
      </div>

      <div className="mt-2 flex items-baseline justify-between">
        <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">{value}</div>
        {badge && (
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              badgeType === 'danger'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                : badgeType === 'warning'
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : badgeType === 'success'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
            }`}
          >
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trendType === 'positive'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : trendType === 'negative'
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
