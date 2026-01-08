export const EVENTS_EXCHANGE = 'events';

export const DEAD_LETTER_EXCHANGE = 'dlx.events';
export const RABBITMQ_EXCHANGE_TYPE = 'topic' as const;

export const DEFAULT_CONNECTION_TIMEOUT = 10000;

export const DEFAULT_PREFETCH_COUNT = 10;

export const RABBITMQ_CLIENT = Symbol('RABBITMQ_CLIENT');
export const RABBITMQ_MODULE_CLEANUP = Symbol('RABBITMQ_MODULE_CLEANUP');
