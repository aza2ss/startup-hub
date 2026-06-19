import type { Project, ProgressUpdate, TeamRequest } from '@/types';
import { projects as mockProjects, teamRequests as mockTeamRequests } from '@/data';

const STORAGE_KEYS = {
  PROJECTS: 'startuphub_projects',
  PROGRESS_UPDATES: 'startuphub_progress_updates',
  APPLICATIONS: 'startuphub_applications',
};

const isClient = typeof window !== 'undefined';

function getStored<T>(key: string, fallback: T): T {
  if (!isClient) return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.error('Error reading localStorage key:', key, error);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (!isClient) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing localStorage key:', key, error);
  }
}

export function getCustomProjects(): Project[] {
  return getStored<Project[]>(STORAGE_KEYS.PROJECTS, []);
}

export function saveProject(project: Project): void {
  const custom = getCustomProjects();
  custom.unshift(project);
  setStored(STORAGE_KEYS.PROJECTS, custom);
}

export function getCustomProgressUpdates(): ProgressUpdate[] {
  return getStored<ProgressUpdate[]>(STORAGE_KEYS.PROGRESS_UPDATES, []);
}

export function saveProgressUpdate(update: ProgressUpdate): void {
  const custom = getCustomProgressUpdates();
  custom.unshift(update);
  setStored(STORAGE_KEYS.PROGRESS_UPDATES, custom);
}

export interface TeamApplication {
  id: string;
  requestId: string;
  projectId: string;
  projectTitle: string;
  role: string;
  name: string;
  contact: string;
  message: string;
  createdAt: string;
}

export function getTeamApplications(): TeamApplication[] {
  return getStored<TeamApplication[]>(STORAGE_KEYS.APPLICATIONS, []);
}

export function saveTeamApplication(app: TeamApplication): void {
  const custom = getTeamApplications();
  custom.unshift(app);
  setStored(STORAGE_KEYS.APPLICATIONS, custom);
}

// Unified getters merging mock and custom data
export function getAllProjects(): Project[] {
  const customProjects = getCustomProjects();
  const customUpdates = getCustomProgressUpdates();

  // Merge custom updates with mock projects
  const mergedMockProjects = mockProjects.map(p => {
    const projectUpdates = customUpdates.filter(u => u.projectId === p.id);
    if (projectUpdates.length === 0) return p;
    return {
      ...p,
      progressLog: [...projectUpdates, ...p.progressLog],
    };
  });

  // Merge custom updates with custom projects
  const mergedCustomProjects = customProjects.map(p => {
    const projectUpdates = customUpdates.filter(u => u.projectId === p.id);
    return {
      ...p,
      progressLog: [...projectUpdates, ...p.progressLog],
    };
  });

  return [...mergedCustomProjects, ...mergedMockProjects];
}

export function getAllTeamRequests(): TeamRequest[] {
  const allProjects = getAllProjects();
  // Collect all openPositions from both custom and mock projects
  const requests: TeamRequest[] = [];
  allProjects.forEach(project => {
    if (project.openPositions) {
      project.openPositions.forEach(pos => {
        requests.push({
          ...pos,
          projectTitle: project.title,
        });
      });
    }
  });

  // Fallback to mockTeamRequests if the list is empty, but we also want to preserve the mock requests
  const mockReqs = mockTeamRequests.filter(
    mr => !requests.some(r => r.id === mr.id)
  );

  return [...requests, ...mockReqs];
}
