import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BoardService } from '../../core/services/board.service';
import { LayoutService } from '../../core/services/layout.service';
import { ThemeService } from '../../core/services/theme.service';
import { ModalService } from '../../core/services/modal.service';

@Component({
  selector: 'app-mobile-board-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mobile-board-menu.html',
  styleUrl: './mobile-board-menu.css',
})
export class MobileBoardMenu {
  boardService = inject(BoardService);
  layoutService = inject(LayoutService);
  themeService = inject(ThemeService);
  modalService = inject(ModalService);

  onBoardSelect(): void {
    this.layoutService.closeMobileBoardMenu();
  }

  onCreateBoard(): void {
    this.layoutService.closeMobileBoardMenu();
    this.modalService.open('add-board');
  }
}
