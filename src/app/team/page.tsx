'use client';

import { useMemo, useState } from 'react';
import { getTeamRequests } from '@/lib/api';
import TeamRequestCard from '@/components/team/TeamRequestCard';
import EmptyState from '@/components/ui/EmptyState';

export default function TeamPage() {
  const teamRequests = getTeamRequests();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const roleOptions = useMemo(() => {
    const roles = [...new Set(teamRequests.map((request) => request.role))].sort();
    return ['all', ...roles];
  }, [teamRequests]);

  const filtered = useMemo(() => {
    return teamRequests.filter((request) => {
      const query = search.toLowerCase();
      const matchSearch =
        request.role.toLowerCase().includes(query) ||
        request.description.toLowerCase().includes(query) ||
        request.projectTitle.toLowerCase().includes(query);
      const matchRole = selectedRole === 'all' || request.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [search, selectedRole, teamRequests]);

  return (
    <div className="space-y-6">
      <div className="rule-bottom pb-6">
        <p className="section-label mb-3">Team matching</p>
        <h1 className="page-title">Поиск команды</h1>
        <p className="text-sm text-muted mt-1">
          {teamRequests.length} открытых позиций
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Поиск по роли или проекту..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input-field sm:max-w-md"
        />

        <div>
          <p className="section-label mb-2">Роль</p>
          <div className="flex flex-wrap gap-1.5">
            {roleOptions.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`px-2.5 py-1 text-xs font-medium border transition-colors ${
                  selectedRole === role
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-muted border-border hover:bg-surface'
                }`}
              >
                {role === 'all' ? 'Все роли' : role}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="meta-text">Найдено: {filtered.length}</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((request) => (
            <TeamRequestCard key={request.id} request={request} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="Позиции не найдены"
          description="Измените фильтр или поисковый запрос"
        />
      )}
    </div>
  );
}
