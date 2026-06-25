'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Avatar from '@/components/ui/Avatar';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 px-2 py-1">
        <div className="w-8 h-8 bg-surface animate-pulse" />
        <span className="hidden sm:block meta-text">Загрузка...</span>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <button
        type="button"
        onClick={() => signIn()}
        className="flex items-center gap-2 px-3 py-1.5 border border-border hover:border-primary hover:bg-primary-light transition-colors text-sm font-semibold"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Войти
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Avatar
        name={session.user.name}
        avatar={session.user.image}
        size="sm"
      />
      <span className="hidden sm:block meta-text max-w-[120px] truncate">
        {session.user.name ?? session.user.email ?? 'Профиль'}
      </span>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: '/' })}
        className="p-1.5 border border-transparent hover:border-border hover:bg-surface transition-colors text-muted"
        title="Выйти"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
}
