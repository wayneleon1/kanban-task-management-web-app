import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: 'editor' | 'viewer';
}

export interface AuthResult {
  user: User;
  token: string;
}
