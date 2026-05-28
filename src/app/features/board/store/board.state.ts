import { EntityState } from '@ngrx/entity';
import { Board } from '../../../core/models/board.model';

export interface BoardState extends EntityState<Board> {
  activeBoardId: string | null;
  loading: boolean;
  error: string | null;
}
