'use client';

import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { getUserById, getUserProjects, getUserProgressUpdates, getUserOpenTeamRequests, followUser, unfollowUser, isFollowingUser } from '@/lib/actions';
import UserProfileCard from '@/components/profile/UserProfileCard';
import ProjectCard from '@/components/projects/ProjectCard';
import ProgressUpdateItem from '@/components/progress/ProgressUpdateItem';
import TeamRequestCard from '@/components/team/TeamRequestCard';
import EmptyState from '@/components/ui/EmptyState';
import type { User, Project, ProgressUpdate, TeamRequest } from '@/types';

export default function PublicUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [openRequests, setOpenRequests] = useState<TeamRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Follow states
  const [following, setFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const dbUser = await getUserById(id);
      if (!dbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(dbUser);
      setFollowersCount(dbUser.followersCount ?? 0);
      setFollowingCount(dbUser.followingCount ?? 0);

      const dbProjects = await getUserProjects(id);
      const dbUpdates = await getUserProgressUpdates(id);
      const dbRequests = await getUserOpenTeamRequests(id);

      setProjects(dbProjects);
      setUpdates(dbUpdates);
      setOpenRequests(dbRequests);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    if (session?.user) {
      const checkStatus = async () => {
        const isFollow = await isFollowingUser(user.id);
        setFollowing(isFollow);
      };
      checkStatus();
    }
  }, [user, session]);

  if (loading) {
    return <div className="text-sm text-muted">Загрузка...</div>;
  }

  if (!user) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === user.id;

  const handleUserFollowToggle = async () => {
    if (!session?.user) {
      signIn();
      return;
    }
    setFollowLoading(true);
    if (following) {
      const res = await unfollowUser(user.id);
      if (res.success) {
        setFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
      } else {
        alert(res.error || 'Ошибка');
      }
    } else {
      const res = await followUser(user.id);
      if (res.success) {
        setFollowing(true);
        setFollowersCount((prev) => prev + 1);
      } else {
        alert(res.error || 'Ошибка');
      }
    }
    setFollowLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="rule-bottom pb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="section-label mb-3">Founder profile</p>
          <h1 className="page-title">{user.name || 'Профиль'}</h1>
        </div>
        {isOwnProfile ? (
          <Link href="/profile" className="btn-secondary text-sm">
            Редактировать профиль
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => alert('Связь с основателем: ' + (user.name || 'пользователь'))}
            className="btn-primary text-sm"
          >
            Предложить сотрудничество
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <UserProfileCard user={user} />
          
          <div className="card p-5 space-y-4">
            <h3 className="section-label mb-1">Связи</h3>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 bg-surface border border-border">
                <p className="text-lg font-bold text-foreground">{followersCount}</p>
                <p className="text-2xs text-muted font-semibold uppercase">Подписчики</p>
              </div>
              <div className="p-2 bg-surface border border-border">
                <p className="text-lg font-bold text-foreground">{followingCount}</p>
                <p className="text-2xs text-muted font-semibold uppercase">Подписки</p>
              </div>
            </div>

            {!isOwnProfile && (
              <button
                onClick={handleUserFollowToggle}
                disabled={followLoading}
                className={`w-full text-center text-xs py-2 border transition-colors cursor-pointer ${
                  following
                    ? 'bg-surface text-muted border-border hover:bg-surface-hover'
                    : 'btn-primary'
                }`}
              >
                {followLoading ? 'Загрузка...' : following ? '✓ Вы подписаны (Отписаться)' : '✉ Подписаться'}
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="section-title mb-3">Проекты пользователя</h2>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState title="Проектов пока нет" />
            )}
          </section>

          {openRequests.length > 0 && (
            <section>
              <h2 className="section-title mb-3">Открытые роли в проектах</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {openRequests.map((request) => (
                  <TeamRequestCard key={request.id} request={request} />
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="section-title mb-3">Активность</h2>
            {updates.length > 0 ? (
              <div className="card p-5">
                <div className="relative pl-4">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                  {updates.map((update) => (
                    <ProgressUpdateItem key={update.id} update={update} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState title="Обновлений активности пока нет" />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
