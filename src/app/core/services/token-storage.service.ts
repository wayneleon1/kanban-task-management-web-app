import { Injectable } from '@angular/core';

const STORAGE_KEY = 'kanban-auth-token';

@Injectable({ providedIn: 'root' })
export class TokenStorageService {
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(STORAGE_KEY, token);
  }

  clearToken(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
