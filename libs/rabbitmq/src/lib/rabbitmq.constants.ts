export const EVENTS_EXCHANGE = 'events';
export const RABBITMQ_EXCHANGE_TYPE = 'topic' as const;

export const RABBITMQ_CLIENT = Symbol('RABBITMQ_CLIENT');
export const RABBITMQ_MODULE_CLEANUP = Symbol('RABBITMQ_MODULE_CLEANUP');
