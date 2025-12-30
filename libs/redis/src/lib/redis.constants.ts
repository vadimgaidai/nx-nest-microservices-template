export const REDIS_CLIENT = Symbol('REDIS_CLIENT');

export const REDIS_MODULE_CLEANUP = Symbol('REDIS_MODULE_CLEANUP');

export const REDIS_MODE = {
  SINGLE: 'single',
  CLUSTER: 'cluster',
} as const;

export const REDIS_KEYS = {
  SESSION: 'session:',
  CACHE: 'cache:',
  RATE_LIMIT: 'ratelimit:',
  LOCK: 'lock:',
} as const;
