import { Component, ElementRef, inject, input, output, signal } from '@angular/core';
import { TaskCard } from '../task-card/task-card';
import { Column } from '../../../../core/models/board.model';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-board-column',
  imports: [TaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.css',
  host: { '(document:click)': 'onDocumentClick($event)' },
})
export class BoardColumn {
  private modalService = inject(ModalService);
  private el = inject(ElementRef);

  column = input.required<Column>();
  boardId = input.required<string>();
  isFirst = input<boolean>(false);
  isLast = input<boolean>(false);
  canEdit = input<boolean>(false);

  moveLeft = output<void>();
  moveRight = output<void>();

  menuOpen = signal(false);

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  openRename(): void {
    this.menuOpen.set(false);
    this.modalService.open('rename-column', { boardId: this.boardId(), columnId: this.column().id });
  }

  openDelete(): void {
    this.menuOpen.set(false);
    this.modalService.open('delete-column', { boardId: this.boardId(), columnId: this.column().id });
  }

  onDocumentClick(event: Event): void {
    const menuEl = this.el.nativeElement.querySelector('.column-header__menu');
    if (menuEl && !menuEl.contains(event.target as Node)) {
      this.menuOpen.set(false);
    }
  }
}
