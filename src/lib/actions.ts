/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from './prisma';
import { getCurrentUserId } from './session';
import type { Project, ProgressUpdate, TeamRequest, ProjectStatus, Comment } from '@/types';

// Convert DB User to frontend User type
function mapDbUser(dbUser: any): import('@/types').User {
  return {
    id: dbUser.id,
    name: dbUser.name,
    avatar: dbUser.avatar ?? dbUser.image ?? null,
    role: dbUser.role,
    bio: dbUser.bio ?? '',
    skills: dbUser.skills ? dbUser.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    projectIds: [],
    createdAt: dbUser.createdAt instanceof Date ? dbUser.createdAt.toISOString() : dbUser.createdAt,
  };
}

function mapDbComment(c: any): Comment {
  return {
    id: c.id,
    projectId: c.projectId,
    progressUpdateId: c.progressUpdateId,
    authorId: c.authorId,
    authorName: c.author ? c.author.name : null,
    authorAvatar: c.author ? (c.author.avatar ?? c.author.image) : null,
    content: c.content,
    parentId: c.parentId,
    replies: c.replies ? c.replies.map(mapDbComment) : [],
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
  };
}

// Convert database Project to frontend Project type
function mapDbProject(dbProj: any): Project {
  const title = dbProj.title;
  return {
    id: dbProj.id,
    title,
    description: dbProj.description,
    longDescription: dbProj.longDescription,
    status: dbProj.status as ProjectStatus,
    category: dbProj.category,
    tags: dbProj.tags ? dbProj.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    technologies: dbProj.technologies ? dbProj.technologies.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
    progress: dbProj.progress,
    ownerId: dbProj.ownerId,
    createdAt: dbProj.createdAt.toISOString(),
    updatedAt: dbProj.updatedAt.toISOString(),
    teamMembers: dbProj.teamMembers ? dbProj.teamMembers.map(mapDbUser) : [],
    links: (dbProj.links || []).map((l: any) => ({ label: l.label, url: l.url })),
    openPositions: dbProj.openPositions ? dbProj.openPositions.map((op: any) => ({
      id: op.id,
      projectId: op.projectId,
      projectTitle: title,
      role: op.role,
      description: op.description,
      skills: op.skills ? op.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      createdAt: op.createdAt instanceof Date ? op.createdAt.toISOString() : op.createdAt,
    })) : [],
    progressLog: dbProj.progressLog ? dbProj.progressLog.map((pl: any) => ({
      id: pl.id,
      projectId: pl.projectId,
      authorId: pl.authorId,
      authorName: pl.author ? pl.author.name : null,
      authorAvatar: pl.author ? pl.author.avatar : null,
      content: pl.content,
      type: pl.type,
      createdAt: pl.createdAt instanceof Date ? pl.createdAt.toISOString() : pl.createdAt,
    })) : [],
    comments: dbProj.comments ? dbProj.comments.map(mapDbComment) : [],
    followersCount: dbProj._count?.follows ?? 0,
    savedCount: dbProj._count?.savedBy ?? 0,
  };
}

export async function getProjects(filter?: { ownerId?: string }): Promise<Project[]> {
  try {
    const where: any = {};
    if (filter?.ownerId) {
      where.ownerId = filter.ownerId;
    }
    const dbProjects = await prisma.project.findMany({
      where,
      include: {
        owner: true,
        teamMembers: true,
        links: true,
        openPositions: true,
        progressLog: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: true,
            replies: {
              include: {
                author: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            follows: true,
            savedBy: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return dbProjects.map(mapDbProject);
  } catch (error) {
    console.error('Failed to fetch projects from DB:', error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const dbProject = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        teamMembers: true,
        links: true,
        openPositions: true,
        progressLog: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            author: true,
            replies: {
              include: {
                author: true,
              },
              orderBy: {
                createdAt: 'asc',
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            follows: true,
            savedBy: true,
          }
        }
      },
    });
    return dbProject ? mapDbProject(dbProject) : null;
  } catch (error) {
    console.error(`Failed to fetch project ${id} from DB:`, error);
    return null;
  }
}

export async function createProject(data: {
  title: string;
  description: string;
  longDescription: string;
  status: string;
  category: string;
  tags: string;
  roles: string;
}): Promise<{ success: boolean; projectId?: string; error?: string }> {
  try {
    // Auth check: ownerId comes from session, not from form
    const ownerId = await getCurrentUserId();
    if (!ownerId) {
      return { success: false, error: 'Необходимо авторизоваться для создания проекта' };
    }

    // Base server validation
    if (!data.title || data.title.trim().length < 3) {
      return { success: false, error: 'Название проекта должно быть не менее 3 символов' };
    }
    if (!data.description || data.description.trim().length < 10) {
      return { success: false, error: 'Краткое описание должно быть не менее 10 символов' };
    }
    if (!data.category || !data.category.trim()) {
      return { success: false, error: 'Категория проекта обязательна' };
    }

    const projectId = `proj-${Date.now()}`;
    const rolesArray = data.roles
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);

    await prisma.project.create({
      data: {
        id: projectId,
        title: data.title.trim(),
        description: data.description.trim(),
        longDescription: data.longDescription.trim(),
        status: data.status,
        category: data.category.trim(),
        tags: data.tags,
        technologies: '',
        progress: 10,
        ownerId: ownerId,
        teamMembers: {
          connect: { id: ownerId },
        },
        openPositions: {
          create: rolesArray.map((role) => ({
            id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            role,
            description: `Ищем специалиста на роль ${role} для участия в разработке проекта.`,
            skills: '',
          })),
        },
        progressLog: {
          create: {
            id: `pu-${Date.now()}`,
            authorId: ownerId,
            content: 'Проект создан на платформе StartupHub! Начинаем поиск команды и первых единомышленников.',
            type: 'launch',
          },
        },
      },
    });

    return { success: true, projectId };
  } catch (error: any) {
    console.error('Failed to create project in DB:', error);
    return { success: false, error: 'Не удалось создать проект. Пожалуйста, попробуйте позже.' };
  }
}

export async function createProgressUpdate(data: {
  projectId: string;
  content: string;
  type: string;
}): Promise<{ success: boolean; update?: ProgressUpdate; error?: string }> {
  try {
    // Auth check
    const authorId = await getCurrentUserId();
    if (!authorId) {
      return { success: false, error: 'Необходимо авторизоваться' };
    }

    if (!data.projectId || !data.projectId.trim()) {
      return { success: false, error: 'Идентификатор проекта обязателен' };
    }

    if (!data.content.trim()) {
      return { success: false, error: 'Текст обновления не может быть пустым' };
    }

    const updateId = `pu-${Date.now()}`;
    const dbUpdate = await prisma.progressUpdate.create({
      data: {
        id: updateId,
        projectId: data.projectId,
        authorId: authorId,
        content: data.content.trim(),
        type: data.type,
      },
      include: {
        author: true,
      },
    });

    const update: ProgressUpdate = {
      id: dbUpdate.id,
      projectId: dbUpdate.projectId,
      authorId: dbUpdate.authorId,
      authorName: dbUpdate.author.name,
      authorAvatar: dbUpdate.author.avatar,
      content: dbUpdate.content,
      type: dbUpdate.type as any,
      createdAt: dbUpdate.createdAt.toISOString(),
    };

    return { success: true, update };
  } catch (error: any) {
    console.error('Failed to create progress update in DB:', error);
    return { success: false, error: 'Не удалось сохранить обновление. Пожалуйста, попробуйте позже.' };
  }
}

export async function getProgressUpdates(filter?: { authorId?: string }): Promise<ProgressUpdate[]> {
  try {
    const where: any = {};
    if (filter?.authorId) {
      where.authorId = filter.authorId;
    }
    const dbUpdates = await prisma.progressUpdate.findMany({
      where,
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return dbUpdates.map((u: any) => ({
      id: u.id,
      projectId: u.projectId,
      authorId: u.authorId,
      authorName: u.author ? u.author.name : null,
      authorAvatar: u.author ? u.author.avatar : null,
      content: u.content,
      type: u.type as ProgressUpdate['type'],
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch progress updates from DB:', error);
    return [];
  }
}

export async function getTeamRequests(): Promise<TeamRequest[]> {
  try {
    const dbRequests = await prisma.teamRequest.findMany({
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return dbRequests.map((r: any) => ({
      id: r.id,
      projectId: r.projectId,
      projectTitle: r.project.title,
      role: r.role,
      description: r.description,
      skills: r.skills ? r.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error('Failed to fetch team requests from DB:', error);
    return [];
  }
}

export async function createTeamApplication(data: {
  teamRequestId: string;
  name: string;
  contact: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // Auth check
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Необходимо авторизоваться для отклика' };
    }

    if (!data.name.trim()) return { success: false, error: 'Имя обязательно' };
    if (!data.contact.trim()) return { success: false, error: 'Контакты обязательны' };
    if (!data.message.trim()) return { success: false, error: 'Сообщение обязательно' };

    await prisma.teamApplication.create({
      data: {
        teamRequestId: data.teamRequestId,
        name: data.name.trim(),
        contact: data.contact.trim(),
        message: data.message.trim(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to create team application in DB:', error);
    return { success: false, error: error.message || 'Ошибка отправки отклика' };
  }
}

export async function getUserProfile(userId: string): Promise<import('@/types').User | null> {
  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
          }
        }
      }
    });
    if (!dbUser) return null;
    const mapped = mapDbUser(dbUser);
    return {
      ...mapped,
      followersCount: dbUser._count?.followers ?? 0,
      followingCount: dbUser._count?.following ?? 0,
    };
  } catch (error) {
    console.error(`Failed to fetch user profile ${userId}:`, error);
    return null;
  }
}

export async function getUserById(id: string): Promise<import('@/types').User | null> {
  return getUserProfile(id);
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const dbProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { teamMembers: { some: { id: userId } } }
        ]
      },
      include: {
        owner: true,
        teamMembers: true,
        links: true,
        openPositions: true,
        progressLog: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        comments: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            follows: true,
            savedBy: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return dbProjects.map(mapDbProject);
  } catch (error) {
    console.error(`Failed to fetch projects for user ${userId}:`, error);
    return [];
  }
}

export async function getUserProgressUpdates(userId: string): Promise<ProgressUpdate[]> {
  try {
    const dbUpdates = await prisma.progressUpdate.findMany({
      where: { authorId: userId },
      include: {
        author: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return dbUpdates.map((u: any) => ({
      id: u.id,
      projectId: u.projectId,
      authorId: u.authorId,
      authorName: u.author ? u.author.name : null,
      authorAvatar: u.author ? u.author.avatar : null,
      content: u.content,
      type: u.type as ProgressUpdate['type'],
      createdAt: u.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error(`Failed to fetch progress updates for user ${userId}:`, error);
    return [];
  }
}

export async function getUserOpenTeamRequests(userId: string): Promise<TeamRequest[]> {
  try {
    const dbRequests = await prisma.teamRequest.findMany({
      where: {
        project: { ownerId: userId }
      },
      include: {
        project: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return dbRequests.map((r: any) => ({
      id: r.id,
      projectId: r.projectId,
      projectTitle: r.project.title,
      role: r.role,
      description: r.description,
      skills: r.skills ? r.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error(`Failed to fetch open positions for user ${userId}:`, error);
    return [];
  }
}

export async function updateUserProfile(data: {
  name: string;
  role: string;
  bio: string;
  skills: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false, error: 'Необходимо авторизоваться' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name.trim(),
        role: data.role.trim(),
        bio: data.bio.trim(),
        skills: data.skills.trim(),
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error('Failed to update user profile:', error);
    return { success: false, error: error.message || 'Ошибка обновления профиля' };
  }
}

export async function followProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться для подписки' };
    
    await prisma.projectFollow.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: {},
      create: { userId, projectId }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to follow project:', error);
    return { success: false, error: 'Ошибка подписки на проект' };
  }
}

export async function unfollowProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться' };
    
    await prisma.projectFollow.delete({
      where: { userId_projectId: { userId, projectId } }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to unfollow project:', error);
    return { success: false, error: 'Ошибка отмены подписки' };
  }
}

export async function isFollowingProject(projectId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const follow = await prisma.projectFollow.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  return !!follow;
}

export async function saveProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться для сохранения проекта' };
    
    await prisma.savedProject.upsert({
      where: { userId_projectId: { userId, projectId } },
      update: {},
      create: { userId, projectId }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to save project:', error);
    return { success: false, error: 'Ошибка сохранения проекта' };
  }
}

export async function unsaveProject(projectId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться' };
    
    await prisma.savedProject.delete({
      where: { userId_projectId: { userId, projectId } }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to unsave project:', error);
    return { success: false, error: 'Ошибка удаления сохраненного проекта' };
  }
}

export async function isProjectSaved(projectId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const saved = await prisma.savedProject.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  return !!saved;
}

export async function followUser(followingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться' };
    if (userId === followingId) return { success: false, error: 'Нельзя подписаться на самого себя' };
    
    await prisma.userFollow.upsert({
      where: { followerId_followingId: { followerId: userId, followingId } },
      update: {},
      create: { followerId: userId, followingId }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to follow user:', error);
    return { success: false, error: 'Ошибка подписки на пользователя' };
  }
}

export async function unfollowUser(followingId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться' };
    
    await prisma.userFollow.delete({
      where: { followerId_followingId: { followerId: userId, followingId } }
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to unfollow user:', error);
    return { success: false, error: 'Ошибка отмены подписки' };
  }
}

export async function isFollowingUser(followingId: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId) return false;
  const follow = await prisma.userFollow.findUnique({
    where: { followerId_followingId: { followerId: userId, followingId } }
  });
  return !!follow;
}

export async function getPersonalFeed(): Promise<ProgressUpdate[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  // Get followed project IDs
  const followedProjects = await prisma.projectFollow.findMany({
    where: { userId },
    select: { projectId: true }
  });
  const projectIds = followedProjects.map(f => f.projectId);

  // Get followed user IDs
  const followedUsers = await prisma.userFollow.findMany({
    where: { followerId: userId },
    select: { followingId: true }
  });
  const followingIds = followedUsers.map(f => f.followingId);

  // Fetch progress updates
  const dbUpdates = await prisma.progressUpdate.findMany({
    where: {
      OR: [
        { projectId: { in: projectIds } },
        { authorId: { in: followingIds } }
      ]
    },
    include: {
      author: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return dbUpdates.map((u: any) => ({
    id: u.id,
    projectId: u.projectId,
    authorId: u.authorId,
    authorName: u.author ? u.author.name : null,
    authorAvatar: u.author ? u.author.avatar : null,
    content: u.content,
    type: u.type as ProgressUpdate['type'],
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function getSavedProjects(): Promise<Project[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const dbSaved = await prisma.savedProject.findMany({
    where: { userId },
    include: {
      project: {
        include: {
          owner: true,
          teamMembers: true,
          links: true,
          openPositions: true,
          progressLog: {
            include: {
              author: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          comments: {
            include: {
              author: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          _count: {
            select: {
              follows: true,
              savedBy: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return dbSaved.map(s => mapDbProject(s.project));
}

export async function getProjectComments(projectId: string): Promise<Comment[]> {
  try {
    const dbComments = await prisma.comment.findMany({
      where: {
        projectId,
        parentId: null,
        progressUpdateId: null,
      },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return dbComments.map(mapDbComment);
  } catch (error) {
    console.error(`Failed to fetch comments for project ${projectId}:`, error);
    return [];
  }
}

export async function createProjectComment(
  projectId: string,
  content: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    const authorId = await getCurrentUserId();
    if (!authorId) return { success: false, error: 'Необходимо авторизоваться для комментирования' };

    const cleanContent = content.trim();
    if (!cleanContent) return { success: false, error: 'Комментарий не может быть пустым' };
    if (cleanContent.length > 1000) {
      return { success: false, error: 'Максимальная длина комментария — 1000 символов' };
    }

    const dbComment = await prisma.comment.create({
      data: {
        projectId,
        authorId,
        content: cleanContent,
      },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });
    return { success: true, comment: mapDbComment(dbComment) };
  } catch (error: any) {
    console.error('Failed to create project comment:', error);
    return { success: false, error: 'Не удалось отправить комментарий' };
  }
}

export async function createProgressUpdateComment(
  progressUpdateId: string,
  content: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    const authorId = await getCurrentUserId();
    if (!authorId) return { success: false, error: 'Необходимо авторизоваться для комментирования' };

    const cleanContent = content.trim();
    if (!cleanContent) return { success: false, error: 'Комментарий не может быть пустым' };
    if (cleanContent.length > 1000) return { success: false, error: 'Комментарий слишком длинный' };

    const progressUpdate = await prisma.progressUpdate.findUnique({
      where: { id: progressUpdateId },
    });
    if (!progressUpdate) return { success: false, error: 'Обновление прогресса не найдено' };

    const dbComment = await prisma.comment.create({
      data: {
        projectId: progressUpdate.projectId,
        progressUpdateId,
        authorId,
        content: cleanContent,
      },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });
    return { success: true, comment: mapDbComment(dbComment) };
  } catch (error: any) {
    console.error('Failed to create progress update comment:', error);
    return { success: false, error: 'Не удалось отправить комментарий' };
  }
}

export async function replyToComment(
  commentId: string,
  content: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    const authorId = await getCurrentUserId();
    if (!authorId) return { success: false, error: 'Необходимо авторизоваться' };

    const cleanContent = content.trim();
    if (!cleanContent) return { success: false, error: 'Ответ не может быть пустым' };
    if (cleanContent.length > 1000) return { success: false, error: 'Ответ слишком длинный' };

    const parentComment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!parentComment) return { success: false, error: 'Родительский комментарий не найден' };

    const dbComment = await prisma.comment.create({
      data: {
        projectId: parentComment.projectId,
        progressUpdateId: parentComment.progressUpdateId,
        parentId: commentId,
        authorId,
        content: cleanContent,
      },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });
    return { success: true, comment: mapDbComment(dbComment) };
  } catch (error: any) {
    console.error('Failed to reply to comment:', error);
    return { success: false, error: 'Не удалось отправить ответ' };
  }
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться' };

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { project: true },
    });
    if (!comment) return { success: false, error: 'Комментарий не найден' };

    const isAuthor = comment.authorId === userId;
    const isProjectOwner = comment.project.ownerId === userId;

    if (!isAuthor && !isProjectOwner) {
      return { success: false, error: 'Недостаточно прав для удаления' };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete comment:', error);
    return { success: false, error: 'Не удалось удалить комментарий' };
  }
}

export async function updateComment(
  commentId: string,
  content: string
): Promise<{ success: boolean; comment?: Comment; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return { success: false, error: 'Необходимо авторизоваться' };

    const cleanContent = content.trim();
    if (!cleanContent) return { success: false, error: 'Комментарий не может быть пустым' };
    if (cleanContent.length > 1000) return { success: false, error: 'Комментарий слишком длинный' };

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) return { success: false, error: 'Комментарий не найден' };

    if (comment.authorId !== userId) {
      return { success: false, error: 'Недостаточно прав для редактирования' };
    }

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: cleanContent },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
          },
        },
      },
    });
    return { success: true, comment: mapDbComment(updated) };
  } catch (error: any) {
    console.error('Failed to update comment:', error);
    return { success: false, error: 'Не удалось отредактировать комментарий' };
  }
}



