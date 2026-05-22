import { ApplicationConfig, isDevMode } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { boardReducer } from './features/board/store/board.reducer';
import { BoardEffects } from './features/board/store/board.effects';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),

    // ── HTTP Client ─────────────────────────────────────────────────────────
    provideHttpClient(withInterceptorsFromDi()),

    // ── NgRx Store ──────────────────────────────────────────────────────────
    provideStore({ boards: boardReducer }),

    // ── NgRx Effects ────────────────────────────────────────────────────────
    provideEffects([BoardEffects]),

    // ── NgRx DevTools ───────────────────────────────────────────────────────
    provideStoreDevtools({
      maxAge: 25,
      logOnly: !isDevMode(),
      autoPause: true,
      trace: false,
      traceLimit: 75,
    }),
  ],
};
