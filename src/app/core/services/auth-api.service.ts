import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResult, LoginRequest, RegisterRequest } from '../models/auth.model';
import { User } from '../models/user.model';
import { extractErrorMessage } from '../utils/http-error.util';

interface ApiEnvelope<T> {
  status: 'success' | 'error';
  data: T;
}

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  register(request: RegisterRequest): Observable<AuthResult> {
    return this.http.post<ApiEnvelope<AuthResult>>(`${this.base}/auth/register`, request).pipe(
      map((res) => res.data),
      catchError((err) => throwError(() => new Error(extractErrorMessage(err)))),
    );
  }

  login(request: LoginRequest): Observable<AuthResult> {
    return this.http.post<ApiEnvelope<AuthResult>>(`${this.base}/auth/login`, request).pipe(
      map((res) => res.data),
      catchError((err) => throwError(() => new Error(extractErrorMessage(err)))),
    );
  }

  me(): Observable<User> {
    return this.http.get<ApiEnvelope<{ user: User }>>(`${this.base}/auth/me`).pipe(
      map((res) => res.data.user),
      catchError((err) => throwError(() => new Error(extractErrorMessage(err)))),
    );
  }

  updateThemePreference(themePreference: 'light' | 'dark'): Observable<User> {
    return this.http
      .patch<ApiEnvelope<{ user: User }>>(`${this.base}/auth/me`, { themePreference })
      .pipe(
        map((res) => res.data.user),
        catchError((err) => throwError(() => new Error(extractErrorMessage(err)))),
      );
  }
}
