import { Component, input } from '@angular/core';
import { TaskCard } from '../task-card/task-card';
import { Column } from '../../../../core/models/board.model';

@Component({
  selector: 'app-board-column',
  imports: [TaskCard],
  templateUrl: './board-column.html',
  styleUrl: './board-column.css',
})
export class BoardColumn {
  column = input.required<Column>();
}
