import type { User } from '@/types';

export const CURRENT_USER_ID = 'user-current';

export const users: User[] = [
  {
    id: CURRENT_USER_ID,
    name: null,
    avatar: null,
    role: 'Основатель проекта',
    bio: 'Профиль пока не заполнен. Добавьте информацию о себе, навыках и проектах.',
    skills: [],
    projectIds: ['proj-1'],
    createdAt: '2026-01-10T09:00:00Z',
  },
  {
    id: 'user-2',
    name: null,
    avatar: null,
    role: 'Frontend-разработчик',
    bio: 'Работает с React, TypeScript и интерфейсами для внутренних продуктов.',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    projectIds: ['proj-1', 'proj-2', 'proj-5'],
    createdAt: '2026-02-14T10:00:00Z',
  },
  {
    id: 'user-3',
    name: null,
    avatar: null,
    role: 'Product/UI дизайнер',
    bio: 'Проектирует веб и мобильные интерфейсы для early-stage продуктов.',
    skills: ['Figma', 'UX Research', 'UI Design'],
    projectIds: ['proj-2', 'proj-3'],
    createdAt: '2026-03-03T11:00:00Z',
  },
  {
    id: 'user-4',
    name: null,
    avatar: null,
    role: 'Backend-разработчик',
    bio: 'Node.js, PostgreSQL, REST API, интеграции платежей.',
    skills: ['Node.js', 'PostgreSQL', 'REST API'],
    projectIds: ['proj-3', 'proj-4'],
    createdAt: '2026-03-20T12:00:00Z',
  },
];
