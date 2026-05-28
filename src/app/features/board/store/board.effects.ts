import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, switchMap, catchError, tap } from 'rxjs/operators';

import { Board } from '../../../core/models/board.model';
import { generateId } from '../../../core/utils/id.utils';
import { SEED_BOARDS } from '../../../core/data/board.seed';
import * as BoardActions from './board.actions';
import { selectAllBoards } from './board.selectors';

const COLUMN_COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#E9A23B', '#F24E1E', '#935FC4', '#1ABCFE'];
const STORAGE_KEY = 'kanban-boards';

@Injectable()
export class BoardEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private router = inject(Router);

  // ─────────────────────────────────────────────────────────────────────────
  //  LOAD BOARDS
  //  Triggered on app init. Reads from localStorage (simulates an API call).
  //  Pattern: loadBoards → [localStorage] → loadBoardsSuccess | loadBoardsFailure
  // ─────────────────────────────────────────────────────────────────────────
  loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoards),
      switchMap(() => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const boards = raw ? (JSON.parse(raw) as Board[]) : SEED_BOARDS;
          return of(BoardActions.loadBoardsSuccess({ boards }));
        } catch {
          return of(BoardActions.loadBoardsFailure({ error: 'Failed to load boards' }));
        }
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  ADD BOARD
  //  Builds the complete Board entity (generates IDs) then dispatches
  //  addBoardSuccess so the reducer can add it to the store.
  //  After success, navigates to the new board's route.
  // ─────────────────────────────────────────────────────────────────────────
  addBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.addBoard),
      map(({ name, columnNames }) => {
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
        return BoardActions.addBoardSuccess({ board });
      }),
    ),
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  NAVIGATE AFTER ADD BOARD
  //  Separate effect so navigation (a side effect) is isolated.
  //  { dispatch: false } — this effect produces no new action.
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
  //  NAVIGATE AFTER DELETE BOARD
  //  After deletion, redirect to the first remaining board.
  //  concatLatestFrom reads the updated state AFTER the reducer ran.
  // ─────────────────────────────────────────────────────────────────────────
  navigateAfterDeleteBoard$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(BoardActions.deleteBoard),
        concatLatestFrom(() => this.store.select(selectAllBoards)),
        tap(([, boards]) => {
          const first = boards[0];
          this.router.navigate(first ? ['/boards', first.id] : ['/']);
        }),
      ),
    { dispatch: false },
  );

  // ─────────────────────────────────────────────────────────────────────────
  //  PERSIST TO LOCALSTORAGE
  //  Fires after ANY mutation action. Uses concatLatestFrom to read
  //  the updated state from the store (after the reducer already ran).
  //  { dispatch: false } — pure side effect, no new action emitted.
  // ─────────────────────────────────────────────────────────────────────────
  persistBoards$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          BoardActions.addBoardSuccess,
          BoardActions.updateBoard,
          BoardActions.deleteBoard,
          BoardActions.addTask,
          BoardActions.updateTask,
          BoardActions.deleteTask,
          BoardActions.toggleSubtask,
        ),
        concatLatestFrom(() => this.store.select(selectAllBoards)),
        tap(([, boards]) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
        }),
      ),
    { dispatch: false },
  );
}
