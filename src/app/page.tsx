'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProgressUpdates, getProjects, getTeamRequests } from '@/lib/api';
import ProjectCard from '@/components/projects/ProjectCard';
import TeamRequestCard from '@/components/team/TeamRequestCard';
import ProgressUpdateItem from '@/components/progress/ProgressUpdateItem';
import type { Project, ProgressUpdate, TeamRequest } from '@/types';

export default function HomePage() {
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<ProgressUpdate[]>([]);
  const [newProjects, setNewProjects] = useState<Project[]>([]);
  const [latestRequests, setLatestRequests] = useState<TeamRequest[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const projs = getProjects();
      const updates = getProgressUpdates().slice(0, 5);
      const newest = [...projs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);
      const reqs = getTeamRequests()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      setProjectsList(projs);
      setRecentUpdates(updates);
      setNewProjects(newest);
      setLatestRequests(reqs);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="rule-bottom pb-6">
        <p className="section-label mb-3">Community feed</p>
        <h1 className="page-title">Лента</h1>
        <p className="text-sm text-muted mt-1">
          Обновления проектов и новые объявления
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <h2 className="section-title">Последние обновления</h2>
          <div className="card p-6">
            {recentUpdates.length > 0 ? (
              <div className="relative pl-4">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                {recentUpdates.map((update) => (
                  <ProgressUpdateItem key={update.id} update={update} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">Обновлений пока нет</p>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">Новые проекты</h2>
              <Link href="/projects" className="text-xs text-primary hover:text-primary-hover">
                Все
              </Link>
            </div>
            <div className="space-y-2">
              {newProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  className="block card card-hover p-4 transition-colors"
                >
                  <p className="meta-text mb-1">{project.category}</p>
                  <p className="text-sm font-extrabold text-foreground line-clamp-1">
                    {project.title}
                  </p>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">
                    {project.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">Ищут в команду</h2>
              <Link href="/team" className="text-xs text-primary hover:text-primary-hover">
                Все
              </Link>
            </div>
            <div className="space-y-3">
              {latestRequests.map((request) => (
                <TeamRequestCard key={request.id} request={request} compact />
              ))}
            </div>
          </section>
        </aside>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Активные проекты</h2>
          <Link href="/projects" className="text-xs text-primary hover:text-primary-hover">
            Каталог
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projectsList.slice(0, 3).map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}
