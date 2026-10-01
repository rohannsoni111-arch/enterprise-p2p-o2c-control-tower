import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const s = status.toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  // Positive / Cleared
  if (['APPROVED', 'CONFIRMED', 'MATCHED', 'COMPLETE', 'DELIVERED', 'PAID', 'HEALTHY', 'RESOLVED'].includes(s)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800';
  }
  // Critical / Discrepancy / Danger
  else if (['CRITICAL', 'REJECTED', 'CANCELLED', 'BLOCKED', 'PRICE_VARIANCE', 'QUANTITY_VARIANCE', 'LOW_STOCK', 'EXCEEDED', 'OVERDUE'].includes(s)) {
    colorClasses = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-300 dark:border-rose-800';
  }
  // High Warning
  else if (['HIGH', 'DELAYED', 'HIGH_EXPOSURE', 'REORDER_RECOMMENDED', 'UNDER_REVIEW', 'ESCALATED'].includes(s)) {
    colorClasses = 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border-amber-300 dark:border-amber-800';
  }
  // In-Progress / Info
  else if (['SUBMITTED', 'SENT_TO_VENDOR', 'PICKING', 'READY', 'DISPATCHED', 'PARTIAL', 'PARTIALLY_RECEIVED', 'PARTIALLY_FULFILLED', 'MEDIUM'].includes(s)) {
    colorClasses = 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border-sky-300 dark:border-sky-800';
  }
  // Draft / Open
  else if (['DRAFT', 'OPEN', 'PENDING', 'GENERATED', 'LOW'].includes(s)) {
    colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-mono ${sizeClasses} ${colorClasses} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {status.replace(/_/g, ' ')}
    </span>
  );
};
