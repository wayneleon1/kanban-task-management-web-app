import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { LayoutService } from './core/services/layout.service';
import { ModalService } from './core/services/modal.service';
import { ViewTask } from './features/board/components/view-task/view-task';
import { TaskForm } from './features/board/components/task-form/task-form';
import { BoardForm } from './features/board/components/board-form/board-form';
import { ConfirmDelete } from './shared/components/confirm-delete/confirm-delete';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header, ViewTask, TaskForm, BoardForm, ConfirmDelete],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  layoutService = inject(LayoutService);
  modalService = inject(ModalService);
}
