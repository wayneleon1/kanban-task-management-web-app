import { BoardMember } from './board.model';

export interface ActivityEntry {
  id: string;
  actor: BoardMember;
  message: string;
  createdAt: string;
}
