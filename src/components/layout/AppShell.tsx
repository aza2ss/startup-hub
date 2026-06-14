'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import Avatar from '@/components/ui/Avatar';
import { getCurrentUser } from '@/lib/session';

const navLinks = [
  { href: '/', label: 'Лента', exact: true },
  { href: '/projects', label: 'Проекты', exact: false },
  { href: '/team', label: 'Поиск команды', exact: false },
  { href: '/profile', label: 'Профиль', exact: false },
];

function isActive(pathname: string, href: string, exact: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = getCurrentUser();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-sidebar fixed inset-y-0 left-0 z-40">
        <div className="h-14 flex items-center px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white text-xs font-semibold">
              S
            </div>
            <span className="text-sm font-semibold text-foreground">StartupHub</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary-light text-primary'
                    : 'text-muted hover:text-foreground hover:bg-surface'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border">
          <Link href="/create" className="btn-primary w-full text-center block text-sm">
            Создать проект
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:pl-56 flex flex-col min-h-screen">
        <header className="h-14 shrink-0 border-b border-border bg-white flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-1.5 rounded-md hover:bg-surface text-muted"
              aria-label="Меню"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <Link href="/" className="text-sm font-semibold">
              StartupHub
            </Link>
          </div>

          <div className="hidden lg:block" />

          <Link
            href="/profile"
            className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface transition-colors"
          >
            <Avatar name={currentUser?.name} avatar={currentUser?.avatar} size="sm" />
            <span className="hidden sm:block text-sm text-muted">
              {currentUser?.name ?? 'Профиль'}
            </span>
          </Link>
        </header>

        {mobileOpen && (
          <nav className="lg:hidden border-b border-border bg-white px-4 py-3 space-y-0.5">
            {navLinks.map((link) => {
              const active = isActive(pathname, link.href, link.exact);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-3 py-2 rounded-md text-sm font-medium ${
                    active ? 'bg-primary-light text-primary' : 'text-muted hover:bg-surface'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/create"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-primary"
            >
              Создать проект
            </Link>
          </nav>
        )}

        <main className="flex-1 px-4 lg:px-6 py-6 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
