export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const REDIS_MODULE_CLEANUP = Symbol('REDIS_MODULE_CLEANUP');

export const REDIS_MODE = {
  SINGLE: 'single',
  CLUSTER: 'cluster',
} as const;

export const DEFAULT_REDIS_PORT = 6379;

export const DEFAULT_MAX_RETRIES = 10;
export const DEFAULT_MAX_DELAY_MS = 3000;
export const DEFAULT_MAX_RETRIES_PER_REQUEST = 3;
