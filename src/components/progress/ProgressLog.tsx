import type { ProgressUpdate } from '@/types';
import ProgressUpdateItem from './ProgressUpdateItem';

export default function ProgressLog({ updates }: { updates: ProgressUpdate[] }) {
  if (updates.length === 0) {
    return <p className="text-sm text-muted py-4">Обновлений пока нет.</p>;
  }

  const sorted = [...updates].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="relative pl-4">
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
      {sorted.map((update) => (
        <ProgressUpdateItem key={update.id} update={update} />
      ))}
    </div>
  );
}
