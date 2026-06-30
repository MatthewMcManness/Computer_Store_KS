// src/lib/db.ts: single Postgres connection pool for the app.
import { Pool, type PoolClient, type QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __csksPool: Pool | undefined;
}

function getPool(): Pool | null {
  if (!connectionString) return null;
  if (!global.__csksPool) {
    global.__csksPool = new Pool({ connectionString, max: 5 });
  }
  return global.__csksPool;
}

/** Run a parameterized query. Throws if DATABASE_URL is unset. */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
): Promise<T[]> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL not configured');
  const res = await pool.query<T>(text, params);
  return res.rows;
}

/**
 * Run a set of statements on a single checked-out client inside one
 * BEGIN/COMMIT transaction. Rolls back and rethrows on any error.
 */
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = getPool();
  if (!pool) throw new Error('DATABASE_URL not configured');
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

/** True if the database is configured (replaces isSupabase*Configured). */
export function isDbConfigured(): boolean {
  return !!connectionString;
}
