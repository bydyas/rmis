export const Role = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type TRole = (typeof Role)[keyof typeof Role];
