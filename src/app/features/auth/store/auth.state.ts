import { User } from '../../../core/models/user.model';

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  // True until the initial session-restore check (validating any stored token) completes.
  // Guards wait on this so a refresh doesn't briefly redirect a logged-in user to /login.
  initializing: boolean;
}

export const initialAuthState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  initializing: true,
};
