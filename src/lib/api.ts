import type { ProgressUpdate, Project, TeamRequest, User } from '@/types';
import { projects, teamRequests, users } from '@/data';

export function getProjects(): Project[] {
  return projects;
}

export function getProjectById(id: string): Project | undefined {
  return projects.find((project) => project.id === id);
}

export function getProgressUpdatesByProjectId(projectId: string): ProgressUpdate[] {
  return getProjectById(projectId)?.progressLog ?? [];
}

export function getProgressUpdates(): ProgressUpdate[] {
  return projects
    .flatMap((project) => project.progressLog)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getProgressUpdatesByUser(userId: string): ProgressUpdate[] {
  return getProgressUpdates().filter((update) => update.authorId === userId);
}

export function getTeamRequests(): TeamRequest[] {
  return teamRequests;
}

export function getTeamRequestsByProjectId(projectId: string): TeamRequest[] {
  return teamRequests.filter((request) => request.projectId === projectId);
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getProjectsByUser(userId: string): Project[] {
  return projects.filter(
    (project) =>
      project.ownerId === userId ||
      project.teamMembers.some((member) => member.id === userId)
  );
}
