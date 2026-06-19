import type { ProgressUpdate, Project, TeamRequest, User } from '@/types';
import { users } from '@/data';
import { getAllProjects, getAllTeamRequests } from './storage';

export function getProjects(): Project[] {
  return getAllProjects();
}

export function getProjectById(id: string): Project | undefined {
  return getAllProjects().find((project) => project.id === id);
}

export function getProgressUpdatesByProjectId(projectId: string): ProgressUpdate[] {
  return getProjectById(projectId)?.progressLog ?? [];
}

export function getProgressUpdates(): ProgressUpdate[] {
  return getAllProjects()
    .flatMap((project) => project.progressLog)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getProgressUpdatesByUser(userId: string): ProgressUpdate[] {
  return getProgressUpdates().filter((update) => update.authorId === userId);
}

export function getTeamRequests(): TeamRequest[] {
  return getAllTeamRequests();
}

export function getTeamRequestsByProjectId(projectId: string): TeamRequest[] {
  return getAllTeamRequests().filter((request) => request.projectId === projectId);
}

export function getUserById(id: string): User | undefined {
  return users.find((user) => user.id === id);
}

export function getProjectsByUser(userId: string): Project[] {
  return getAllProjects().filter(
    (project) =>
      project.ownerId === userId ||
      project.teamMembers.some((member) => member.id === userId)
  );
}
