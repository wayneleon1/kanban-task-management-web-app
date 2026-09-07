import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';

import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { ModalService } from '../../core/services/modal.service';
import { selectAllBoards } from '../../features/board/store/board.selectors';
import * as AuthActions from '../../features/auth/store/auth.actions';
import { selectCurrentUser } from '../../features/auth/store/auth.selectors';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private store = inject(Store);
  layoutService = inject(LayoutService);
  themeService = inject(ThemeService);
  modalService = inject(ModalService);

  boards = this.store.selectSignal(selectAllBoards);
  currentUser = this.store.selectSignal(selectCurrentUser);

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
