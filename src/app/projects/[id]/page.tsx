import { notFound } from 'next/navigation';
import { getProjectById, getProjects } from '@/lib/api';
import { formatLongDate } from '@/lib/format';
import StatusBadge from '@/components/projects/StatusBadge';
import ProgressLog from '@/components/progress/ProgressLog';
import TeamRequestCard from '@/components/team/TeamRequestCard';
import { UserAvatar } from '@/components/ui/Avatar';

export function generateStaticParams() {
  return getProjects().map((project) => ({ id: project.id }));
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = getProjectById(id);
  if (!project) notFound();

  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <div className="flex items-center gap-2 mb-2">
          <StatusBadge status={project.status} />
          <span className="text-xs text-muted">{project.category}</span>
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-1">
          {project.title}
        </h1>
        <p className="text-sm text-muted max-w-2xl">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="card p-5">
            <h2 className="section-title mb-4">Progress log</h2>
            <ProgressLog updates={project.progressLog} />
          </section>

          <section className="card p-5">
            <h2 className="section-title mb-3">Описание</h2>
            <p className="text-sm text-muted leading-relaxed">
              {project.longDescription}
            </p>
            <div className="flex flex-wrap gap-1 mt-4">
              {[...project.tags, ...project.technologies].map((tag) => (
                <span key={tag} className="tag-pill">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="card p-4">
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
            <section className="card p-4">
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

          <section className="card p-4">
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
            <section>
              <h3 className="section-title mb-3">Открытые позиции</h3>
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
