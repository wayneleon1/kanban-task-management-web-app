import { Component, inject } from '@angular/core';
import { BoardService } from '../../core/services/board.service';
import { LayoutService } from '../../core/services/layout.service';
import { Button } from "../../shared";

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Button],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  boardService = inject(BoardService);
  layoutService = inject(LayoutService);

  get hasColumns(): boolean {
    return (this.boardService.activeBoard()?.columns.length ?? 0) > 0;
  }
}
