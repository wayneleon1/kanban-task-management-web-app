import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';

import { routes } from './app.routes';
import { boardReducer } from './features/board/store/board.reducer';
import { BoardEffects } from './features/board/store/board.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),

    // ── NgRx Store ──────────────────────────────────────────────────────────
    // Register feature reducers at the root level.
    // Key 'boards' must match createFeatureSelector<BoardState>('boards')
    provideStore({ boards: boardReducer }),

    // ── NgRx Effects ────────────────────────────────────────────────────────
    provideEffects([BoardEffects]),

    // ── NgRx DevTools ───────────────────────────────────────────────────────
    // Only active in development mode (isDevMode() = false in production build)
    // maxAge: keep last 25 actions in the time-travel history
    // logOnly: in prod builds, only log (no time travel) for safety
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true, // Pause recording when DevTools panel is closed
      trace: false, // Enable for action stack traces (expensive)
      traceLimit: 75,
    }),
  ],
};
