import type { User } from '@/types';
import { UserAvatar } from '@/components/ui/Avatar';

export default function UserProfileCard({ user }: { user: User }) {
  return (
    <div className="card p-5">
      <div className="flex items-start gap-4 mb-4">
        <UserAvatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="meta-text mb-2">{user.role}</p>
          <h2 className="text-xl font-extrabold text-foreground">
            {user.name ?? 'Профиль не заполнен'}
          </h2>
        </div>
      </div>

      {user.bio && (
        <p className="text-sm text-muted leading-relaxed mb-4">{user.bio}</p>
      )}

      {user.skills.length > 0 ? (
        <div>
          <p className="section-label mb-2">Навыки</p>
          <div className="flex flex-wrap gap-1">
            {user.skills.map((skill) => (
              <span key={skill} className="tag-pill">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-light">Навыки не указаны</p>
      )}
    </div>
  );
}
