import { StatusType } from '../types';

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'in-stock': {
      bg: 'bg-emerald-900/50',
      text: 'text-emerald-400',
      label: 'In Stock',
    },
    'low-stock': {
      bg: 'bg-amber-900/50',
      text: 'text-amber-400',
      label: 'Low Stock',
    },
    'out-of-stock': {
      bg: 'bg-red-900/50',
      text: 'text-red-400',
      label: 'Out of Stock',
    },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}
