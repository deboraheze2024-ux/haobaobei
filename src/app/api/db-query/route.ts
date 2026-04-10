/**
 * 数据库查询 API
 * 用于客户端访问 Supabase 数据库
 * 支持用户数据隔离
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface DbQueryRequest {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  filters?: Record<string, unknown>;
  data?: Record<string, unknown>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

// 需要 user_id 的表列表
const TABLES_WITH_USER_ID = [
  'child_profiles',
  'check_in_records',
  'emotion_records',
  'family_meetings',
  'growth_goals',
  'chat_messages',
  'phrase_cards',
  'task_templates',
  'parenting_notes',
  'reflection_records',
  'learning_records',
  'important_experiences',
  'app_settings',
];

export async function POST(request: NextRequest) {
  try {
    const body: DbQueryRequest = await request.json();
    const { table, operation, filters, data, order, limit, single } = body;
    const client = getSupabaseClient();

    // 获取用户 ID
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      // 验证 token 并获取 user_id
      const { data: session } = await client
        .from('sessions')
        .select('user_id')
        .eq('token', token)
        .maybeSingle();

      if (session) {
        userId = session.user_id;
      }
    }

    let result;

    switch (operation) {
      case 'select': {
        let query = client.from(table).select('*');
        
        // 如果表需要 user_id 且有用户登录，添加 user_id 过滤
        if (TABLES_WITH_USER_ID.includes(table) && userId) {
          query = query.eq('user_id', userId);
        }
        
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
        // 如果表需要 user_id 且有用户登录，添加 user_id
        const insertData = { ...data };
        if (TABLES_WITH_USER_ID.includes(table) && userId) {
          insertData.user_id = userId;
        }
        result = await client.from(table).insert(insertData).select();
        break;
      }

      case 'update': {
        let query = client.from(table).update(data);
        
        // 如果表需要 user_id 且有用户登录，添加 user_id 过滤
        if (TABLES_WITH_USER_ID.includes(table) && userId) {
          query = query.eq('user_id', userId);
        }
        
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
        
        // 如果表需要 user_id 且有用户登录，添加 user_id 过滤
        if (TABLES_WITH_USER_ID.includes(table) && userId) {
          query = query.eq('user_id', userId);
        }
        
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
