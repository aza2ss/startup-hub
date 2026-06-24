'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { TeamRequest } from '@/types';
import { formatShortDate } from '@/lib/format';
import { saveTeamApplication } from '@/lib/storage';
import { createTeamApplication } from '@/lib/actions';

export default function TeamRequestCard({
  request,
  compact = false,
}: {
  request: TeamRequest;
  compact?: boolean;
}) {
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ name?: string; contact?: string; message?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; contact?: string; message?: string } = {};
    if (!name.trim()) newErrors.name = 'Имя обязательно';
    if (!contact.trim()) newErrors.contact = 'Контакт обязательно';
    if (!message.trim()) newErrors.message = 'Сообщение обязательно';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!request.id.startsWith('tr-custom')) {
      // Database request: save using Server Action
      const res = await createTeamApplication({
        teamRequestId: request.id,
        name: name.trim(),
        contact: contact.trim(),
        message: message.trim(),
      });

      if (!res.success) {
        setErrors({ message: res.error || 'Ошибка при отправке отклика на сервере' });
        return;
      }
    }

    // Save to LocalStorage as fallback/local history
    saveTeamApplication({
      id: `app-custom-${Date.now()}`,
      requestId: request.id,
      projectId: request.projectId,
      projectTitle: request.projectTitle,
      role: request.role,
      name: name.trim(),
      contact: contact.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    });

    setSuccess(true);
    setName('');
    setContact('');
    setMessage('');
    setErrors({});
    setTimeout(() => {
      setSuccess(false);
      setShowApplyForm(false);
    }, 2000);
  };

  return (
    <article className="card card-hover p-5 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="meta-text mb-1">{request.projectTitle}</p>
          <h4 className="text-base font-extrabold text-foreground">{request.role}</h4>
          <Link
            href={`/projects/${request.projectId}`}
            className="text-xs text-primary hover:text-primary-hover transition-colors"
          >
            Открыть проект
          </Link>
        </div>
        <span className="meta-text shrink-0">
          {formatShortDate(request.createdAt)}
        </span>
      </div>

      {!compact && (
        <p className="text-sm text-muted leading-relaxed mb-4 line-clamp-3">
          {request.description}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4">
        {request.skills.map((skill) => (
          <span key={skill} className="tag-pill">
            {skill}
          </span>
        ))}
      </div>

      {success ? (
        <div className="p-3 bg-primary-light border border-primary mb-3">
          <p className="text-xs text-primary font-bold">✓ Отклик успешно отправлен!</p>
        </div>
      ) : showApplyForm ? (
        <form onSubmit={handleApplySubmit} className="space-y-3 mb-4 p-3 bg-surface border border-border">
          <p className="meta-text">Отклик на роль</p>
          <div>
            <input
              type="text"
              placeholder="Ваше имя"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
              }}
              className="input-field py-1.5 text-xs"
            />
            {errors.name && <p className="text-[10px] text-primary mt-0.5">{errors.name}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Контакты (Telegram, Email)"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                if (errors.contact) setErrors(prev => ({ ...prev, contact: '' }));
              }}
              className="input-field py-1.5 text-xs"
            />
            {errors.contact && <p className="text-[10px] text-primary mt-0.5">{errors.contact}</p>}
          </div>
          <div>
            <textarea
              placeholder="Короткое сообщение о вашем опрете..."
              value={message}
              rows={2}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) setErrors(prev => ({ ...prev, message: '' }));
              }}
              className="input-field py-1.5 text-xs resize-none"
            />
            {errors.message && <p className="text-[10px] text-primary mt-0.5">{errors.message}</p>}
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary py-1.5 px-3 text-[10px]">Отправить</button>
            <button
              type="button"
              onClick={() => setShowApplyForm(false)}
              className="btn-secondary py-1.5 px-3 text-[10px]"
            >
              Отмена
            </button>
          </div>
        </form>
      ) : null}

      {!showApplyForm && !success && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowApplyForm(true)}
            className="btn-primary flex-1"
          >
            Откликнуться
          </button>
          <Link href={`/projects/${request.projectId}`} className="btn-secondary">
            Проект
          </Link>
        </div>
      )}
    </article>
  );
}
