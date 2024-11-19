'server-only';

import { genSaltSync, hashSync } from 'bcrypt-ts';
import { and, asc, desc, eq, gt } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { dataset, search, user, User } from './schema';
import { ImageRow } from '@/lib/weaviate/types';

// Optionally, if not using email/pass login, you can
// use the Drizzle adapter for Auth.js / NextAuth
// https://authjs.dev/reference/adapter/drizzle
const client = postgres(`${process.env.POSTGRES_URL!}`);
const db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error('Failed to get user from database');
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error('Failed to create user in database');
    throw error;
  }
}

export async function saveSearch({
  id,
  userId,
  title,
}: {
  id: string;
  userId: string;
  title: string;
}) {
  try {
    return await db.insert(search).values({
      id,
      createdAt: new Date(),
      userId,
      title,
    });
  } catch (error) {
    console.error('Failed to save search in database');
    throw error;
  }
}

export async function deleteSearchById({ id }: { id: string }) {
  try {
    await db.delete(dataset).where(eq(dataset.searchId, id));
    return await db.delete(search).where(eq(search.id, id));
  } catch (error) {
    console.error('Failed to delete search by id from database');
    throw error;
  }
}

export async function getSearchesByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(search)
      .where(eq(search.userId, id))
      .orderBy(desc(search.createdAt));
  } catch (error) {
    console.error('Failed to get searches by user from database');
    throw error;
  }
}

export async function getSearchById({ id }: { id: string }) {
  try {
    const [selectedSearch] = await db.select().from(search).where(eq(search.id, id));
    return selectedSearch;
  } catch (error) {
    console.error('Failed to get search by id from database');
    throw error;
  }
}

export async function getDatasetsBySearchId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(dataset)
      .where(eq(dataset.searchId, id))
      .orderBy(asc(dataset.createdAt));
  } catch (error) {
    console.error('Failed to get datasets by search id from database', error);
    throw error;
  }
}

export async function saveDataset({
  id,
  query,
  databaseQuery,
  maxDistance,
  resultLimit,
  resultsCount,
  results,
  userId,
  searchId,
}: {
  id: string;
  query: string;
  databaseQuery: string;
  maxDistance: number;
  resultLimit: number;
  resultsCount: number;
  results: ImageRow[];
  userId: string;
  searchId: string;
}) {
  try {
    return await db.insert(dataset).values({
      id,
      query,
      databaseQuery,
      maxDistance: maxDistance.toString(),
      resultLimit,
      resultsCount,
      results,
      userId,
      searchId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Failed to save dataset in database');
    throw error;
  }
}

export async function updateDataset({
  id,
  query,
  databaseQuery,
  maxDistance,
  resultLimit,
  resultsCount,
  results,
  userId,
  searchId,
}: {
  id: string;
  query: string;
  databaseQuery: string;
  maxDistance: number;
  resultLimit: number;
  resultsCount: number;
  results: ImageRow[];
  userId: string;
  searchId: string;
}) {
  try {
    return await db
      .update(dataset)
      .set({
        query,
        databaseQuery,
        maxDistance: maxDistance.toString(),
        resultLimit,
        resultsCount,
        results,
        userId,
        searchId,
        updatedAt: new Date(),
      })
      .where(eq(dataset.id, id));
  } catch (error) {
    console.error('Failed to update dataset');
    throw error;
  }
}

export async function getDatasetById({ id }: { id: string }) {
  try {
    const [selectedDataset] = await db
      .select()
      .from(dataset)
      .where(eq(dataset.id, id))
      .orderBy(desc(dataset.createdAt));

    return selectedDataset;
  } catch (error) {
    console.error('Failed to get dataset by id from database');
    throw error;
  }
}

export async function deleteDatasetsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    return await db
      .delete(dataset)
      .where(and(eq(dataset.id, id), gt(dataset.createdAt, timestamp)));
  } catch (error) {
    console.error('Failed to delete datasets by id after timestamp from database');
    throw error;
  }
}
