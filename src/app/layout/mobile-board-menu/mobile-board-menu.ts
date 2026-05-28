import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Store } from '@ngrx/store';

import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { ModalService } from '../../core/services/modal.service';
import { selectAllBoards } from '../../features/board/store/board.selectors';

@Component({
  selector: 'app-mobile-board-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-board-menu.html',
  styleUrl: './mobile-board-menu.css',
})
export class MobileBoardMenu {
  private store = inject(Store);
  layoutService = inject(LayoutService);
  themeService = inject(ThemeService);
  modalService = inject(ModalService);

  boards = this.store.selectSignal(selectAllBoards);

  onBoardSelect(): void {
    this.layoutService.closeMobileBoardMenu();
  }
  onCreateBoard(): void {
    this.layoutService.closeMobileBoardMenu();
    this.modalService.open('add-board');
  }
}
