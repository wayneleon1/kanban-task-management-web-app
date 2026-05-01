import { Routes } from '@angular/router';
import { BoardDetail } from './pages/board-detail/board-detail';

export const BOARD_ROUTES: Routes = [
  // /boards/:id  →  BoardDetailComponent
  // The :id param is auto-bound to the component's input() via withComponentInputBinding
  {
    path: ':id',
    component: BoardDetail,
  },
];
