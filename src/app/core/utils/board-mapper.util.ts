import { Board, Column, Subtask, Task } from '../models/board.model';

export interface SubtaskDto {
  _id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskDto {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate?: string | null;
  subtasks?: SubtaskDto[];
}

export interface ColumnDto {
  _id: string;
  name: string;
  color: string;
  tasks?: TaskDto[];
}

export interface BoardDto {
  _id: string;
  name: string;
  columns?: ColumnDto[];
}

export function mapSubtask(dto: SubtaskDto): Subtask {
  return { id: dto._id, title: dto.title, isCompleted: dto.isCompleted };
}

export function mapTask(dto: TaskDto): Task {
  return {
    id: dto._id,
    title: dto.title,
    description: dto.description,
    status: dto.status,
    // Backend stores a full ISO datetime; the date <input> and existing validators expect yyyy-MM-dd.
    dueDate: dto.dueDate ? dto.dueDate.slice(0, 10) : undefined,
    subtasks: (dto.subtasks ?? []).map(mapSubtask),
  };
}

export function mapColumn(dto: ColumnDto): Column {
  return {
    id: dto._id,
    name: dto.name,
    color: dto.color,
    tasks: (dto.tasks ?? []).map(mapTask),
  };
}

export function mapBoard(dto: BoardDto): Board {
  return {
    id: dto._id,
    name: dto.name,
    columns: (dto.columns ?? []).map(mapColumn),
  };
}
