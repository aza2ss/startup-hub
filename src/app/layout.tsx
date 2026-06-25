import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import AppShell from '@/components/layout/AppShell';
import SessionProvider from '@/components/providers/SessionProvider';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-manrope',
});

export const metadata: Metadata = {
  title: 'StartupHub - платформа для стартап-команд',
  description: 'Проекты, команды и прогресс стартапов',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${manrope.variable} h-full antialiased`}>
      <body className={`${manrope.className} min-h-full bg-background text-foreground`}>
        <SessionProvider>
          <AppShell>{children}</AppShell>
        </SessionProvider>
      </body>
    </html>
  );
}
