import { Injectable, signal, computed, effect } from '@angular/core';
import { Board } from '../models/board.model';

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
            description: '',
            status: 'Doing',
            subtasks: [
              { id: 'st10-1', title: 'Research competitor pricing', isCompleted: true },
              { id: 'st10-2', title: 'Outline business models', isCompleted: false },
              { id: 'st10-3', title: 'Trial business model', isCompleted: false },
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

  // ── Active board driven by the router (set by BoardDetailComponent) ──
  activeBoardId = signal<string>('');

  activeBoard = computed(() => this.boards().find((b) => b.id === this.activeBoardId()) ?? null);

  constructor() {
    // Auto-persist whenever boards change
    effect(() => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.boards()));
    });
  }

  getBoardById(id: string): Board | undefined {
    return this.boards().find((b) => b.id === id);
  }

  setActiveBoardId(id: string): void {
    this.activeBoardId.set(id);
  }

  // ── Helpers (more CRUD methods added later) ──
  getCompletedSubtasks(taskId: string): number {
    for (const board of this.boards()) {
      for (const col of board.columns) {
        const task = col.tasks.find((t) => t.id === taskId);
        if (task) return task.subtasks.filter((s) => s.isCompleted).length;
      }
    }
    return 0;
  }

  private loadBoards(): Board[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Board[];
    } catch {
      // corrupted storage — fall through to seed
    }
    return SEED_BOARDS;
  }
}
