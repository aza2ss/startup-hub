import type { ProjectStatus } from '@/types';

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  idea: {
    label: 'Идея',
    color: 'bg-amber-50 text-status-idea border-amber-200',
  },
  mvp: {
    label: 'MVP',
    color: 'bg-blue-50 text-status-mvp border-blue-200',
  },
  growth: {
    label: 'Рост',
    color: 'bg-emerald-50 text-status-growth border-emerald-200',
  },
  scaling: {
    label: 'Масштабирование',
    color: 'bg-violet-50 text-status-scaling border-violet-200',
  },
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.color}`}
    >
      {config.label}
    </span>
  );
}
