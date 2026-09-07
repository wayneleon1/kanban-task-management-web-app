import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';

import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { ModalService } from '../../core/services/modal.service';
import { AuthApiService } from '../../core/services/auth-api.service';
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
  private authApi = inject(AuthApiService);
  layoutService = inject(LayoutService);
  themeService = inject(ThemeService);
  modalService = inject(ModalService);

  boards = this.store.selectSignal(selectAllBoards);
  currentUser = this.store.selectSignal(selectCurrentUser);

  // A global viewer can never own a board — only be invited as a collaborator
  get canCreateBoard(): boolean {
    return this.currentUser()?.role !== 'viewer';
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.authApi.updateThemePreference(this.themeService.theme()).subscribe({
      error: (err: Error) => console.error('[Sidebar] Failed to persist theme preference', err),
    });
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
