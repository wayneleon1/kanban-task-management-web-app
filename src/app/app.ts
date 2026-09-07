import { Component, effect, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Store } from '@ngrx/store';

import { Sidebar } from './layout/sidebar/sidebar';
import { Header } from './layout/header/header';
import { LayoutService } from './core/services/layout.service';
import { ModalService } from './core/services/modal.service';
import { ViewTask } from './features/board/components/view-task/view-task';
import { TaskForm } from './features/board/components/task-form/task-form';
import { BoardForm } from './features/board/components/board-form/board-form';
import { ColumnForm } from './features/board/components/column-form/column-form';
import { Collaborators } from './features/board/components/collaborators/collaborators';
import { ConfirmDelete } from './shared/components/confirm-delete/confirm-delete';
import { MobileBoardMenu } from './layout/mobile-board-menu/mobile-board-menu';
import { loadBoards } from './features/board/store/board.actions';
import {
  selectBoardsError,
  selectBoardsLoading,
  selectBoardsAreFresh,
} from './features/board/store/board.selectors';
import * as AuthActions from './features/auth/store/auth.actions';
import { selectIsAuthenticated } from './features/auth/store/auth.selectors';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Sidebar,
    Header,
    ViewTask,
    TaskForm,
    BoardForm,
    ColumnForm,
    Collaborators,
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

  isAuthenticated = this.store.selectSignal(selectIsAuthenticated);

  error = this.store.selectSignal(selectBoardsError);
  loading = this.store.selectSignal(selectBoardsLoading);

  // Reads freshness once synchronously at init — avoids redundant HTTP call
  // if the store is already populated (e.g. hot module reload, back navigation)
  private isFresh = this.store.selectSignal(selectBoardsAreFresh);

  // Boards require an authenticated request — load once a session exists,
  // covering both a fresh login and a restored session after page refresh.
  private loadBoardsOnceAuthenticated = effect(() => {
    if (this.isAuthenticated() && !this.isFresh()) {
      this.store.dispatch(loadBoards());
    }
  });

  ngOnInit(): void {
    this.store.dispatch(AuthActions.restoreSession());
  }
}
