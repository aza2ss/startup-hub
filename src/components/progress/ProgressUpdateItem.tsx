import type { ProgressUpdate } from '@/types';
import { formatLongDate } from '@/lib/format';
import Avatar from '@/components/ui/Avatar';

const typeLabels: Record<ProgressUpdate['type'], string> = {
  milestone: 'Этап',
  update: 'Обновление',
  launch: 'Запуск',
  team: 'Команда',
};

export default function ProgressUpdateItem({ update }: { update: ProgressUpdate }) {
  return (
    <div className="relative flex gap-4 pb-6 last:pb-0">
      <div className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-primary z-10" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <Avatar name={update.authorName} avatar={update.authorAvatar} size="sm" />
          <span className="text-sm text-muted">
            {update.authorName ?? 'Участник'}
          </span>
          <span className="text-xs text-muted-light">·</span>
          <span className="text-xs text-muted-light">
            {formatLongDate(update.createdAt)}
          </span>
          <span className="text-xs px-1.5 py-0.5 rounded bg-surface text-muted border border-border">
            {typeLabels[update.type]}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{update.content}</p>
      </div>
    </div>
  );
}
