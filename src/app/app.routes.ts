import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  // Default redirect to first board
  {
    path: '',
    redirectTo: 'boards/platform-launch',
    pathMatch: 'full',
  },
  // Auth — public, but redirects an already-authenticated user away
  {
    path: 'login',
    loadComponent: () => import('./features/auth/pages/login/login').then((m) => m.Login),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/pages/register/register').then((m) => m.Register),
    canActivate: [guestGuard],
  },
  // Board feature — lazy loaded, requires authentication
  {
    path: 'boards',
    canActivate: [authGuard],
    loadChildren: () => import('./features/board/board.routes').then((m) => m.BOARD_ROUTES),
  },
  // 404 fallback
  {
    path: '**',
    component: NotFound,
  },
];
