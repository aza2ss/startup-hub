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
    <article className="card card-hover p-5 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="meta-text mb-1">{request.projectTitle}</p>
          <h4 className="text-base font-extrabold text-foreground">{request.role}</h4>
          <Link
            href={`/projects/${request.projectId}`}
            className="text-xs text-primary hover:text-primary-hover transition-colors"
          >
            Открыть проект
          </Link>
        </div>
        <span className="meta-text shrink-0">
          {formatShortDate(request.createdAt)}
        </span>
      </div>

      {!compact && (
        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
          {request.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {request.skills.map((skill) => (
          <span key={skill} className="tag-pill">
            {skill}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button type="button" className="btn-primary flex-1">
          Откликнуться
        </button>
        <Link href={`/projects/${request.projectId}`} className="btn-secondary">
          Проект
        </Link>
      </div>
    </article>
  );
}
