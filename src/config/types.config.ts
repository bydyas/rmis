export const Environment = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
} as const;

export type TEnvironment = (typeof Environment)[keyof typeof Environment];
