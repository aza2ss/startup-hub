'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getProjectById, createProgressUpdate } from '@/lib/actions';
import { getCustomProjects, getCustomProgressUpdates, saveProgressUpdate } from '@/lib/storage';
import { formatLongDate } from '@/lib/format';
import StatusBadge from '@/components/projects/StatusBadge';
import ProgressLog from '@/components/progress/ProgressLog';
import TeamRequestCard from '@/components/team/TeamRequestCard';
import { UserAvatar } from '@/components/ui/Avatar';
import type { Project, ProgressUpdate } from '@/types';
import { useSession } from 'next-auth/react';

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  // Form state
  const [content, setContent] = useState('');
  const [updateType, setUpdateType] = useState<'update' | 'milestone' | 'launch' | 'team'>('update');
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      // 1. Fetch from DB
      const dbProj = await getProjectById(id);
      // 2. Fetch local storage updates matching this project
      const localUpdates = getCustomProgressUpdates().filter((u) => u.projectId === id);

      if (dbProj) {
        setProject({
          ...dbProj,
          progressLog: [...localUpdates, ...dbProj.progressLog],
        });
      } else {
        // 3. Fallback to LocalStorage custom projects
        const localProj = getCustomProjects().find((p) => p.id === id);
        if (localProj) {
          setProject({
            ...localProj,
            progressLog: [...localUpdates, ...localProj.progressLog],
          });
        } else {
          setProject(null);
        }
      }
      setLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [id]);

  if (loading) {
    return <div className="text-sm text-muted">Загрузка...</div>;
  }

  if (!project) {
    notFound();
  }

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setFormError('Текст обновления не может быть пустым');
      return;
    }

    const authorId = session?.user?.id || 'user-current';
    const authorName = session?.user?.name || 'Основатель проекта';
    const authorAvatar = session?.user?.image || null;

    const newUpdate: ProgressUpdate = {
      id: `pu-custom-${Date.now()}`,
      projectId: project.id,
      authorId,
      authorName,
      authorAvatar,
      content: content.trim(),
      type: updateType,
      createdAt: new Date().toISOString(),
    };

    if (!project.id.startsWith('proj-custom')) {
      // Database project: save using Server Action
      const res = await createProgressUpdate({
        projectId: project.id,
        content: content.trim(),
        type: updateType,
      });

      if (res.success && res.update) {
        const dbUpdate = res.update;
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            progressLog: [dbUpdate, ...prev.progressLog],
          };
        });
      } else {
        setFormError(res.error || 'Ошибка при сохранении обновления на сервере');
        return;
      }
    } else {
      // LocalStorage project: save locally
      saveProgressUpdate(newUpdate);
      setProject((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          progressLog: [newUpdate, ...prev.progressLog],
        };
      });
    }

    setContent('');
    setFormError('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-6">
        <p className="section-label mb-3">Project page</p>
        <div className="flex items-center gap-2 mb-3">
          <StatusBadge status={project.status} />
          <span className="meta-text">{project.category}</span>
        </div>
        <h1 className="page-title mb-3">
          {project.title}
        </h1>
        <p className="text-base text-muted max-w-2xl leading-relaxed">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-6">
            <h2 className="section-title mb-4">Progress log</h2>
            
            {/* Add progress update form */}
            <form onSubmit={handleAddUpdate} className="mb-6 p-4 bg-surface border border-border space-y-3">
              <p className="meta-text">Добавить обновление прогресса</p>
              
              {success && (
                <div className="p-2 bg-primary-light border border-primary text-xs text-primary font-bold">
                  ✓ Обновление успешно добавлено!
                </div>
              )}

              <div>
                <textarea
                  placeholder="Опишите, что было сделано..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (formError) setFormError('');
                  }}
                  rows={3}
                  className={`input-field text-sm ${formError ? 'border-primary' : ''}`}
                />
                {formError && <p className="text-xs text-primary mt-1">{formError}</p>}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted">Тип:</span>
                  <select
                    value={updateType}
                    onChange={(e) => setUpdateType(e.target.value as 'update' | 'milestone' | 'launch' | 'team')}
                    className="input-field py-1 px-2 text-xs w-auto"
                  >
                    <option value="update">Обновление</option>
                    <option value="milestone">Этап (milestone)</option>
                    <option value="launch">Запуск (launch)</option>
                    <option value="team">Команда (team)</option>
                  </select>
                </div>

                <button type="submit" className="btn-primary py-1.5 text-xs">
                  Опубликовать обновление
                </button>
              </div>
            </form>

            <ProgressLog updates={project.progressLog} />
          </section>

          <section className="card p-6">
            <h2 className="section-title mb-3">Описание</h2>
            <p className="text-sm text-muted leading-relaxed">
              {project.longDescription}
            </p>
            <div className="flex flex-wrap gap-1.5 mt-5">
              {[...project.tags, ...project.technologies].map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-5">
            <h3 className="section-label mb-3">Команда</h3>
            <div className="space-y-3">
              {project.teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-2.5">
                  <UserAvatar user={member} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground truncate">
                      {member.name ?? 'Участник'}
                    </p>
                    <p className="text-xs text-muted truncate">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {project.links.length > 0 && (
            <section className="card p-5">
              <h3 className="section-label mb-3">Ссылки</h3>
              <ul className="space-y-2">
                {project.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:text-primary-hover"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <h3 className="section-label mb-3">Информация</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Создан</dt>
                <dd>{formatLongDate(project.createdAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Обновлен</dt>
                <dd>{formatLongDate(project.updatedAt)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted">Прогресс</dt>
                <dd>{project.progress}%</dd>
              </div>
            </dl>
          </section>

          {project.openPositions.length > 0 && (
            <section className="space-y-3">
              <h3 className="section-title">Открытые позиции</h3>
              <div className="space-y-3">
                {project.openPositions.map((position) => (
                  <TeamRequestCard key={position.id} request={position} />
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
