'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectStatus, Project } from '@/types';
import StatusBadge from '@/components/projects/StatusBadge';
import { getCurrentUser } from '@/lib/session';
import { saveProject } from '@/lib/storage';

const categoryOptions = [
  'EdTech',
  'SaaS',
  'FinTech',
  'Marketplace',
  'HR Tech',
  'Другое',
];
const statusOptions: ProjectStatus[] = ['idea', 'mvp', 'growth', 'scaling'];

export default function CreateProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    category: '',
    status: 'idea' as ProjectStatus,
    tags: '',
    roles: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!form.title.trim()) {
      newErrors.title = 'Название обязательно';
    } else if (form.title.trim().length < 3) {
      newErrors.title = 'Название должно быть не менее 3 символов';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Краткое описание обязательно';
    } else if (form.description.trim().length < 10) {
      newErrors.description = 'Краткое описание должно быть не менее 10 символов';
    }

    if (!form.category) {
      newErrors.category = 'Выберите категорию';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validate()) {
      return;
    }

    const currentUser = getCurrentUser();
    const newProjectId = `proj-custom-${Date.now()}`;

    // Process tags
    const tagsArray = form.tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    // Process roles into open positions
    const rolesArray = form.roles
      .split(',')
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const openPositions = rolesArray.map((role, index) => ({
      id: `tr-custom-${Date.now()}-${index}`,
      projectId: newProjectId,
      projectTitle: form.title,
      role,
      description: `Ищем специалиста на роль ${role} для участия в разработке проекта.`,
      skills: [],
      createdAt: new Date().toISOString(),
    }));

    const newProject: Project = {
      id: newProjectId,
      title: form.title,
      description: form.description,
      longDescription: form.longDescription,
      status: form.status,
      category: form.category,
      tags: tagsArray,
      technologies: [],
      teamMembers: currentUser ? [currentUser] : [],
      ownerId: currentUser?.id || 'user-current',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progress: 10,
      links: [],
      openPositions: openPositions,
      progressLog: [
        {
          id: `pu-custom-${Date.now()}`,
          projectId: newProjectId,
          authorId: currentUser?.id || 'user-current',
          authorName: currentUser?.name || 'Основатель проекта',
          authorAvatar: null,
          content: 'Проект создан на платформе StartupHub! Начинаем поиск команды и первых единомышленников.',
          type: 'launch',
          createdAt: new Date().toISOString(),
        },
      ],
      comments: [],
    };

    saveProject(newProject);
    setSubmitted(true);

    setTimeout(() => {
      router.push(`/projects/${newProjectId}`);
    }, 1500);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for field when typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="rule-bottom pb-6">
        <p className="section-label mb-3">New project</p>
        <h1 className="page-title">Создать проект</h1>
        <p className="text-sm text-muted mt-1">
          Опишите проект и укажите, кого ищете в команду
        </p>
      </div>

      {submitted && (
        <div className="card p-4 border-primary bg-primary-light">
          <p className="text-sm text-primary font-bold">
            ✓ Проект успешно создан! Перенаправление на страницу проекта...
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Название *
            </label>
            <input
              type="text"
              placeholder="Например: HackTeam"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className={`input-field ${errors.title ? 'border-primary' : ''}`}
            />
            {errors.title && (
              <p className="text-xs text-primary mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Краткое описание *
            </label>
            <input
              type="text"
              placeholder="Одно предложение о проекте"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className={`input-field ${errors.description ? 'border-primary' : ''}`}
            />
            {errors.description && (
              <p className="text-xs text-primary mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Подробное описание
            </label>
            <textarea
              rows={4}
              placeholder="Что делает проект, для кого и на какой стадии"
              value={form.longDescription}
              onChange={(event) => updateField('longDescription', event.target.value)}
              className="input-field resize-none"
            />
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Категория *
            </label>
            <select
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              className={`input-field ${errors.category ? 'border-primary' : ''}`}
            >
              <option value="">Выберите категорию</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-primary mt-1">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Стадия</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateField('status', status)}
                  className={`transition-opacity ${
                    form.status === status ? 'opacity-100' : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <StatusBadge status={status} />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Теги</label>
            <input
              type="text"
              placeholder="React, хакатон, Алматы через запятую"
              value={form.tags}
              onChange={(event) => updateField('tags', event.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Кого ищете в команду (роли)
            </label>
            <input
              type="text"
              placeholder="Backend-разработчик, дизайнер через запятую"
              value={form.roles}
              onChange={(event) => updateField('roles', event.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {form.title && (
          <div className="card p-4">
            <p className="section-label mb-2">Превью</p>
            <div className="flex items-center gap-2 mb-1">
              <StatusBadge status={form.status} />
              {form.category && (
                <span className="text-xs text-muted">{form.category}</span>
              )}
            </div>
            <p className="text-sm font-semibold">{form.title}</p>
            <p className="text-sm text-muted">
              {form.description || 'Описание не указано'}
            </p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={submitted} 
          className="btn-primary w-full py-2.5 disabled:opacity-50"
        >
          {submitted ? 'Публикация...' : 'Опубликовать'}
        </button>
      </form>
    </div>
  );
}
