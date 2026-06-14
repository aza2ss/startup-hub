import type { User } from '@/types';
import { getUserById } from './api';

const MOCK_AUTH_USER_ID = 'user-current';

export function getCurrentUser(): User | undefined {
  return getUserById(MOCK_AUTH_USER_ID);
}
