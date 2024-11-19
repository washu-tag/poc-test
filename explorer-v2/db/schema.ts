import { ImageRow } from '@/lib/weaviate/types';
import { InferSelectModel } from 'drizzle-orm';
import {
  pgTable,
  varchar,
  timestamp,
  uuid,
  text,
  jsonb,
  integer,
  decimal,
} from 'drizzle-orm/pg-core';

export const user = pgTable('User', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  email: varchar('email', { length: 64 }).notNull(),
  password: varchar('password', { length: 64 }),
});

export type User = InferSelectModel<typeof user>;

export const search = pgTable('Search', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
});

export type Search = InferSelectModel<typeof search>;

export const dataset = pgTable('Dataset', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  query: text('query'),
  databaseQuery: text('databaseQuery'),
  maxDistance: decimal('maxDistance'),
  resultLimit: integer('resultLimit'),
  resultsCount: integer('resultsCount'),
  results: jsonb('results').$type<ImageRow[]>(),
  charts: text('charts'),
  summary: text('summary'),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id),
  searchId: uuid('searchId')
    .notNull()
    .references(() => search.id),
});

export type Dataset = InferSelectModel<typeof dataset>;
