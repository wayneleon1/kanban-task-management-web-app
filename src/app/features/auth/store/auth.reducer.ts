import { createReducer, on } from '@ngrx/store';
import * as AuthActions from './auth.actions';
import { initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.register, AuthActions.login, (state) => ({ ...state, loading: true, error: null })),

  on(AuthActions.registerSuccess, AuthActions.loginSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    loading: false,
    error: null,
  })),

  on(AuthActions.registerFailure, AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(AuthActions.logout, () => ({ ...initialAuthState, initializing: false })),

  on(AuthActions.restoreSessionSuccess, (state, { user, token }) => ({
    ...state,
    user,
    token,
    initializing: false,
  })),

  on(AuthActions.restoreSessionFailure, (state) => ({
    ...state,
    user: null,
    token: null,
    initializing: false,
  })),
);
