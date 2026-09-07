import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { Observable, forkJoin, from, of } from 'rxjs';
import { catchError, concatMap, map, switchMap, tap, toArray } from 'rxjs/operators';

import { Board, Column, Subtask, Task } from '../../../core/models/board.model';
import { ApiService } from '../../../core/services/api.service';
import * as BoardActions from './board.actions';
import { selectAllBoards, selectBoardEntities } from './board.selectors';

@Injectable()
export class BoardEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private router = inject(Router);
  private api = inject(ApiService);

  // ─────────────────────────────────────────────────────────────────────────
  //  LOAD BOARDS — GET /boards (nested columns + tasks)
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
  //  ADD BOARD — POST /boards, then POST each column sequentially
  //  (sequential, not parallel, so the backend's position-by-count logic
  //  can't race between concurrent column creates)
  // ─────────────────────────────────────────────────────────────────────────
  addBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.addBoard),
      switchMap(({ name, columnNames }) =>
        this.api.createBoard(name).pipe(
          switchMap((board) =>
            this.createColumnsSequentially(board.id, columnNames).pipe(
              map((columns) => ({ ...board, columns })),
            ),
          ),
          tap(() => this.api.bustCache()),
          map((board) => BoardActions.addBoardSuccess({ board })),
          catchError((err: Error) => of(BoardActions.addBoardFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  UPDATE BOARD — PUT /boards/:id, then diff columnNames against the
  //  board's existing columns (by name) to add/remove as needed.
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

        const desiredNames = columnNames.map((n) => n.trim()).filter(Boolean);

        return this.api.updateBoardName(boardId, name).pipe(
          switchMap(() => this.syncColumns(boardId, existing.columns, desiredNames)),
          tap(() => this.api.bustCache()),
          map((columns) => BoardActions.updateBoardSuccess({ board: { ...existing, name, columns } })),
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
          tap(() => this.api.bustCache()),
          map(() => BoardActions.deleteBoardSuccess({ boardId })),
          catchError((err: Error) => of(BoardActions.deleteBoardFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  ADD TASK — POST /tasks
  //  task.status carries the target column's *name* (existing convention);
  //  resolved to a columnId before calling the API.
  // ─────────────────────────────────────────────────────────────────────────
  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.addTask),
      concatLatestFrom(() => this.store.select(selectBoardEntities)),
      switchMap(([{ boardId, task }, entities]) => {
        const board = entities[boardId];
        const column = board?.columns.find((c) => c.name === task.status);
        if (!board || !column) {
          return of(BoardActions.addTaskFailure({ error: 'Column not found' }));
        }

        return this.api
          .createTask(column.id, {
            title: task.title,
            description: task.description,
            dueDate: task.dueDate || undefined,
            subtasks: task.subtasks.map((s) => ({ title: s.title })),
          })
          .pipe(
            tap(() => this.api.bustCache()),
            map((created) => {
              const updatedBoard: Board = {
                ...board,
                columns: board.columns.map((c) =>
                  c.id === column.id ? { ...c, tasks: [...c.tasks, created] } : c,
                ),
              };
              return BoardActions.addTaskSuccess({ board: updatedBoard });
            }),
            catchError((err: Error) => of(BoardActions.addTaskFailure({ error: err.message }))),
          );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  UPDATE TASK — PUT /tasks/:id for field/column changes, plus a diff-based
  //  subtask sync (POST/PUT/DELETE) when `updates.subtasks` is provided.
  // ─────────────────────────────────────────────────────────────────────────
  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.updateTask),
      concatLatestFrom(() => this.store.select(selectBoardEntities)),
      switchMap(([{ boardId, taskId, updates }, entities]) => {
        const board = entities[boardId];
        const currentColumn = board?.columns.find((c) => c.tasks.some((t) => t.id === taskId));
        const currentTask = currentColumn?.tasks.find((t) => t.id === taskId);
        if (!board || !currentColumn || !currentTask) {
          return of(BoardActions.updateTaskFailure({ error: 'Task not found' }));
        }

        const targetColumn = updates.status
          ? (board.columns.find((c) => c.name === updates.status) ?? null)
          : currentColumn;
        if (!targetColumn) {
          return of(BoardActions.updateTaskFailure({ error: 'Target column not found' }));
        }

        const fields: Record<string, unknown> = {};
        if (updates.title !== undefined) fields['title'] = updates.title;
        if (updates.description !== undefined) fields['description'] = updates.description;
        if (updates.dueDate !== undefined) fields['dueDate'] = updates.dueDate || null;
        if (targetColumn.id !== currentColumn.id) fields['columnId'] = targetColumn.id;

        const fieldUpdate$ = Object.keys(fields).length
          ? this.api.updateTask(taskId, fields)
          : of(currentTask);
        const subtasks$ = updates.subtasks
          ? this.syncSubtasks(taskId, currentTask.subtasks, updates.subtasks)
          : of(currentTask.subtasks);

        return forkJoin([fieldUpdate$, subtasks$]).pipe(
          tap(() => this.api.bustCache()),
          map(([updatedTask, subtasks]) => {
            const finalTask: Task = { ...updatedTask, subtasks, status: targetColumn.name };
            const updatedBoard: Board = {
              ...board,
              columns: board.columns.map((c) => {
                if (c.id === currentColumn.id && c.id !== targetColumn.id) {
                  return { ...c, tasks: c.tasks.filter((t) => t.id !== taskId) };
                }
                if (c.id === targetColumn.id) {
                  return { ...c, tasks: [...c.tasks.filter((t) => t.id !== taskId), finalTask] };
                }
                return c;
              }),
            };
            return BoardActions.updateTaskSuccess({ board: updatedBoard });
          }),
          catchError((err: Error) => of(BoardActions.updateTaskFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  DELETE TASK — DELETE /tasks/:id
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

        return this.api.deleteTask(taskId).pipe(
          tap(() => this.api.bustCache()),
          map(() => {
            const updatedBoard: Board = {
              ...board,
              columns: board.columns.map((c) => ({
                ...c,
                tasks: c.tasks.filter((t) => t.id !== taskId),
              })),
            };
            return BoardActions.deleteTaskSuccess({ board: updatedBoard });
          }),
          catchError((err: Error) => of(BoardActions.deleteTaskFailure({ error: err.message }))),
        );
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  TOGGLE SUBTASK — PATCH /tasks/:id/subtasks/:subtaskId/toggle
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

        return this.api.toggleSubtask(taskId, subtaskId).pipe(
          tap(() => this.api.bustCache()),
          map((updatedTask) => {
            const updatedBoard: Board = {
              ...board,
              columns: board.columns.map((c) => ({
                ...c,
                tasks: c.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
              })),
            };
            return BoardActions.toggleSubtaskSuccess({ board: updatedBoard });
          }),
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

  // ─────────────────────────────────────────────────────────────────────────
  //  Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private createColumnsSequentially(boardId: string, columnNames: string[]): Observable<Column[]> {
    const names = columnNames.map((n) => n.trim()).filter(Boolean);
    if (!names.length) {
      return of([]);
    }
    return from(names).pipe(
      concatMap((name) => this.api.createColumn(boardId, name)),
      toArray(),
    );
  }

  private syncColumns(
    boardId: string,
    existing: Column[],
    desiredNames: string[],
  ): Observable<Column[]> {
    const toKeep = existing.filter((c) => desiredNames.includes(c.name));
    const toRemove = existing.filter((c) => !desiredNames.includes(c.name));
    const toAdd = desiredNames.filter((n) => !existing.some((c) => c.name === n));

    const removals$ = from(toRemove).pipe(
      concatMap((c) => this.api.deleteColumn(c.id)),
      toArray(),
    );
    const additions$ = from(toAdd).pipe(
      concatMap((name) => this.api.createColumn(boardId, name)),
      toArray(),
    );

    return removals$.pipe(
      switchMap(() => additions$),
      map((created) => [...toKeep, ...created]),
    );
  }

  private syncSubtasks(
    taskId: string,
    existing: Subtask[],
    desired: { id: string; title: string }[],
  ): Observable<Subtask[]> {
    const existingIds = new Set(existing.map((s) => s.id));
    const desiredIds = new Set(desired.map((s) => s.id));

    const toRemove = existing.filter((s) => !desiredIds.has(s.id));
    const toAdd = desired.filter((s) => !existingIds.has(s.id));
    const toRename = desired.filter((s) => {
      const match = existing.find((e) => e.id === s.id);
      return !!match && match.title !== s.title;
    });

    const removals$ = from(toRemove).pipe(
      concatMap((s) => this.api.deleteSubtask(taskId, s.id)),
      toArray(),
    );
    const additions$ = from(toAdd).pipe(
      concatMap((s) => this.api.addSubtask(taskId, s.title)),
      toArray(),
    );
    const renames$ = from(toRename).pipe(
      concatMap((s) => this.api.renameSubtask(taskId, s.id, s.title)),
      toArray(),
    );

    if (!toRemove.length && !toAdd.length && !toRename.length) {
      return of(existing);
    }

    return removals$.pipe(
      switchMap(() => additions$),
      switchMap(() => renames$),
      switchMap(() => this.api.getTask(taskId)),
      map((task) => task.subtasks),
    );
  }
}
