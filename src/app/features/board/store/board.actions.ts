import { createAction, props } from '@ngrx/store';
import { Board, Column, Task } from '../../../core/models/board.model';

// ── Load Boards ───────────────────────────────────────────────────────────────
export const loadBoards = createAction('[Board] Load Boards');
export const loadBoardsSuccess = createAction(
  '[Board] Load Boards Success',
  props<{ boards: Board[] }>(),
);
export const loadBoardsFailure = createAction(
  '[Board] Load Boards Failure',
  props<{ error: string }>(),
);

// ── Active Board ──────────────────────────────────────────────────────────────
export const setActiveBoard = createAction(
  '[Board] Set Active Board',
  props<{ boardId: string }>(),
);

// ── Add Board ─────────────────────────────────────────────────────────────────
export const addBoard = createAction('[Board] Add Board', props<{ name: string }>());
export const addBoardSuccess = createAction('[Board] Add Board Success', props<{ board: Board }>());
export const addBoardFailure = createAction(
  '[Board] Add Board Failure',
  props<{ error: string }>(),
);

// ── Update Board ──────────────────────────────────────────────────────────────
export const updateBoard = createAction(
  '[Board] Update Board',
  props<{ boardId: string; name: string }>(),
);
export const updateBoardSuccess = createAction(
  '[Board] Update Board Success',
  props<{ board: Board }>(),
);
export const updateBoardFailure = createAction(
  '[Board] Update Board Failure',
  props<{ error: string }>(),
);

// ── Delete Board ──────────────────────────────────────────────────────────────
export const deleteBoard = createAction('[Board] Delete Board', props<{ boardId: string }>());
export const deleteBoardSuccess = createAction(
  '[Board] Delete Board Success',
  props<{ boardId: string }>(),
);
export const deleteBoardFailure = createAction(
  '[Board] Delete Board Failure',
  props<{ error: string }>(),
);

// ── Add Task ──────────────────────────────────────────────────────────────────
export const addTask = createAction(
  '[Task] Add Task',
  props<{ boardId: string; task: Omit<Task, 'id'> }>(),
);
export const addTaskSuccess = createAction('[Task] Add Task Success', props<{ board: Board }>());
export const addTaskFailure = createAction('[Task] Add Task Failure', props<{ error: string }>());

// ── Update Task ───────────────────────────────────────────────────────────────
export const updateTask = createAction(
  '[Task] Update Task',
  props<{ boardId: string; taskId: string; updates: Partial<Omit<Task, 'id'>> }>(),
);
export const updateTaskSuccess = createAction(
  '[Task] Update Task Success',
  props<{ board: Board }>(),
);
export const updateTaskFailure = createAction(
  '[Task] Update Task Failure',
  props<{ error: string }>(),
);

// ── Delete Task ───────────────────────────────────────────────────────────────
export const deleteTask = createAction(
  '[Task] Delete Task',
  props<{ boardId: string; taskId: string }>(),
);
export const deleteTaskSuccess = createAction(
  '[Task] Delete Task Success',
  props<{ board: Board }>(),
);
export const deleteTaskFailure = createAction(
  '[Task] Delete Task Failure',
  props<{ error: string }>(),
);

// ── Toggle Subtask ────────────────────────────────────────────────────────────
export const toggleSubtask = createAction(
  '[Task] Toggle Subtask',
  props<{ boardId: string; taskId: string; subtaskId: string }>(),
);
export const toggleSubtaskSuccess = createAction(
  '[Task] Toggle Subtask Success',
  props<{ board: Board }>(),
);
export const toggleSubtaskFailure = createAction(
  '[Task] Toggle Subtask Failure',
  props<{ error: string }>(),
);

// ── Add Column ────────────────────────────────────────────────────────────────
export const addColumn = createAction(
  '[Column] Add Column',
  props<{ boardId: string; name: string }>(),
);
export const addColumnSuccess = createAction(
  '[Column] Add Column Success',
  props<{ boardId: string; column: Column }>(),
);
export const addColumnFailure = createAction(
  '[Column] Add Column Failure',
  props<{ error: string }>(),
);

// ── Rename Column ────────────────────────────────────────────────────────────
export const renameColumn = createAction(
  '[Column] Rename Column',
  props<{ boardId: string; columnId: string; name: string }>(),
);
export const renameColumnSuccess = createAction(
  '[Column] Rename Column Success',
  props<{ boardId: string; column: Column }>(),
);
export const renameColumnFailure = createAction(
  '[Column] Rename Column Failure',
  props<{ error: string }>(),
);

// ── Delete Column ────────────────────────────────────────────────────────────
export const deleteColumn = createAction(
  '[Column] Delete Column',
  props<{ boardId: string; columnId: string }>(),
);
export const deleteColumnSuccess = createAction(
  '[Column] Delete Column Success',
  props<{ boardId: string; columnId: string }>(),
);
export const deleteColumnFailure = createAction(
  '[Column] Delete Column Failure',
  props<{ error: string }>(),
);

// ── Reorder Columns ───────────────────────────────────────────────────────────
export const reorderColumns = createAction(
  '[Column] Reorder Columns',
  props<{ boardId: string; columnIds: string[] }>(),
);
export const reorderColumnsSuccess = createAction(
  '[Column] Reorder Columns Success',
  props<{ boardId: string; columnIds: string[] }>(),
);
export const reorderColumnsFailure = createAction(
  '[Column] Reorder Columns Failure',
  props<{ error: string }>(),
);
