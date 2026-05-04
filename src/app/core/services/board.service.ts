import { Injectable, signal, computed, effect } from '@angular/core';
import { Board, Task } from '../models/board.model';
import { generateId } from '../utils/id.utils';

const COLUMN_COLORS = ['#49C4E5', '#8471F2', '#67E2AE', '#E9A23B', '#F24E1E', '#935FC4', '#1ABCFE'];

const SEED_BOARDS: Board[] = [
  {
    id: 'platform-launch',
    name: 'Platform Launch',
    columns: [
      {
        id: 'col-todo',
        name: 'Todo',
        color: '#49C4E5',
        tasks: [
          {
            id: 't1',
            title: 'Build UI for onboarding flow',
            description: '',
            status: 'Todo',
            subtasks: [
              { id: 'st1-1', title: 'Sign up page', isCompleted: false },
              { id: 'st1-2', title: 'Sign in page', isCompleted: false },
              { id: 'st1-3', title: 'Welcome page', isCompleted: false },
            ],
          },
          {
            id: 't2',
            title: 'Build UI for search',
            description: '',
            status: 'Todo',
            subtasks: [{ id: 'st2-1', title: 'Search page', isCompleted: false }],
          },
          {
            id: 't3',
            title: 'Build settings UI',
            description: '',
            status: 'Todo',
            subtasks: [
              { id: 'st3-1', title: 'Account page', isCompleted: false },
              { id: 'st3-2', title: 'Billing page', isCompleted: false },
            ],
          },
          {
            id: 't4',
            title: 'QA and test all major user journeys',
            description: '',
            status: 'Todo',
            subtasks: [
              { id: 'st4-1', title: 'Internal QA', isCompleted: false },
              { id: 'st4-2', title: 'External UAT', isCompleted: false },
            ],
          },
        ],
      },
      {
        id: 'col-doing',
        name: 'Doing',
        color: '#8471F2',
        tasks: [
          {
            id: 't5',
            title: 'Design settings and search pages',
            description: '',
            status: 'Doing',
            subtasks: [
              { id: 'st5-1', title: 'Settings - Account', isCompleted: true },
              { id: 'st5-2', title: 'Settings - Billing', isCompleted: false },
              { id: 'st5-3', title: 'Search page', isCompleted: false },
            ],
          },
          {
            id: 't6',
            title: 'Add account management endpoints',
            description: '',
            status: 'Doing',
            subtasks: [
              { id: 'st6-1', title: 'Upgrade plan', isCompleted: true },
              { id: 'st6-2', title: 'Cancel plan', isCompleted: true },
              { id: 'st6-3', title: 'Update payment method', isCompleted: false },
            ],
          },
          {
            id: 't7',
            title: 'Design onboarding flow',
            description: '',
            status: 'Doing',
            subtasks: [
              { id: 'st7-1', title: 'Sign up page', isCompleted: true },
              { id: 'st7-2', title: 'Sign in page', isCompleted: false },
              { id: 'st7-3', title: 'Welcome page', isCompleted: false },
            ],
          },
          {
            id: 't8',
            title: 'Add search enpoints',
            description: '',
            status: 'Doing',
            subtasks: [
              { id: 'st8-1', title: 'Add search endpoint', isCompleted: true },
              { id: 'st8-2', title: 'Define search criteria', isCompleted: false },
            ],
          },
          {
            id: 't9',
            title: 'Add authentication endpoints',
            description: '',
            status: 'Doing',
            subtasks: [
              { id: 'st9-1', title: 'Define user model', isCompleted: true },
              { id: 'st9-2', title: 'Add auth endpoints', isCompleted: false },
            ],
          },
          {
            id: 't10',
            title:
              'Research pricing points of various competitors and trial different business models',
            description:
              "We know what we're planning to build for version one. Now we need to finalise the first pricing model we'll use. Keep iterating the subtasks until we have a coherent proposition.",
            status: 'Doing',
            subtasks: [
              {
                id: 'st10-1',
                title: 'Research competitor pricing and business models',
                isCompleted: true,
              },
              {
                id: 'st10-2',
                title: 'Outline a business model that works for our solution',
                isCompleted: true,
              },
              {
                id: 'st10-3',
                title:
                  'Talk to potential customers about our proposed solution and ask for fair price expectancy',
                isCompleted: false,
              },
            ],
          },
        ],
      },
      {
        id: 'col-done',
        name: 'Done',
        color: '#67E2AE',
        tasks: [
          {
            id: 't11',
            title: 'Conduct 5 wireframe tests',
            description: '',
            status: 'Done',
            subtasks: [{ id: 'st11-1', title: 'Complete 5 wireframe tests', isCompleted: true }],
          },
          {
            id: 't12',
            title: 'Create wireframe prototype',
            description: '',
            status: 'Done',
            subtasks: [{ id: 'st12-1', title: 'Create clickable wireframe', isCompleted: true }],
          },
          {
            id: 't13',
            title: 'Review results of usability tests and iterate',
            description: '',
            status: 'Done',
            subtasks: [
              { id: 'st13-1', title: 'Meet to review results', isCompleted: true },
              { id: 'st13-2', title: 'Discuss feedback as a team', isCompleted: true },
              { id: 'st13-3', title: 'Iterate on designs', isCompleted: true },
            ],
          },
          {
            id: 't14',
            title:
              'Create paper prototypes and conduct 10 usability tests with potential customers',
            description: '',
            status: 'Done',
            subtasks: [
              { id: 'st14-1', title: 'Create paper prototypes for version one', isCompleted: true },
              { id: 'st14-2', title: 'Complete 10 usability tests', isCompleted: true },
            ],
          },
          {
            id: 't15',
            title: 'Market discovery',
            description: '',
            status: 'Done',
            subtasks: [{ id: 'st15-1', title: 'Interview 10 customers', isCompleted: true }],
          },
          {
            id: 't16',
            title: 'Competitor analysis',
            description: '',
            status: 'Done',
            subtasks: [
              { id: 'st16-1', title: 'Find direct competitors', isCompleted: true },
              { id: 'st16-2', title: 'SWOT analysis for each competitor', isCompleted: true },
            ],
          },
          {
            id: 't17',
            title: 'Research the market',
            description: '',
            status: 'Done',
            subtasks: [
              { id: 'st17-1', title: 'Google specific market', isCompleted: true },
              { id: 'st17-2', title: 'Write up research', isCompleted: true },
            ],
          },
        ],
      },
    ],
  },
  { id: 'marketing-plan', name: 'Marketing Plan', columns: [] },
  { id: 'roadmap', name: 'Roadmap', columns: [] },
];

@Injectable({ providedIn: 'root' })
export class BoardService {
  private readonly STORAGE_KEY = 'kanban-boards';

  boards = signal<Board[]>(this.loadBoards());
  activeBoardId = signal<string>('');
  activeBoard = computed(() => this.boards().find((b) => b.id === this.activeBoardId()) ?? null);

  constructor() {
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.boards()));
    });
  }

  // ── Queries ─────────────────────────────────────────────────────────────

  getBoardById(id: string): Board | undefined {
    return this.boards().find((b) => b.id === id);
  }

  setActiveBoardId(id: string): void {
    this.activeBoardId.set(id);
  }

  findTask(taskId: string): { task: Task; boardId: string } | undefined {
    for (const board of this.boards()) {
      for (const col of board.columns) {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) return { task, boardId: board.id };
      }
    }
    return undefined;
  }

  // ── Task CRUD ────────────────────────────────────────────────────────────

  addTask(boardId: string, taskData: Omit<Task, 'id'>): void {
    const newTask: Task = { ...taskData, id: generateId() };
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((col) =>
            col.name === newTask.status ? { ...col, tasks: [...col.tasks, newTask] } : col,
          ),
        };
      }),
    );
  }

  updateTask(boardId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>): void {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;

        let current: Task | undefined;
        for (const col of board.columns) {
          const found = col.tasks.find((t) => t.id === taskId);
          if (found) {
            current = found;
            break;
          }
        }
        if (!current) return board;

        const updated: Task = { ...current, ...updates };

        return {
          ...board,
          columns: board.columns.map((col) => {
            const without = col.tasks.filter((t) => t.id !== taskId);
            return col.name === updated.status
              ? { ...col, tasks: [...without, updated] }
              : { ...col, tasks: without };
          }),
        };
      }),
    );
  }

  deleteTask(boardId: string, taskId: string): void {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((col) => ({
            ...col,
            tasks: col.tasks.filter((t) => t.id !== taskId),
          })),
        };
      }),
    );
  }

  toggleSubtask(boardId: string, taskId: string, subtaskId: string): void {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;
        return {
          ...board,
          columns: board.columns.map((col) => ({
            ...col,
            tasks: col.tasks.map((task) => {
              if (task.id !== taskId) return task;
              return {
                ...task,
                subtasks: task.subtasks.map((st) =>
                  st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st,
                ),
              };
            }),
          })),
        };
      }),
    );
  }

  // ── Board CRUD ───────────────────────────────────────────────────────────

  addBoard(name: string, columnNames: string[]): Board {
    const newBoard: Board = {
      id: name.toLowerCase().replace(/\s+/g, '-') + '-' + generateId().slice(0, 4),
      name,
      columns: columnNames
        .filter((n) => n.trim())
        .map((colName, i) => ({
          id: generateId(),
          name: colName.trim(),
          color: COLUMN_COLORS[i % COLUMN_COLORS.length],
          tasks: [],
        })),
    };
    this.boards.update((b) => [...b, newBoard]);
    return newBoard;
  }

  updateBoard(boardId: string, name: string, columnNames: string[]): void {
    this.boards.update((boards) =>
      boards.map((board) => {
        if (board.id !== boardId) return board;
        const columns = columnNames
          .filter((n) => n.trim())
          .map((colName, i) => {
            const existing = board.columns.find((c) => c.name === colName.trim());
            return (
              existing ?? {
                id: generateId(),
                name: colName.trim(),
                color: COLUMN_COLORS[i % COLUMN_COLORS.length],
                tasks: [],
              }
            );
          });
        return { ...board, name, columns };
      }),
    );
  }

  deleteBoard(boardId: string): void {
    this.boards.update((b) => b.filter((board) => board.id !== boardId));
    if (this.activeBoardId() === boardId) {
      this.activeBoardId.set(this.boards()[0]?.id ?? '');
    }
  }

  private loadBoards(): Board[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Board[];
    } catch {
      /* fall through */
    }
    return SEED_BOARDS;
  }
}
