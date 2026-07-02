'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import { getProjects, getProgressUpdates, updateUserProfile } from '@/lib/actions';
import { getCurrentUser } from '@/lib/session';
import { getCustomProjects, getCustomProgressUpdates } from '@/lib/storage';
import UserProfileCard from '@/components/profile/UserProfileCard';
import ProjectCard from '@/components/projects/ProjectCard';
import ProgressUpdateItem from '@/components/progress/ProgressUpdateItem';
import EmptyState from '@/components/ui/EmptyState';
import type { Project, ProgressUpdate, User } from '@/types';

export default function ProfilePage() {
  const { data: session, status: authStatus } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [userUpdates, setUserUpdates] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSkills, setEditSkills] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    if (authStatus === 'loading') return;

    if (!session?.user?.id) {
      const timer = setTimeout(() => {
        setLoading(false);
      }, 0);
      return () => clearTimeout(timer);
    }

    const fetchData = async () => {
      // Try to fetch actual DB profile, fallback to session info
      const dbProfile = await getCurrentUser();
      const currUser: User = dbProfile || {
        id: session.user!.id!,
        name: session.user!.name ?? null,
        avatar: session.user!.image ?? null,
        role: 'Участник',
        bio: '',
        skills: [],
        projectIds: [],
        createdAt: new Date().toISOString(),
      };
      setUser(currUser);

      // Fetch from DB
      const dbProjects = await getProjects({ ownerId: currUser.id });
      const dbUpdates = await getProgressUpdates({ authorId: currUser.id });

      // Fetch from LocalStorage
      const localProjects = getCustomProjects();
      const localUpdates = getCustomProgressUpdates();

      // Merge and filter owned/member projects
      const filteredLocalProjects = localProjects.filter((project) => project.ownerId === currUser.id);
      const filteredProjects = [...filteredLocalProjects, ...dbProjects];

      // Merge and filter progress updates
      const filteredLocalUpdates = localUpdates.filter((update) => update.authorId === currUser.id);
      const filteredUpdates = [...filteredLocalUpdates, ...dbUpdates];

      setUserProjects(filteredProjects);
      setUserUpdates(filteredUpdates);
      setLoading(false);
    };

    fetchData();
  }, [session, authStatus]);

  if (loading || authStatus === 'loading') {
    return <div className="text-sm text-muted">Загрузка...</div>;
  }

  if (!session?.user) {
    return (
      <div className="space-y-6">
        <div className="rule-bottom pb-6">
          <p className="section-label mb-3">Founder profile</p>
          <h1 className="page-title">Профиль</h1>
        </div>
        <div className="card p-8 text-center space-y-4">
          <p className="text-sm text-muted">Войдите, чтобы увидеть свой профиль</p>
          <button type="button" onClick={() => signIn()} className="btn-primary text-sm">
            Войти
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const startEditing = () => {
    setEditName(user.name || '');
    setEditRole(user.role || 'Участник');
    setEditBio(user.bio || '');
    setEditSkills(user.skills.join(', '));
    setEditError('');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    const res = await updateUserProfile({
      name: editName,
      role: editRole,
      bio: editBio,
      skills: editSkills,
    });

    if (res.success) {
      setEditSuccess(true);
      const dbProfile = await getCurrentUser();
      if (dbProfile) {
        setUser(dbProfile);
      }
      setTimeout(() => {
        setEditSuccess(false);
        setIsEditing(false);
      }, 1000);
    } else {
      setEditError(res.error || 'Ошибка при сохранении профиля');
    }
  };

  return (
    <div className="space-y-6">
      <div className="rule-bottom pb-6">
        <p className="section-label mb-3">Founder profile</p>
        <h1 className="page-title">Профиль</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="card p-5 space-y-4">
              <h3 className="section-title">Редактирование</h3>
              
              {editSuccess && (
                <div className="p-2 bg-primary-light border border-primary text-xs text-primary font-bold">
                  ✓ Профиль успешно сохранен!
                </div>
              )}
              {editError && (
                <div className="p-2 bg-red-950/20 border border-red-500 text-xs text-red-500 font-bold">
                  ⚠ {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Имя</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field py-1.5 px-3 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Роль</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="input-field py-1.5 px-3 text-sm"
                  placeholder="Например: Product Designer"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">О себе</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="input-field py-1.5 px-3 text-sm resize-none"
                  rows={3}
                  placeholder="Расскажите о своем опыте..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Навыки (через запятую)</label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="input-field py-1.5 px-3 text-sm"
                  placeholder="React, Figma, Node.js"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1 py-1.5 text-xs">
                  Сохранить
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1 py-1.5 text-xs"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <>
              <UserProfileCard user={user} />
              <div className="card p-4 space-y-2">
                <button
                  type="button"
                  onClick={startEditing}
                  className="btn-secondary w-full text-sm"
                >
                  Редактировать профиль
                </button>
                <Link href="/create" className="btn-primary w-full text-sm block text-center">
                  Создать проект
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title">Мои проекты</h2>
              <span className="meta-text">{userProjects.length}</span>
            </div>
            {userProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <EmptyState
                title="У вас пока нет проектов"
                action={
                  <Link href="/create" className="btn-primary text-sm inline-block mt-2">
                    Создать проект
                  </Link>
                }
              />
            )}
          </section>

          <section>
            <h2 className="section-title mb-3">Последние обновления</h2>
            {userUpdates.length > 0 ? (
              <div className="card p-5">
                <div className="relative pl-4">
                  <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />
                  {userUpdates.map((update) => (
                     <ProgressUpdateItem key={update.id} update={update} />
                  ))}
                </div>
              </div>
            ) : (
              <EmptyState
                title="Активность появится после первого обновления проекта"
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

