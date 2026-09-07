# Kanban Task Management

Angular 21 (standalone components, signals) + NgRx frontend for a full-stack Kanban board app, backed by the [Node/Express/MongoDB API](../Backend-Kanban-Task-Management).

## Features

- Email/password auth (register/login/logout), with role-based access: `admin` / `editor` / `viewer`
- Boards, columns, and tasks with full CRUD, persisted server-side
- Column reordering (move left/right) and task drag-free reordering within a column
- Subtasks, due dates, and task assignment to board collaborators
- Board collaboration: invite by email, per-board `viewer`/`editor` roles, owner-only management
- Permission-aware UI — viewers get a read-only view app-wide; the backend enforces the same rules independently
- Per-board activity log (board/column/task lifecycle events)
- Light/dark theme, persisted to the user's account and synced across sessions/devices
- Responsive layout (desktop sidebar + mobile board-switcher menu)

## Tech stack

- Angular 21 — standalone components, signals, new `@if`/`@for`/`@switch` control flow
- NgRx (Store, Effects, Entity) for the `boards` and `auth` feature state
- Angular Reactive Forms for task/task-edit; template-driven forms elsewhere
- Vitest (via Angular's built-in unit-test builder) for unit tests
- Plain CSS with design-token custom properties (no CSS framework)

## Getting started

Requires the [backend](../Backend-Kanban-Task-Management) running first (see its README for setup) — this app has no working mock/offline mode; all data is real API calls.

```bash
npm install
npm start          # ng serve — http://localhost:4200
```

`src/environments/environment.ts` points at `http://localhost:4000/api` by default. Change `apiUrl` there (and in `environment.production.ts` for prod builds) to match wherever the backend is actually running.

## Scripts

| Script | Description |
| --- | --- |
| `npm start` | `ng serve` — dev server with live reload |
| `npm run build` | Production build to `dist/` |
| `npm test` | Run the Vitest unit test suite |
| `npm run watch` | Development build in watch mode |

## Project structure

```
src/app/
  core/
    guards/         authGuard, guestGuard, unsavedChangesGuard
    interceptors/   AuthInterceptor (attaches the JWT)
    models/         Board/Column/Task/Subtask/User/Activity, and the backend DTO↔model mappers
    services/       ApiService, AuthApiService, TokenStorageService, ThemeService, ModalService, LayoutService
    utils/          board-permission (client-side mirror of the backend's permission logic), date formatting
    validators/     custom reactive-form validators (unique title, future date)
  features/
    auth/           login/register pages + the `auth` NgRx feature (state/actions/reducer/effects/selectors)
    board/          board/column/task/collaborator/activity components, pages, and the `boards` NgRx feature
    not-found/
  layout/           Sidebar, Header, MobileBoardMenu
  shared/components/ Button, Input, Dropdown, Checkbox, Modal, ConfirmDelete
```

## Authentication & permissions

- A JWT from the backend is kept in `localStorage` and attached to every request by `AuthInterceptor`; `authGuard` blocks the `/boards` routes until a session is confirmed valid (including on page refresh, via a one-time `/auth/me` call at bootstrap), `guestGuard` keeps a logged-in user off `/login`/`/register`.
- `src/app/core/utils/board-permission.util.ts` resolves a `viewer`/`editor`/`owner` permission for the current user on a given board (admin bypass, then owner/collaborator lookup) — used throughout the UI to hide/disable actions a viewer can't perform. **This is a UX convenience only** — the backend independently enforces the same rules and is the actual source of truth; never rely on the frontend gate alone.

## Testing

```bash
npm test
```

Runs the existing component/service unit tests via Vitest. UI features added end-to-end (auth flow, board/column/task CRUD, collaboration, permission gating, activity log, theme sync) were verified by driving the running app in a real browser rather than through these unit tests — see the backend's Jest/Supertest suite for API-level coverage.

## Deployment notes

- Set `environment.production.ts`'s `apiUrl` to the deployed backend's origin before building.
- `npm run build` outputs a static bundle in `dist/` — deploy it to any static host; make sure the backend's `CLIENT_URL` (CORS) matches wherever this ends up served from.
