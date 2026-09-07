import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

import { AuthApiService } from '../../../core/services/auth-api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TokenStorageService } from '../../../core/services/token-storage.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private router = inject(Router);
  private authApi = inject(AuthApiService);
  private tokenStorage = inject(TokenStorageService);
  private themeService = inject(ThemeService);

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      switchMap(({ request }) =>
        this.authApi.register(request).pipe(
          map(({ user, token }) => AuthActions.registerSuccess({ user, token })),
          catchError((err: Error) => of(AuthActions.registerFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      switchMap(({ request }) =>
        this.authApi.login(request).pipe(
          map(({ user, token }) => AuthActions.loginSuccess({ user, token })),
          catchError((err: Error) => of(AuthActions.loginFailure({ error: err.message }))),
        ),
      ),
    ),
  );

  persistTokenOnAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess, AuthActions.loginSuccess),
        tap(({ token }) => this.tokenStorage.setToken(token)),
      ),
    { dispatch: false },
  );

  // Applies the account's saved theme whenever a session is established —
  // covers fresh login/register and a restored session after page refresh.
  applyThemeOnAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          AuthActions.registerSuccess,
          AuthActions.loginSuccess,
          AuthActions.restoreSessionSuccess,
        ),
        tap(({ user }) => this.themeService.setTheme(user.themePreference)),
      ),
    { dispatch: false },
  );

  navigateAfterAuthSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess, AuthActions.loginSuccess),
        tap(() => {
          const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
          this.router.navigateByUrl(returnUrl || '/boards');
        }),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.tokenStorage.clearToken();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );

  restoreSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.restoreSession),
      switchMap(() => {
        const token = this.tokenStorage.getToken();
        if (!token) {
          return of(AuthActions.restoreSessionFailure());
        }

        return this.authApi.me().pipe(
          map((user) => AuthActions.restoreSessionSuccess({ user, token })),
          catchError(() => {
            this.tokenStorage.clearToken();
            return of(AuthActions.restoreSessionFailure());
          }),
        );
      }),
    ),
  );
}
