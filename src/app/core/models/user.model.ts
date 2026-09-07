export type Role = 'admin' | 'editor' | 'viewer';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  themePreference: 'light' | 'dark';
}
