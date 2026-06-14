import Link from 'next/link';
import type { Project } from '@/types';
import { formatShortDate } from '@/lib/format';
import StatusBadge from './StatusBadge';
import { UserAvatar } from '@/components/ui/Avatar';

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <article className="card card-hover p-4 transition-colors">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {project.title}
          </h3>
          <StatusBadge status={project.status} />
        </div>

        <p className="text-sm text-muted leading-snug mb-3 line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex -space-x-1.5">
            {project.teamMembers.slice(0, 3).map((member) => (
              <UserAvatar key={member.id} user={member} size="sm" />
            ))}
            {project.teamMembers.length > 3 && (
              <span className="w-6 h-6 rounded-full bg-surface border border-border flex items-center justify-center text-[10px] text-muted">
                +{project.teamMembers.length - 3}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-light">
            {formatShortDate(project.updatedAt)}
          </span>
        </div>
      </article>
    </Link>
  );
}
