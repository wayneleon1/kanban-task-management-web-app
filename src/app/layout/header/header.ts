import { Component, inject, signal, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { BoardService } from '../../core/services/board.service';
import { LayoutService } from '../../core/services/layout.service';
import { ModalService } from '../../core/services/modal.service';
import { Button } from '../../shared/components/button/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [Button],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class Header {
  boardService = inject(BoardService);
  layoutService = inject(LayoutService);
  modalService = inject(ModalService);
  private router = inject(Router);
  private el = inject(ElementRef);

  boardMenuOpen = signal(false);

  get hasColumns(): boolean {
    return (this.boardService.activeBoard()?.columns.length ?? 0) > 0;
  }

  // ── Navigate to route-based task form ──
  openAddTask(): void {
    const boardId = this.boardService.activeBoardId();
    this.router.navigate(['/boards', boardId, 'new-task']);
  }

  openEditBoard(): void {
    this.boardMenuOpen.set(false);
    this.modalService.open('edit-board', { boardId: this.boardService.activeBoardId() });
  }

  openDeleteBoard(): void {
    this.boardMenuOpen.set(false);
    this.modalService.open('delete-board', { boardId: this.boardService.activeBoardId() });
  }

  onDocumentClick(event: Event): void {
    const menuEl = this.el.nativeElement.querySelector('.header__board-menu');
    if (menuEl && !menuEl.contains(event.target as Node)) {
      this.boardMenuOpen.set(false);
    }
  }
}
