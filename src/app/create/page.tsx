'use client';

import { useState } from 'react';
import type { ProjectStatus } from '@/types';
import StatusBadge from '@/components/projects/StatusBadge';

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
  const [form, setForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    category: '',
    status: 'idea' as ProjectStatus,
    tags: '',
    roles: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="page-title">Создать проект</h1>
        <p className="text-sm text-muted mt-1">
          Опишите проект и укажите, кого ищете в команду
        </p>
      </div>

      {submitted && (
        <div className="card p-3 border-emerald-200 bg-emerald-50">
          <p className="text-sm text-emerald-700">
            Проект создан в демо-режиме. Данные пока не сохраняются.
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
              required
              placeholder="Например: HackTeam"
              value={form.title}
              onChange={(event) => updateField('title', event.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">
              Краткое описание *
            </label>
            <input
              type="text"
              required
              placeholder="Одно предложение о проекте"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              className="input-field"
            />
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
              required
              value={form.category}
              onChange={(event) => updateField('category', event.target.value)}
              className="input-field"
            >
              <option value="">Выберите категорию</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Статус</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateField('status', status)}
                  className={`rounded-md transition-opacity ${
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
              Кого ищете
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

        <button type="submit" className="btn-primary w-full py-2.5">
          Опубликовать
        </button>
      </form>
    </div>
  );
}
