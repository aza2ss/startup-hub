import type { ProjectStatus } from '@/types';

const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  idea: {
    label: 'Идея',
    color: 'text-status-idea border-status-idea/30',
  },
  mvp: {
    label: 'MVP',
    color: 'text-status-mvp border-status-mvp/30',
  },
  growth: {
    label: 'Рост',
    color: 'text-status-growth border-status-growth/30',
  },
  scaling: {
    label: 'Масштабирование',
    color: 'text-status-scaling border-status-scaling/30',
  },
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center px-2 py-1 bg-white font-mono text-[10px] font-bold uppercase tracking-[0.12em] border ${config.color}`}
    >
      {config.label}
    </span>
  );
}
