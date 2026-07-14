import Link from 'next/link';
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
    <div className="relative flex gap-4 pb-7 last:pb-0">
      <div className="absolute -left-4 top-1.5 w-2.5 h-2.5 bg-primary border-2 border-card z-10" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Link href={`/users/${update.authorId}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar name={update.authorName} avatar={update.authorAvatar} size="sm" />
            <span className="text-sm font-semibold text-foreground">
              {update.authorName ?? 'Участник'}
            </span>
          </Link>
          <span className="meta-text">
            {formatLongDate(update.createdAt)}
          </span>
          <span className="meta-text border border-border px-1.5 py-0.5 bg-white">
            {typeLabels[update.type]}
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">{update.content}</p>
      </div>
    </div>
  );
}
