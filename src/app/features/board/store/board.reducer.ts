import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Board, Column } from '../../../core/models/board.model';
import { BoardState } from './board.state';
import * as BoardActions from './board.actions';

export const boardAdapter: EntityAdapter<Board> = createEntityAdapter<Board>();

export const initialBoardState: BoardState = boardAdapter.getInitialState({
  activeBoardId: null,
  loading: false,
  error: null,
  lastLoaded: null,
});

/** Applies `updater` to one board's columns array, leaving everything else untouched. */
function withUpdatedColumns(
  state: BoardState,
  boardId: string,
  updater: (columns: Column[]) => Column[],
): BoardState {
  const board = state.entities[boardId];
  if (!board) return state;
  return boardAdapter.updateOne({ id: boardId, changes: { columns: updater(board.columns) } }, state);
}

export const boardReducer = createReducer(
  initialBoardState,

  // ── Load Boards ────────────────────────────────────────────────────────────
  on(BoardActions.loadBoards, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(BoardActions.loadBoardsSuccess, (state, { boards }) => {
    // A reducer must never throw — guard against a malformed response (e.g. a
    // backend returning a wrapped envelope instead of a bare array) so it
    // degrades to an error state instead of permanently breaking the store's
    // action stream for every feature.
    if (!Array.isArray(boards)) {
      return { ...state, loading: false, error: 'Received an unexpected response shape for boards.' };
    }
    return boardAdapter.setAll(boards, {
      ...state,
      loading: false,
      error: null,
      lastLoaded: Date.now(), // stamp the successful load time
      activeBoardId: state.activeBoardId ?? boards[0]?.id ?? null,
    });
  }),

  on(BoardActions.loadBoardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Active Board ───────────────────────────────────────────────────────────
  on(BoardActions.setActiveBoard, (state, { boardId }) => ({
    ...state,
    activeBoardId: boardId,
  })),

  // ── Add Board ──────────────────────────────────────────────────────────────
  on(BoardActions.addBoard, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.addBoardSuccess, (state, { board }) =>
    boardAdapter.addOne(board, {
      ...state,
      loading: false,
      error: null,
      activeBoardId: board.id,
    }),
  ),

  on(BoardActions.addBoardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Update Board ───────────────────────────────────────────────────────────
  on(BoardActions.updateBoard, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.updateBoardSuccess, (state, { board }) =>
    boardAdapter.upsertOne(board, { ...state, loading: false, error: null }),
  ),

  on(BoardActions.updateBoardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Delete Board ───────────────────────────────────────────────────────────
  on(BoardActions.deleteBoard, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.deleteBoardSuccess, (state, { boardId }) => {
    const next = boardAdapter.removeOne(boardId, state);
    const remainingIds = next.ids as string[];
    const activeBoardId =
      state.activeBoardId === boardId ? (remainingIds[0] ?? null) : state.activeBoardId;
    return { ...next, loading: false, error: null, activeBoardId };
  }),

  on(BoardActions.deleteBoardFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Add Task ───────────────────────────────────────────────────────────────
  on(BoardActions.addTask, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.addTaskSuccess, (state, { board }) =>
    boardAdapter.upsertOne(board, { ...state, loading: false, error: null }),
  ),

  on(BoardActions.addTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Update Task ────────────────────────────────────────────────────────────
  on(BoardActions.updateTask, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.updateTaskSuccess, (state, { board }) =>
    boardAdapter.upsertOne(board, { ...state, loading: false, error: null }),
  ),

  on(BoardActions.updateTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Delete Task ────────────────────────────────────────────────────────────
  on(BoardActions.deleteTask, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.deleteTaskSuccess, (state, { board }) =>
    boardAdapter.upsertOne(board, { ...state, loading: false, error: null }),
  ),

  on(BoardActions.deleteTaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Toggle Subtask ─────────────────────────────────────────────────────────
  on(BoardActions.toggleSubtask, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.toggleSubtaskSuccess, (state, { board }) =>
    boardAdapter.upsertOne(board, { ...state, loading: false, error: null }),
  ),

  on(BoardActions.toggleSubtaskFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Add Column ─────────────────────────────────────────────────────────────
  on(BoardActions.addColumn, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.addColumnSuccess, (state, { boardId, column }) => ({
    ...withUpdatedColumns(state, boardId, (columns) => [...columns, column]),
    loading: false,
    error: null,
  })),

  on(BoardActions.addColumnFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // ── Rename Column ──────────────────────────────────────────────────────────
  on(BoardActions.renameColumn, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.renameColumnSuccess, (state, { boardId, column }) => ({
    ...withUpdatedColumns(state, boardId, (columns) =>
      columns.map((c) => (c.id === column.id ? { ...column, tasks: c.tasks } : c)),
    ),
    loading: false,
    error: null,
  })),

  on(BoardActions.renameColumnFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // ── Delete Column ──────────────────────────────────────────────────────────
  on(BoardActions.deleteColumn, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.deleteColumnSuccess, (state, { boardId, columnId }) => ({
    ...withUpdatedColumns(state, boardId, (columns) => columns.filter((c) => c.id !== columnId)),
    loading: false,
    error: null,
  })),

  on(BoardActions.deleteColumnFailure, (state, { error }) => ({ ...state, loading: false, error })),

  // ── Reorder Columns ────────────────────────────────────────────────────────
  on(BoardActions.reorderColumns, (state) => ({ ...state, loading: true, error: null })),

  on(BoardActions.reorderColumnsSuccess, (state, { boardId, columnIds }) => ({
    ...withUpdatedColumns(state, boardId, (columns) => {
      const byId = new Map(columns.map((c) => [c.id, c]));
      return columnIds.map((id) => byId.get(id)).filter((c): c is Column => !!c);
    }),
    loading: false,
    error: null,
  })),

  on(BoardActions.reorderColumnsFailure, (state, { error }) => ({ ...state, loading: false, error })),
);
