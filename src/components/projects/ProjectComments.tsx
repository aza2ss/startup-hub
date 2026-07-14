'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { getProjectComments, createProjectComment, replyToComment, deleteComment, updateComment } from '@/lib/actions';
import type { Comment } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { formatShortDate } from '@/lib/format';
import Link from 'next/link';

export default function ProjectComments({ projectId, ownerId }: { projectId: string; ownerId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [editingError, setEditingError] = useState('');
  const [editingLoading, setEditingLoading] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      const dbComments = await getProjectComments(projectId);
      setComments(dbComments);
    };
    fetchComments();
  }, [projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');

    const res = await createProjectComment(projectId, content);
    if (res.success && res.comment) {
      setComments((prev) => [res.comment!, ...prev]);
      setContent('');
    } else {
      setError(res.error || 'Ошибка отправки комментария');
    }
    setLoading(false);
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setReplyLoading(true);
    setReplyError('');

    const res = await replyToComment(parentId, replyContent);
    if (res.success && res.comment) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === parentId) {
            return {
              ...c,
              replies: [...(c.replies || []), res.comment!],
            };
          }
          return c;
        })
      );
      setReplyContent('');
      setReplyingTo(null);
    } else {
      setReplyError(res.error || 'Ошибка отправки ответа');
    }
    setReplyLoading(false);
  };

  const handleUpdateSubmit = async (e: React.FormEvent, commentId: string) => {
    e.preventDefault();
    if (!editingContent.trim()) return;
    setEditingLoading(true);
    setEditingError('');

    const res = await updateComment(commentId, editingContent);
    if (res.success && res.comment) {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id === commentId) {
            return { ...c, content: res.comment!.content };
          }
          if (c.replies) {
            return {
              ...c,
              replies: c.replies.map((r) => (r.id === commentId ? { ...r, content: res.comment!.content } : r)),
            };
          }
          return c;
        })
      );
      setEditingCommentId(null);
      setEditingContent('');
    } else {
      setEditingError(res.error || 'Ошибка редактирования');
    }
    setEditingLoading(false);
  };

  const handleDelete = async (commentId: string, parentId?: string | null) => {
    if (!confirm('Вы уверены, что хотите удалить этот комментарий?')) return;

    const res = await deleteComment(commentId);
    if (res.success) {
      if (parentId) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === parentId) {
              return {
                ...c,
                replies: (c.replies || []).filter((r) => r.id !== commentId),
              };
            }
            return c;
          })
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } else {
      alert(res.error || 'Ошибка удаления комментария');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="section-title">Обсуждение ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})</h3>

      {session?.user ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            placeholder="Задать вопрос или поделиться мнением..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={1000}
            className="input-field text-sm"
            required
          />
          {error && <p className="text-xs text-primary">{error}</p>}
          <div className="flex justify-between items-center text-2xs text-muted">
            <span>Максимум 1000 символов</span>
            <button type="submit" disabled={loading || !content.trim()} className="btn-primary py-1.5 px-4 text-xs disabled:opacity-50">
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-surface border border-border text-center text-xs text-muted">
          <button onClick={() => signIn()} className="text-primary font-bold hover:underline">
            Войдите
          </button>
          , чтобы принять участие в обсуждении.
        </div>
      )}

      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isCommentAuthor = session?.user?.id === comment.authorId;
            const isProjOwner = session?.user?.id === ownerId;

            return (
              <div key={comment.id} className="p-4 bg-surface border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <Link href={`/users/${comment.authorId}`} className="flex items-center gap-2 hover:opacity-85 transition-opacity">
                    <Avatar name={comment.authorName} avatar={comment.authorAvatar} size="sm" />
                    <span className="text-xs font-bold text-foreground">{comment.authorName || 'Участник'}</span>
                  </Link>
                  <span className="text-[10px] text-muted">{formatShortDate(comment.createdAt)}</span>
                </div>

                {editingCommentId === comment.id ? (
                  <form onSubmit={(e) => handleUpdateSubmit(e, comment.id)} className="space-y-2">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      rows={2}
                      className="input-field text-xs"
                      required
                    />
                    {editingError && <p className="text-2xs text-primary">{editingError}</p>}
                    <div className="flex gap-2 justify-end">
                      <button type="submit" disabled={editingLoading} className="btn-primary py-1 px-3 text-[10px]">
                        Сохранить
                      </button>
                      <button type="button" onClick={() => setEditingCommentId(null)} className="btn-secondary py-1 px-3 text-[10px]">
                        Отмена
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                )}

                <div className="flex gap-3 text-[10px] text-muted">
                  {session?.user && !editingCommentId && (
                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        setReplyContent('');
                        setReplyError('');
                      }}
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      Ответить
                    </button>
                  )}
                  {isCommentAuthor && !editingCommentId && (
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id);
                        setEditingContent(comment.content);
                        setEditingError('');
                      }}
                      className="hover:text-primary transition-colors cursor-pointer"
                    >
                      Редактировать
                    </button>
                  )}
                  {(isCommentAuthor || isProjOwner) && (
                    <button onClick={() => handleDelete(comment.id, null)} className="hover:text-primary transition-colors cursor-pointer">
                      Удалить
                    </button>
                  )}
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <form onSubmit={(e) => handleReplySubmit(e, comment.id)} className="pl-4 border-l-2 border-border space-y-2 mt-2">
                    <textarea
                      placeholder="Написать ответ..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={2}
                      className="input-field text-xs"
                      required
                    />
                    {replyError && <p className="text-2xs text-primary">{replyError}</p>}
                    <div className="flex gap-2 justify-end">
                      <button type="submit" disabled={replyLoading} className="btn-primary py-1 px-3 text-[10px] disabled:opacity-50">
                        Ответить
                      </button>
                      <button type="button" onClick={() => setReplyingTo(null)} className="btn-secondary py-1 px-3 text-[10px]">
                        Отмена
                      </button>
                    </div>
                  </form>
                )}

                {/* Nested Replies (max 1 level depth) */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="pl-4 border-l-2 border-border space-y-3 mt-3">
                    {comment.replies.map((reply) => {
                      const isReplyAuthor = session?.user?.id === reply.authorId;
                      const isReplyProjOwner = session?.user?.id === ownerId;

                      return (
                        <div key={reply.id} className="p-2 bg-surface/50 border border-border/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <Link href={`/users/${reply.authorId}`} className="flex items-center gap-1.5 hover:opacity-85 transition-opacity">
                              <Avatar name={reply.authorName} avatar={reply.authorAvatar} size="sm" />
                              <span className="text-[11px] font-bold text-foreground">{reply.authorName || 'Участник'}</span>
                            </Link>
                            <span className="text-[9px] text-muted">{formatShortDate(reply.createdAt)}</span>
                          </div>

                          {editingCommentId === reply.id ? (
                            <form onSubmit={(e) => handleUpdateSubmit(e, reply.id)} className="space-y-2">
                              <textarea
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                rows={2}
                                className="input-field text-xs"
                                required
                              />
                              {editingError && <p className="text-2xs text-primary">{editingError}</p>}
                              <div className="flex gap-2 justify-end">
                                <button type="submit" disabled={editingLoading} className="btn-primary py-1 px-3 text-[10px]">
                                  Сохранить
                                </button>
                                <button type="button" onClick={() => setEditingCommentId(null)} className="btn-secondary py-1 px-3 text-[10px]">
                                  Отмена
                                </button>
                              </div>
                            </form>
                          ) : (
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{reply.content}</p>
                          )}

                          <div className="flex gap-3 text-[9px] text-muted">
                            {isReplyAuthor && !editingCommentId && (
                              <button
                                onClick={() => {
                                  setEditingCommentId(reply.id);
                                  setEditingContent(reply.content);
                                  setEditingError('');
                                }}
                                className="hover:text-primary transition-colors cursor-pointer"
                              >
                                Редактировать
                              </button>
                            )}
                            {(isReplyAuthor || isReplyProjOwner) && (
                              <button onClick={() => handleDelete(reply.id, comment.id)} className="hover:text-primary transition-colors cursor-pointer">
                                Удалить
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted text-center py-4 bg-surface border border-border">Пока нет обсуждений</p>
      )}
    </div>
  );
}
