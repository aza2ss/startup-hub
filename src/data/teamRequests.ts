import type { TeamRequest } from '@/types';
import { projects } from './projects';

export const teamRequests: TeamRequest[] = projects.flatMap(
  (project) => project.openPositions
);
