import { createAction, props } from '@ngrx/store';
import { LoginRequest, RegisterRequest } from '../../../core/models/auth.model';
import { User } from '../../../core/models/user.model';

export const register = createAction('[Auth] Register', props<{ request: RegisterRequest }>());
export const registerSuccess = createAction(
  '[Auth] Register Success',
  props<{ user: User; token: string }>(),
);
export const registerFailure = createAction('[Auth] Register Failure', props<{ error: string }>());

export const login = createAction('[Auth] Login', props<{ request: LoginRequest }>());
export const loginSuccess = createAction(
  '[Auth] Login Success',
  props<{ user: User; token: string }>(),
);
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');

// Dispatched once at app bootstrap to validate any token already in storage.
export const restoreSession = createAction('[Auth] Restore Session');
export const restoreSessionSuccess = createAction(
  '[Auth] Restore Session Success',
  props<{ user: User; token: string }>(),
);
export const restoreSessionFailure = createAction('[Auth] Restore Session Failure');
