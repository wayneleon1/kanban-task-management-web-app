import { Routes } from '@angular/router';
import { BoardDetail } from './pages/board-detail/board-detail';
import { TaskFormPage } from './pages/task-form-page/task-form-page';
import { unsavedChangesGuard } from '../../core/guards/unsaved-changes.guard';

export const BOARD_ROUTES: Routes = [
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
