import Image from 'next/image';
import type { User } from '@/types';

interface AvatarProps {
  name?: string | null;
  avatar?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-16 h-16 text-xl',
};

export default function Avatar({
  name,
  avatar,
  size = 'md',
  className = '',
}: AvatarProps) {
  if (avatar) {
    return (
      <Image
        src={avatar}
        alt={name ?? 'Пользователь'}
        width={64}
        height={64}
        className={`${sizeClasses[size]} object-cover border border-border ${className}`}
      />
    );
  }

  const initial = name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div
      className={`${sizeClasses[size]} bg-white border border-border flex items-center justify-center font-mono font-bold text-primary shrink-0 ${className}`}
      aria-label={name ?? 'Пользователь'}
    >
      {initial}
    </div>
  );
}

export function UserAvatar({
  user,
  size = 'md',
  className = '',
}: {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  return <Avatar name={user.name} avatar={user.avatar} size={size} className={className} />;
}
