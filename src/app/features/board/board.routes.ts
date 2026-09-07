import { Routes } from '@angular/router';
import { BoardDetail } from './pages/board-detail/board-detail';
import { BoardsHome } from './pages/boards-home/boards-home';
import { TaskFormPage } from './pages/task-form-page/task-form-page';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const BOARD_ROUTES: Routes = [
  // ── Redirects to the user's first board, or offers to create one ──
  {
    path: '',
    component: BoardsHome,
  },

  // ── Board detail view ──
  {
    path: ':id',
    component: BoardDetail,
  },

  // ── Add new task (Reactive Forms, guarded) ──
  {
    path: ':id/new-task',
    component: TaskFormPage,
    canDeactivate: [unsavedChangesGuard],
    title: 'Add New Task — Kanban',
  },

  // ── Edit existing task (Reactive Forms, guarded) ──
  {
    path: ':id/edit/:taskId',
    component: TaskFormPage,
    canDeactivate: [unsavedChangesGuard],
    title: 'Edit Task — Kanban',
  },
];
