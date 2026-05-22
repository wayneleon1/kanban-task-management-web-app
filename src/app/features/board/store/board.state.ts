import { EntityState } from '@ngrx/entity';
import { Board } from '../../../core/models/board.model';

export interface BoardState extends EntityState<Board> {
  activeBoardId: string | null;
  loading: boolean;
  error: string | null;
  /** Unix timestamp (ms) of the last successful loadBoardsSuccess. null = never loaded. */
  lastLoaded: number | null;
}
