import { createFeatureSelector, createSelector } from '@ngrx/store';
import { boardAdapter } from './board.reducer';
import { BoardState } from './board.state';
import { Board, Task } from '../../../core/models/board.model';

export const selectBoardFeature = createFeatureSelector<BoardState>('boards');

const { selectAll, selectEntities, selectIds, selectTotal } = boardAdapter.getSelectors();

export const selectAllBoards = createSelector(selectBoardFeature, selectAll);
export const selectBoardEntities = createSelector(selectBoardFeature, selectEntities);
export const selectBoardIds = createSelector(selectBoardFeature, selectIds);
export const selectBoardCount = createSelector(selectBoardFeature, selectTotal);

export const selectActiveBoardId = createSelector(selectBoardFeature, (s) => s.activeBoardId);
export const selectBoardsLoading = createSelector(selectBoardFeature, (s) => s.loading);
export const selectBoardsError = createSelector(selectBoardFeature, (s) => s.error);
export const selectLastLoaded = createSelector(selectBoardFeature, (s) => s.lastLoaded);

export const selectActiveBoard = createSelector(
  selectBoardEntities,
  selectActiveBoardId,
  (entities, id) => (id ? (entities[id] ?? null) : null),
);

export const selectBoardById = (boardId: string) =>
  createSelector(selectBoardEntities, (entities) => entities[boardId] ?? null);

export const selectTaskResult = (taskId: string) =>
  createSelector(selectAllBoards, (boards): { task: Task; boardId: string } | null => {
    for (const board of boards) {
      for (const col of board.columns) {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) return { task, boardId: board.id };
      }
    }
    return null;
  });

export const selectStatusOptions = createSelector(
  selectActiveBoard,
  (board) => board?.columns.map((c) => c.name) ?? [],
);

/**
 * True if boards were loaded less than CACHE_TTL_MS ago.
 * Used in app.ts to skip re-dispatching loadBoards on repeat visits.
 */
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const selectBoardsAreFresh = createSelector(
  selectLastLoaded,
  (lastLoaded) => lastLoaded !== null && Date.now() - lastLoaded < CACHE_TTL_MS,
);
