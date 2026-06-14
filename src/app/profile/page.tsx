import Link from 'next/link';
import { getProjectsByUser, getProgressUpdatesByUser } from '@/lib/api';
import { getCurrentUser } from '@/lib/session';
import UserProfileCard from '@/components/profile/UserProfileCard';
import ProjectCard from '@/components/projects/ProjectCard';
import ProgressUpdateItem from '@/components/progress/ProgressUpdateItem';
import EmptyState from '@/components/ui/EmptyState';

export default function ProfilePage() {
  const user = getCurrentUser();
  if (!user) return null;

  const userProjects = getProjectsByUser(user.id);
  const userUpdates = getProgressUpdatesByUser(user.id);

  return (
    <div className="space-y-6">
      <div className="rule-bottom pb-6">
        <p className="section-label mb-3">Founder profile</p>
        <h1 className="page-title">Профиль</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <UserProfileCard user={user} />
          <div className="card p-4 space-y-2">
            <button type="button" className="btn-secondary w-full text-sm">
              Редактировать профиль
            </button>
            <Link href="/create" className="btn-primary w-full text-sm block text-center">
              Создать проект
            </Link>
          </div>
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
                title="Проектов пока нет"
                description="Создайте первый проект на платформе"
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
                title="Обновлений нет"
                description="Добавьте progress log в своих проектах"
              />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
