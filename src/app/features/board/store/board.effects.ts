import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

import { Board } from '../../../core/models/board.model';
import { generateId } from '../../../core/utils/id.utils';
import { ApiService } from '../../../core/services/api.service';
import * as BoardActions from './board.actions';
import { selectAllBoards, selectBoardEntities } from './board.selectors';

const COLUMN_COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#E9A23B', '#F24E1E', '#935FC4', '#1ABCFE'];

@Injectable()
export class BoardEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private router = inject(Router);
  private api = inject(ApiService);

  // ─────────────────────────────────────────────────────────────────────────
  //  LOAD BOARDS — GET /boards
  //  Replaces the old localStorage.getItem logic.
  // ─────────────────────────────────────────────────────────────────────────
  loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoards),
      switchMap(() =>
        this.api.getBoards().pipe(
          map((boards) => BoardActions.loadBoardsSuccess({ boards })),
          catchError((err: Error) => of(BoardActions.loadBoardsFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  ADD BOARD — POST /boards
  //  Builds the full Board entity here (generates IDs), then persists it.
  //  On success dispatches addBoardSuccess so the reducer adds it to state.
  // ─────────────────────────────────────────────────────────────────────────
  addBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.addBoard),
      switchMap(({ name, columnNames }) => {
        const board: Board = {
          id: name.toLowerCase().replace(/\s+/g, '-') + '-' + generateId().slice(0, 4),
          name,
          columns: columnNames
            .filter((n) => n.trim())
            .map((colName, i) => ({
              id: generateId(),
              name: colName.trim(),
              color: COLUMN_COLORS[i % COLUMN_COLORS.length],
              tasks: [],
            })),
        };
        return this.api.createBoard(board).pipe(
          map((created) => BoardActions.addBoardSuccess({ board: created })),
          catchError((err: Error) => of(BoardActions.addBoardFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  UPDATE BOARD — PUT /boards/:id
  //  Reads current board from store, merges name + rebuilt columns, PUTs it.
  // ─────────────────────────────────────────────────────────────────────────
  updateBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.updateBoard),
      concatLatestFrom(() => this.store.select(selectBoardEntities)),
      switchMap(([{ boardId, name, columnNames }, entities]) => {
        const existing = entities[boardId];
        if (!existing) {
          return of(BoardActions.updateBoardFailure({ error: 'Board not found' }));
        }

        const updatedColumns = columnNames
          .filter((n) => n.trim())
          .map((colName, i) => {
            const col = existing.columns.find((c) => c.name === colName.trim());
            return (
              col ?? {
                id: generateId(),
                name: colName.trim(),
                color: COLUMN_COLORS[i % COLUMN_COLORS.length],
                tasks: [],
              }
            );
          });

        const updatedBoard: Board = { ...existing, name, columns: updatedColumns };

        return this.api.updateBoard(updatedBoard).pipe(
          map((board) => BoardActions.updateBoardSuccess({ board })),
          catchError((err: Error) => of(BoardActions.updateBoardFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  DELETE BOARD — DELETE /boards/:id
  // ─────────────────────────────────────────────────────────────────────────
  deleteBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.deleteBoard),
      switchMap(({ boardId }) =>
        this.api.deleteBoard(boardId).pipe(
          map(() => BoardActions.deleteBoardSuccess({ boardId })),
          catchError((err: Error) => of(BoardActions.deleteBoardFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  ADD TASK — PUT /boards/:id  (tasks are nested inside the board)
  //  Builds the new task, merges it into the correct column, then PUTs the
  //  full board back to json-server.
  // ─────────────────────────────────────────────────────────────────────────
  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.addTask),
      concatLatestFrom(() => this.store.select(selectBoardEntities)),
      switchMap(([{ boardId, task }, entities]) => {
        const board = entities[boardId];
        if (!board) {
          return of(BoardActions.addTaskFailure({ error: 'Board not found' }));
        }

        const newTask = { ...task, id: generateId() };
        const updatedBoard: Board = {
          ...board,
          columns: board.columns.map((col) =>
            col.name === newTask.status ? { ...col, tasks: [...col.tasks, newTask] } : col,
          ),
        };

        return this.api.updateBoard(updatedBoard).pipe(
          map((saved) => BoardActions.addTaskSuccess({ board: saved })),
          catchError((err: Error) => of(BoardActions.addTaskFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  UPDATE TASK — PUT /boards/:id
  //  Moves the task between columns if status changed.
  // ─────────────────────────────────────────────────────────────────────────
  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.updateTask),
      concatLatestFrom(() => this.store.select(selectBoardEntities)),
      switchMap(([{ boardId, taskId, updates }, entities]) => {
        const board = entities[boardId];
        if (!board) {
          return of(BoardActions.updateTaskFailure({ error: 'Board not found' }));
        }

        let current = null;
        for (const col of board.columns) {
          const found = col.tasks.find((t) => t.id === taskId);
          if (found) {
            current = found;
            break;
          }
        }
        if (!current) {
          return of(BoardActions.updateTaskFailure({ error: 'Task not found' }));
        }

        const updated = { ...current, ...updates };
        const updatedBoard: Board = {
          ...board,
          columns: board.columns.map((col) => {
            const without = col.tasks.filter((t) => t.id !== taskId);
            return col.name === updated.status
              ? { ...col, tasks: [...without, updated] }
              : { ...col, tasks: without };
          }),
        };

        return this.api.updateBoard(updatedBoard).pipe(
          map((saved) => BoardActions.updateTaskSuccess({ board: saved })),
          catchError((err: Error) => of(BoardActions.updateTaskFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  DELETE TASK — PUT /boards/:id
  // ─────────────────────────────────────────────────────────────────────────
  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.deleteTask),
      concatLatestFrom(() => this.store.select(selectBoardEntities)),
      switchMap(([{ boardId, taskId }, entities]) => {
        const board = entities[boardId];
        if (!board) {
          return of(BoardActions.deleteTaskFailure({ error: 'Board not found' }));
        }

        const updatedBoard: Board = {
          ...board,
          columns: board.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          })),
        };

        return this.api.updateBoard(updatedBoard).pipe(
          map((saved) => BoardActions.deleteTaskSuccess({ board: saved })),
          catchError((err: Error) => of(BoardActions.deleteTaskFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  TOGGLE SUBTASK — PUT /boards/:id
  // ─────────────────────────────────────────────────────────────────────────
  toggleSubtask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.toggleSubtask),
      concatLatestFrom(() => this.store.select(selectBoardEntities)),
      switchMap(([{ boardId, taskId, subtaskId }, entities]) => {
        const board = entities[boardId];
        if (!board) {
          return of(BoardActions.toggleSubtaskFailure({ error: 'Board not found' }));
        }

        const updatedBoard: Board = {
          ...board,
          columns: board.columns.map((col) => ({
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
          })),
        };

        return this.api.updateBoard(updatedBoard).pipe(
          map((saved) => BoardActions.toggleSubtaskSuccess({ board: saved })),
          catchError((err: Error) => of(BoardActions.toggleSubtaskFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  NAVIGATE AFTER ADD BOARD — { dispatch: false }
  // ─────────────────────────────────────────────────────────────────────────
  navigateAfterAddBoard$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BoardActions.addBoardSuccess),
        tap(({ board }) => this.router.navigate(['/boards', board.id])),
      ),
    { dispatch: false },
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  NAVIGATE AFTER DELETE BOARD — { dispatch: false }
  //  Reads the post-deletion state to find the first remaining board.
  // ─────────────────────────────────────────────────────────────────────────
  navigateAfterDeleteBoard$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BoardActions.deleteBoardSuccess),
        concatLatestFrom(() => this.store.select(selectAllBoards)),
        tap(([, boards]) => {
          const first = boards[0];
          this.router.navigate(first ? ['/boards', first.id] : ['/']);
        }),
      ),
    { dispatch: false },
  );
}
