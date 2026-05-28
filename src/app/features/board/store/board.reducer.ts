import { createEntityAdapter, EntityAdapter } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { Board } from '../../../core/models/board.model';
import { generateId } from '../../../core/utils/id.utils';
import { BoardState } from './board.state';
import * as BoardActions from './board.actions';

const COLUMN_COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#E9A23B', '#F24E1E', '#935FC4', '#1ABCFE'];

export const boardAdapter: EntityAdapter<Board> = createEntityAdapter<Board>({
  // Default sort: preserve insertion order (no sortComparer needed)
});

export const initialBoardState: BoardState = boardAdapter.getInitialState({
  activeBoardId: null,
  loading: false,
  error: null,
});

// Reducer function handles all state changes based on dispatched actions
export const boardReducer = createReducer(
  initialBoardState,

  //  Load Boards
  on(BoardActions.loadBoards, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),

  on(BoardActions.loadBoardsSuccess, (state, { boards }) =>
    boardAdapter.setAll(boards, {
      ...state,
      loading: false,
      // Set first board as active if nothing is active yet
      activeBoardId: state.activeBoardId ?? boards[0]?.id ?? null,
    }),
  ),

  on(BoardActions.loadBoardsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // ── Active Board ──────────────────────────────────────────────────────────
  on(BoardActions.setActiveBoard, (state, { boardId }) => ({
    ...state,
    activeBoardId: boardId,
  })),

  // ── Add Board Success (board entity already built by Effect) ──────────────
  on(BoardActions.addBoardSuccess, (state, { board }) =>
    boardAdapter.addOne(board, {
      ...state,
      activeBoardId: board.id, // Auto-activate the new board
    }),
  ),

  // ── Update Board ──────────────────────────────────────────────────────────
  on(BoardActions.updateBoard, (state, { boardId, name, columnNames }) => {
    const board = state.entities[boardId];
    if (!board) return state;

    // Preserve existing columns (with tasks) when name matches; create new ones
    const updatedColumns = columnNames
      .filter((n) => n.trim())
      .map((colName, i) => {
        const existing = board.columns.find((c) => c.name === colName.trim());
        return (
          existing ?? {
            id: generateId(),
            name: colName.trim(),
            color: COLUMN_COLORS[i % COLUMN_COLORS.length],
            tasks: [],
          }
        );
      });

    return boardAdapter.updateOne(
      { id: boardId, changes: { name, columns: updatedColumns } },
      state,
    );
  }),

  // ── Delete Board ──────────────────────────────────────────────────────────
  on(BoardActions.deleteBoard, (state, { boardId }) => {
    const next = boardAdapter.removeOne(boardId, state);
    const remainingIds = next.ids as string[];
    // If we deleted the active board, activate the first remaining one
    const activeBoardId =
      state.activeBoardId === boardId ? (remainingIds[0] ?? null) : state.activeBoardId;
    return { ...next, activeBoardId };
  }),

  // ── Add Task ──────────────────────────────────────────────────────────────
  on(BoardActions.addTask, (state, { boardId, task }) => {
    const board = state.entities[boardId];
    if (!board) return state;

    const newTask = { ...task, id: generateId() };
    const updatedColumns = board.columns.map((col) =>
      col.name === newTask.status ? { ...col, tasks: [...col.tasks, newTask] } : col,
    );

    return boardAdapter.updateOne({ id: boardId, changes: { columns: updatedColumns } }, state);
  }),

  // ── Update Task (handles status change → moves between columns) ───────────
  on(BoardActions.updateTask, (state, { boardId, taskId, updates }) => {
    const board = state.entities[boardId];
    if (!board) return state;

    // Find the task in any column
    let current = null;
    for (const col of board.columns) {
      const found = col.tasks.find((t) => t.id === taskId);
      if (found) {
        current = found;
        break;
      }
    }
    if (!current) return state;

    const updated = { ...current, ...updates };

    // Remove from old column, add to matching new column
    const updatedColumns = board.columns.map((col) => {
      const without = col.tasks.filter((t) => t.id !== taskId);
      return col.name === updated.status
        ? { ...col, tasks: [...without, updated] }
        : { ...col, tasks: without };
    });

    return boardAdapter.updateOne({ id: boardId, changes: { columns: updatedColumns } }, state);
  }),

  // ── Delete Task ───────────────────────────────────────────────────────────
  on(BoardActions.deleteTask, (state, { boardId, taskId }) => {
    const board = state.entities[boardId];
    if (!board) return state;

    const updatedColumns = board.columns.map((col) => ({
      ...col,
      tasks: col.tasks.filter((t) => t.id !== taskId),
    }));

    return boardAdapter.updateOne({ id: boardId, changes: { columns: updatedColumns } }, state);
  }),

  // ── Toggle Subtask ────────────────────────────────────────────────────────
  on(BoardActions.toggleSubtask, (state, { boardId, taskId, subtaskId }) => {
    const board = state.entities[boardId];
    if (!board) return state;

    const updatedColumns = board.columns.map((col) => ({
      ...col,
      tasks: col.tasks.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          subtasks: task.subtasks.map((st) =>
            st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
          ),
        };
      }),
    }));

    return boardAdapter.updateOne({ id: boardId, changes: { columns: updatedColumns } }, state);
  }),
);
