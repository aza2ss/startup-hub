import Link from 'next/link';
import type { Project } from '@/types';
import { formatShortDate } from '@/lib/format';
import StatusBadge from './StatusBadge';
import { UserAvatar } from '@/components/ui/Avatar';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <article className="card card-hover p-5 transition-colors min-h-56 flex flex-col">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <p className="meta-text mb-2">{project.category}</p>
            <h3 className="text-lg font-extrabold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {project.title}
            </h3>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-px">
              {project.teamMembers.slice(0, 3).map((member) => (
                <UserAvatar key={member.id} user={member} size="sm" />
              ))}
              {project.teamMembers.length > 3 && (
                <span className="w-6 h-6 bg-surface border border-border flex items-center justify-center text-[10px] text-muted">
                  +{project.teamMembers.length - 3}
                </span>
              )}
            </div>
            <span className="meta-text">{project.progress}%</span>
          </div>
          <span className="meta-text">{formatShortDate(project.updatedAt)}</span>
        </div>
      </article>
    </Link>
  );
}
