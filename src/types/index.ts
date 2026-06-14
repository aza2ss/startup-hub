export type ProjectStatus = 'idea' | 'mvp' | 'growth' | 'scaling';
export type StatusType = ProjectStatus;

export type Skill = string;
export type Technology = string;

export interface User {
  id: string;
  name: string | null;
  avatar: string | null;
  role: string;
  bio: string;
  skills: Skill[];
  projectIds: string[];
  createdAt: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Comment {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string | null;
  content: string;
  createdAt: string;
}

export interface ProgressUpdate {
  id: string;
  projectId: string;
  authorId: string;
  authorName: string | null;
  authorAvatar: string | null;
  content: string;
  type: 'milestone' | 'update' | 'launch' | 'team';
  createdAt: string;
}

export interface TeamRequest {
  id: string;
  projectId: string;
  projectTitle: string;
  role: string;
  description: string;
  skills: Skill[];
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  status: ProjectStatus;
  category: string;
  tags: string[];
  technologies: Technology[];
  teamMembers: User[];
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  progress: number;
  links: ProjectLink[];
  openPositions: TeamRequest[];
  progressLog: ProgressUpdate[];
  comments: Comment[];
}
