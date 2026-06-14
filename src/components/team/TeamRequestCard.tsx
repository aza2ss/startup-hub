import Link from 'next/link';
import type { TeamRequest } from '@/types';
import { formatShortDate } from '@/lib/format';

export default function TeamRequestCard({
  request,
  compact = false,
}: {
  request: TeamRequest;
  compact?: boolean;
}) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-foreground">{request.role}</h4>
          <Link
            href={`/projects/${request.projectId}`}
            className="text-xs text-primary hover:text-primary-hover transition-colors"
          >
            {request.projectTitle}
          </Link>
        </div>
        <span className="text-xs text-muted-light shrink-0">
          {formatShortDate(request.createdAt)}
        </span>
      </div>

      {!compact && (
        <p className="text-sm text-muted leading-snug mb-3 line-clamp-3">
          {request.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1 mb-3">
        {request.skills.map((skill) => (
          <span key={skill} className="tag-pill">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button type="button" className="btn-primary text-xs flex-1">
          Откликнуться
        </button>
        <Link href={`/projects/${request.projectId}`} className="btn-secondary text-xs">
          Проект
        </Link>
      </div>
    </article>
  );
}
