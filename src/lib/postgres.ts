/**
 * PostgreSQL 数据库客户端 (支持 Neon)
 */

import { Pool, PoolClient } from 'pg';

let pool: Pool | null = null;

/**
 * 获取 PostgreSQL 连接池
 */
export function getPool(): Pool {
  if (pool) {
    return pool;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  pool.on('error', (err) => {
    console.error('Unexpected database pool error:', err);
  });

  return pool;
}

/**
 * 执行查询
 */
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount?: number }> {
  const pool = getPool();
  const result = await pool.query(sql, params);
  return { rows: result.rows, rowCount: result.rowCount };
}

/**
 * 获取单行
 */
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const result = await query<T>(sql, params);
  return result.rows[0] || null;
}

/**
 * 插入并返回
 */
export async function insertAndReturn<T = any>(
  table: string,
  data: Record<string, any>,
  returning: string = '*'
): Promise<T> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING ${returning}`;
  const result = await query<T>(sql, values);
  return result.rows[0];
}

/**
 * 关闭连接池
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
