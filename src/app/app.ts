import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { LayoutService } from './core/services/layout.service';
import { ModalService } from './core/services/modal.service';
import { ViewTask } from './features/board/components/view-task/view-task';
import { TaskForm } from './features/board/components/task-form/task-form';
import { BoardForm } from './features/board/components/board-form/board-form';
import { ConfirmDelete } from './shared/components/confirm-delete/confirm-delete';
import { MobileBoardMenu } from './layout/mobile-board-menu/mobile-board-menu';
import { loadBoards } from './features/board/store/board.actions';
import { selectBoardsError, selectBoardsLoading } from './features/board/store/board.selectors';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Sidebar,
    Header,
    ViewTask,
    TaskForm,
    BoardForm,
    ConfirmDelete,
    MobileBoardMenu,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private store = inject(Store);

  layoutService = inject(LayoutService);
  modalService = inject(ModalService);

  // Exposed to the template for the global error toast
  error = this.store.selectSignal(selectBoardsError);
  loading = this.store.selectSignal(selectBoardsLoading);

  ngOnInit(): void {
    // Kick off the data pipeline: loadBoards → Effect → GET /boards → loadBoardsSuccess
    this.store.dispatch(loadBoards());
  }
}
