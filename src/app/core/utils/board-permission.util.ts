import { Board } from '../models/board.model';
import { Role } from '../models/user.model';

export type BoardRole = 'viewer' | 'editor' | 'owner';

const RANK: Record<BoardRole, number> = { viewer: 0, editor: 1, owner: 2 };

interface AuthUser {
  _id: string;
  role: Role;
}

/**
 * Mirrors the backend's permission resolution (src/services/permission.service.ts):
 * a global admin always resolves to 'owner'; everyone else's permission comes
 * solely from the board's own owner/collaborators.
 */
export function resolveBoardPermission(user: AuthUser | null, board: Board | null): BoardRole | null {
  if (!user || !board) return null;
  if (user.role === 'admin') return 'owner';
  if (board.owner?.id === user._id) return 'owner';

  const collaborator = board.collaborators?.find((c) => c.user.id === user._id);
  return collaborator ? collaborator.role : null;
}

export function hasAtLeast(permission: BoardRole | null, min: BoardRole): boolean {
  if (!permission) return false;
  return RANK[permission] >= RANK[min];
}
