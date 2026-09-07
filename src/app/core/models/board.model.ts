export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface BoardMember {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  dueDate?: string;
  subtasks: Subtask[];
  assignedTo?: BoardMember;
}

export interface Column {
  id: string;
  name: string;
  color: string;
  tasks: Task[];
}

export interface Collaborator {
  user: BoardMember;
  role: 'viewer' | 'editor';
}

export interface Board {
  id: string;
  name: string;
  columns: Column[];
  owner?: BoardMember;
  collaborators?: Collaborator[];
}
