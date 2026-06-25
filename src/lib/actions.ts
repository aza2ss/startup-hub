/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { prisma } from './prisma';
import { getCurrentUserId } from './session';
import type { Project, ProgressUpdate, TeamRequest, ProjectStatus } from '@/types';

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
    comments: dbProj.comments ? dbProj.comments.map((c: any) => ({
      id: c.id,
      projectId: c.projectId,
      authorId: c.authorId,
      authorName: c.author ? c.author.name : null,
      content: c.content,
      createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    })) : [],
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
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
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
          include: {
            author: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
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
    if (!data.category) {
      return { success: false, error: 'Категория обязательна' };
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
        category: data.category,
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
    return { success: false, error: error.message || 'Ошибка создания проекта на сервере' };
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
    return { success: false, error: error.message || 'Ошибка сохранения обновления' };
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
    return dbUpdates.map((u) => ({
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
    return dbRequests.map((r) => ({
      id: r.id,
      projectId: r.projectId,
      projectTitle: r.project.title,
      role: r.role,
      description: r.description,
      skills: r.skills ? r.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
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
    });
    if (!dbUser) return null;
    return mapDbUser(dbUser);
  } catch (error) {
    console.error(`Failed to fetch user profile ${userId}:`, error);
    return null;
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
