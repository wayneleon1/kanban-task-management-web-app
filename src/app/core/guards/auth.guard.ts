import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { filter, map, switchMap, take } from 'rxjs/operators';

import { selectAuthInitializing, selectIsAuthenticated } from '../../features/auth/store/auth.selectors';

/** Blocks unauthenticated access, waiting for the bootstrap session-restore check to finish first. */
export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthInitializing).pipe(
    filter((initializing) => !initializing),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated).pipe(take(1))),
    map((isAuthenticated) =>
      isAuthenticated ? true : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } }),
    ),
  );
};
