import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { selectAuthInitializing, selectIsAuthenticated } from '../../features/auth/store/auth.selectors';

/** Keeps an already-authenticated user off /login and /register. */
export const guestGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthInitializing).pipe(
    filter((initializing) => !initializing),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated).pipe(take(1))),
    map((isAuthenticated) => (isAuthenticated ? router.createUrlTree(['/boards']) : true)),
  );
};
