/**
 * 数据库查询 API
 * 提供统一的数据库访问接口
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/postgres';

// 带重试的数据库操作
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      if (error?.message?.includes('fetch') || 
          error?.message?.includes('network') ||
          error?.message?.includes('timeout') ||
          error?.code === 'ETIMEDOUT' ||
          error?.code === 'ECONNRESET') {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

function generateId(): string {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 验证会话
    const session = await withRetry(() =>
      queryOne<any>(
        'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
        [token]
      )
    );

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { table, operation, filters, data, order, limit = 100, single = false } = await request.json();

    if (!table || !operation) {
      return NextResponse.json(
        { error: 'Table and operation are required' },
        { status: 400 }
      );
    }

    const userId = session.user_id;
    let result;

    switch (operation) {
      case 'select':
        result = await handleSelect(table, userId, filters, order, limit, single);
        break;
      case 'insert':
        result = await handleInsert(table, userId, data);
        break;
      case 'update':
        result = await handleUpdate(table, userId, filters, data);
        break;
      case 'delete':
        result = await handleDelete(table, userId, filters);
        break;
      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('DB Query error:', error);
    return NextResponse.json(
      { error: error.message || 'Database error' },
      { status: 500 }
    );
  }
}

async function handleSelect(table: string, userId: string, filters?: any, order?: any, limit?: number, single?: boolean) {
  // 构建 WHERE 条件
  let whereClause = 'WHERE user_id = $1';
  const values: any[] = [userId];
  let paramIndex = 2;

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      whereClause += ` AND ${key} = $${paramIndex}`;
      values.push(value);
      paramIndex++;
    }
  }

  // 构建 ORDER BY
  let orderClause = '';
  if (order) {
    orderClause = `ORDER BY ${order.column || 'created_at'} ${order.ascending ? 'ASC' : 'DESC'}`;
  } else {
    orderClause = 'ORDER BY created_at DESC';
  }

  const limitClause = `LIMIT ${limit || 100}`;

  const sql = `SELECT * FROM ${table} ${whereClause} ${orderClause} ${limitClause}`;
  const result = await withRetry(() => query(sql, values));

  if (single && result.rows.length > 0) {
    return result.rows[0];
  }

  return result.rows;
}

async function handleInsert(table: string, userId: string, data: any) {
  const id = generateId();
  const now = new Date().toISOString();
  
  const keys = ['id', 'user_id', 'created_at', ...Object.keys(data)];
  const values = [id, userId, now, ...Object.values(data)];
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const columns = keys.join(', ');

  const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders}) RETURNING *`;
  const result = await withRetry(() => query(sql, values));

  return result.rows[0];
}

async function handleUpdate(table: string, userId: string, filters: any, data: any) {
  const updates: string[] = ['updated_at = $1'];
  const values: any[] = [new Date().toISOString()];
  let paramIndex = 2;

  for (const [key, value] of Object.entries(data)) {
    updates.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  let whereClause = 'WHERE user_id = $' + paramIndex;
  values.push(userId);
  paramIndex++;

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      whereClause += ` AND ${key} = $${paramIndex}`;
      values.push(value);
      paramIndex++;
    }
  }

  const sql = `UPDATE ${table} SET ${updates.join(', ')} ${whereClause} RETURNING *`;
  const result = await withRetry(() => query(sql, values));

  return result.rows;
}

async function handleDelete(table: string, userId: string, filters: any) {
  let whereClause = 'WHERE user_id = $1';
  const values: any[] = [userId];
  let paramIndex = 2;

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      whereClause += ` AND ${key} = $${paramIndex}`;
      values.push(value);
      paramIndex++;
    }
  }

  const sql = `DELETE FROM ${table} ${whereClause} RETURNING id`;
  const result = await withRetry(() => query(sql, values));

  return { deleted: result.rowCount };
}
