import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Board } from '../../../core/models/board.model';
import { BoardState } from './board.state';
import * as BoardActions from './board.actions';

export const boardAdapter: EntityAdapter<Board> = createEntityAdapter<Board>();

export const initialBoardState: BoardState = boardAdapter.getInitialState({
  activeBoardId: null,
  loading: false,
  error: null,
  lastLoaded: null,
});

export const boardReducer = createReducer(
  initialBoardState,

  // ── Load Boards ────────────────────────────────────────────────────────────
  on(BoardActions.loadBoards, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(BoardActions.loadBoardsSuccess, (state, { boards }) =>
    boardAdapter.setAll(boards, {
      ...state,
      loading: false,
      error: null,
      lastLoaded: Date.now(), // stamp the successful load time
      activeBoardId: state.activeBoardId ?? boards[0]?.id ?? null,
    }),
  ),

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
);
