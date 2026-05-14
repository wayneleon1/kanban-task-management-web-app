import { createAction, props } from '@ngrx/store';
import { Board, Task } from '../../../core/models/board.model';

// ── Load Boards (simulates an API call) ──────────────────────────────────────
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

// ── Board CRUD ────────────────────────────────────────────────────────────────
export const addBoard = createAction(
  '[Board] Add Board',
  props<{ name: string; columnNames: string[] }>(),
);

// addBoardSuccess carries the fully constructed Board — built in the Effect
export const addBoardSuccess = createAction('[Board] Add Board Success', props<{ board: Board }>());

export const updateBoard = createAction(
  '[Board] Update Board',
  props<{ boardId: string; name: string; columnNames: string[] }>(),
);

export const deleteBoard = createAction('[Board] Delete Board', props<{ boardId: string }>());

// ── Task CRUD ─────────────────────────────────────────────────────────────────
export const addTask = createAction(
  '[Task] Add Task',
  props<{ boardId: string; task: Omit<Task, 'id'> }>(),
);

export const updateTask = createAction(
  '[Task] Update Task',
  props<{ boardId: string; taskId: string; updates: Partial<Omit<Task, 'id'>> }>(),
);

export const deleteTask = createAction(
  '[Task] Delete Task',
  props<{ boardId: string; taskId: string }>(),
);

export const toggleSubtask = createAction(
  '[Task] Toggle Subtask',
  props<{ boardId: string; taskId: string; subtaskId: string }>(),
);
