/**
 * 数据库查询 API
 * 用于客户端访问 Supabase 数据库
 * 
 * 支持的操作：
 * - query: 查询数据
 * - insert: 插入数据
 * - update: 更新数据
 * - delete: 删除数据
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface DbQueryRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  filters?: Record<string, any>;
  data?: Record<string, any>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: DbQueryRequest = await request.json();
    const { table, operation, filters, data, order, limit, single } = body;
    const client = getSupabaseClient();

    let result;

    switch (operation) {
      case 'select': {
        let query = client.from(table).select('*');
        
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
          }
        }
        
        if (order) {
          query = query.order(order.column, { ascending: order.ascending ?? true });
        }
        
        if (limit) {
          query = query.limit(limit);
        }
        
        if (single) {
          result = await query.maybeSingle();
        } else {
          result = await query;
        }
        break;
      }

      case 'insert': {
        result = await client.from(table).insert(data).select();
        break;
      }

      case 'update': {
        let query = client.from(table).update(data);
        
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
          }
        }
        
        result = await query.select();
        break;
      }

      case 'delete': {
        let query = client.from(table).delete();
        
        if (filters) {
          for (const [key, value] of Object.entries(filters)) {
            query = query.eq(key, value);
          }
        }
        
        result = await query;
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 }
        );
    }

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error('Database query error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
