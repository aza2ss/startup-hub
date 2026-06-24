'use client';

import { useEffect, useMemo, useState } from 'react';
import { getProjects } from '@/lib/actions';
import { getCustomProjects } from '@/lib/storage';
import type { Project, ProjectStatus } from '@/types';
import ProjectCard from '@/components/projects/ProjectCard';
import StatusBadge from '@/components/projects/StatusBadge';
import EmptyState from '@/components/ui/EmptyState';

const statuses: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'idea', label: 'Идея' },
  { value: 'mvp', label: 'MVP' },
  { value: 'growth', label: 'Рост' },
  { value: 'scaling', label: 'Масштабирование' },
];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus | 'all'>('all');

  useEffect(() => {
    const timer = setTimeout(async () => {
      const dbProjs = await getProjects();
      const localProjs = getCustomProjects();
      setProjects([...localProjs, ...dbProjs]);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      const query = search.toLowerCase();
      const matchSearch =
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);
      const matchStatus = selectedStatus === 'all' || project.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [projects, search, selectedStatus]);

  return (
    <div className="space-y-6">
      <div className="rule-bottom pb-6">
        <p className="section-label mb-3">Project directory</p>
        <h1 className="page-title">Проекты</h1>
        <p className="text-sm text-muted mt-1">
          {projects.length} проектов на платформе
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Поиск по названию или описанию..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-field sm:max-w-xs"
        />

        <div className="flex flex-wrap items-center gap-1.5">
          {statuses.map(({ value, label }) =>
            value === 'all' ? (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedStatus(value)}
                className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                  selectedStatus === value
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-muted border-border hover:bg-surface'
                }`}
              >
                {label}
              </button>
            ) : (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedStatus(value)}
                className={`transition-opacity ${
                  selectedStatus === value ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                aria-label={label}
              >
                <StatusBadge status={value} />
              </button>
            )
          )}
        </div>
      </div>

      <p className="meta-text">Найдено: {filtered.length}</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-12 text-center">
          <EmptyState
            title="Проекты не найдены"
            description="Попробуйте изменить фильтр или поисковый запрос"
          />
        </div>
      )}
    </div>
  );
}
