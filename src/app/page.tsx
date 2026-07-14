'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getProgressUpdates, getProjects, getTeamRequests, getPersonalFeed, getSavedProjects } from '@/lib/actions';
import { getCustomProjects, getCustomProgressUpdates } from '@/lib/storage';
import ProjectCard from '@/components/projects/ProjectCard';
import TeamRequestCard from '@/components/team/TeamRequestCard';
import ProgressUpdateItem from '@/components/progress/ProgressUpdateItem';
import type { Project, ProgressUpdate, TeamRequest } from '@/types';
import { useSession, signIn } from 'next-auth/react';

export default function HomePage() {
  const { data: session } = useSession();
  const [feedTab, setFeedTab] = useState<'personal' | 'all'>('all');

  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<ProgressUpdate[]>([]);
  const [personalUpdates, setPersonalUpdates] = useState<ProgressUpdate[]>([]);
  const [savedProjects, setSavedProjects] = useState<Project[]>([]);
  const [newProjects, setNewProjects] = useState<Project[]>([]);
  const [latestRequests, setLatestRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (session?.user) {
        setFeedTab('personal');
      } else {
        setFeedTab('all');
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch from SQLite via Server Actions
      const dbProjs = await getProjects();
      const dbUpdates = await getProgressUpdates();
      const dbRequests = await getTeamRequests();

      // 2. Fetch from LocalStorage
      const localProjs = getCustomProjects();
      const localUpdates = getCustomProgressUpdates();

      // 3. Merge LocalStorage with database values
      const mergedDbProjects = dbProjs.map((p) => {
        const projUpdates = localUpdates.filter((u) => u.projectId === p.id);
        if (projUpdates.length === 0) return p;
        return {
          ...p,
          progressLog: [...projUpdates, ...p.progressLog],
        };
      });

      const mergedLocalProjects = localProjs.map((p) => {
        const projUpdates = localUpdates.filter((u) => u.projectId === p.id);
        return {
          ...p,
          progressLog: [...projUpdates, ...p.progressLog],
        };
      });

      const projs = [...mergedLocalProjects, ...mergedDbProjects];
      
      const allUpdates = [...localUpdates, ...dbUpdates].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const newest = [...projs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4);

      // Collect team requests from local projects
      const localRequests: TeamRequest[] = [];
      mergedLocalProjects.forEach((project) => {
        if (project.openPositions) {
          project.openPositions.forEach((pos) => {
            localRequests.push({
              ...pos,
              projectTitle: project.title,
            });
          });
        }
      });
      const reqs = [...localRequests, ...dbRequests]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3);

      setProjectsList(projs);
      setRecentUpdates(allUpdates.slice(0, 10));
      setNewProjects(newest);
      setLatestRequests(reqs);

      if (session?.user) {
        const feed = await getPersonalFeed();
        const saved = await getSavedProjects();
        setPersonalUpdates(feed);
        setSavedProjects(saved);
      }
      setLoading(false);
    };

    fetchData();
  }, [session]);

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
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex gap-4">
              <button
                onClick={() => setFeedTab('personal')}
                className={`pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                  feedTab === 'personal' ? 'text-primary' : 'text-muted hover:text-foreground'
                }`}
              >
                Моя лента
                {feedTab === 'personal' && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
              <button
                onClick={() => setFeedTab('all')}
                className={`pb-2 text-sm font-semibold transition-colors relative cursor-pointer ${
                  feedTab === 'all' ? 'text-primary' : 'text-muted hover:text-foreground'
                }`}
              >
                Все обновления
                {feedTab === 'all' && (
                  <span className="absolute bottom-[-9px] left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            </div>
          </div>

          <div className="card p-6">
            {loading ? (
              <p className="text-sm text-muted">Загрузка ленты...</p>
            ) : feedTab === 'personal' ? (
              !session?.user ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-sm text-muted">Войдите, чтобы собрать личную ленту обновлений интересных вам проектов и основателей.</p>
                  <button onClick={() => signIn()} className="btn-primary text-xs py-1.5 px-4 cursor-pointer">
                    Войти в аккаунт
                  </button>
                </div>
              ) : personalUpdates.length > 0 ? (
                <div className="relative pl-4">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                  {personalUpdates.map((update) => (
                    <ProgressUpdateItem key={update.id} update={update} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-8">
                  Здесь будут обновления проектов и людей, на которых вы подписаны. Подпишитесь на интересные проекты в каталоге!
                </p>
              )
            ) : (
              recentUpdates.length > 0 ? (
                <div className="relative pl-4">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                  {recentUpdates.map((update) => (
                    <ProgressUpdateItem key={update.id} update={update} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-8">Обновлений пока нет</p>
              )
            )}
          </div>
        </section>

        <aside className="space-y-6">
          {session?.user && (
            <section>
              <h2 className="section-title mb-3">Сохраненные проекты</h2>
              {savedProjects.length > 0 ? (
                <div className="space-y-2">
                  {savedProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block card card-hover p-4 transition-colors"
                    >
                      <p className="meta-text mb-1">{project.category}</p>
                      <p className="text-sm font-extrabold text-foreground line-clamp-1">
                        {project.title}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted card p-4">Нет сохраненных проектов</p>
              )}
            </section>
          )}

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
