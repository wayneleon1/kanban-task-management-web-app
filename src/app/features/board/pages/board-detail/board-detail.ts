import { Component, computed, effect, inject, input } from '@angular/core';
import { BoardService } from '../../../../core/services/board.service';
import { BoardColumn } from '../../components/board-column/board-column';
import { Button } from "../../../../shared";

@Component({
  selector: 'app-board-detail',
  imports: [BoardColumn, Button],
  templateUrl: './board-detail.html',
  styleUrl: './board-detail.css',
})
export class BoardDetail {
  // ── Route param :id is auto-bound via withComponentInputBinding() ──
  id = input<string>('');

  boardService = inject(BoardService);

  // Derive the board reactively from the signal input
  board = computed(() => this.boardService.getBoardById(this.id()) ?? null);

  constructor() {
    // Keep BoardService in sync when the route param changes
    effect(() => {
      const currentId = this.id();
      if (currentId) {
        this.boardService.setActiveBoardId(currentId);
      }
    });
  }
}
