import { Routes } from '@angular/router';
import { NotFound } from './features/not-found/not-found';

export const routes: Routes = [
  // Default redirect to first board
  {
    path: '',
    redirectTo: 'boards/platform-launch',
    pathMatch: 'full',
  },
  // Board feature — lazy loaded
  {
    path: 'boards',
    loadChildren: () => import('./features/board/board.routes').then((m) => m.BOARD_ROUTES),
  },
  // 404 fallback
  {
    path: '**',
    component: NotFound,
  },
];
