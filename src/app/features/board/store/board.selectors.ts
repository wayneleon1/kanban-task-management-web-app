import { createFeatureSelector, createSelector } from '@ngrx/store';
import { boardAdapter } from './board.reducer';
import { BoardState } from './board.state';
import { Board, Task } from '../../../core/models/board.model';

export const selectBoardFeature = createFeatureSelector<BoardState>('boards');

const { selectAll, selectEntities, selectIds, selectTotal } = boardAdapter.getSelectors();

// Compose with the feature selector to get scoped selectors
export const selectAllBoards = createSelector(selectBoardFeature, selectAll);
export const selectBoardEntities = createSelector(selectBoardFeature, selectEntities);
export const selectBoardIds = createSelector(selectBoardFeature, selectIds);
export const selectBoardCount = createSelector(selectBoardFeature, selectTotal);

// ─────────────────────────────────────────────────────────────────────────────
//  PRIMITIVE STATE SLICES
// ─────────────────────────────────────────────────────────────────────────────
export const selectActiveBoardId = createSelector(selectBoardFeature, (s) => s.activeBoardId);
export const selectBoardsLoading = createSelector(selectBoardFeature, (s) => s.loading);
export const selectBoardsError = createSelector(selectBoardFeature, (s) => s.error);

// ─────────────────────────────────────────────────────────────────────────────
//  DERIVED SELECTORS — composed from primitives above
//  createSelector() memoizes: re-runs ONLY when inputs change.
// ─────────────────────────────────────────────────────────────────────────────
export const selectActiveBoard = createSelector(
  selectBoardEntities,
  selectActiveBoardId,
  (entities, id) => (id ? (entities[id] ?? null) : null),
);

/** Select a single board by its ID */
export const selectBoardById = (boardId: string) =>
  createSelector(selectBoardEntities, (entities) => entities[boardId] ?? null);

/**
 * Find a task across ALL boards and columns.
 * Returns { task, boardId } or null — same shape as the old findTask() method.
 */
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

/** Status options (column names) for the active board — used in task forms */
export const selectStatusOptions = createSelector(
  selectActiveBoard,
  (board) => board?.columns.map((c) => c.name) ?? [],
);
