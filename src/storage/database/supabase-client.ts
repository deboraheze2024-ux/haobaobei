/**
 * Supabase 客户端配置
 * 
 * 注意：这个模块应该只在服务端使用
 * 在客户端，请使用 API 路由来访问数据库
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * 获取 Supabase 客户端实例
 * 
 * 使用场景：
 * 1. 服务端 API Routes：直接使用此函数
 * 2. 客户端：使用 fetch 调用 /api/db-query 路由
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.COZE_SUPABASE_URL;
  const anonKey = process.env.COZE_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase environment variables: ' +
      'COZE_SUPABASE_URL and COZE_SUPABASE_ANON_KEY must be set'
    );
  }

  supabaseClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseClient;
}

/**
 * 关闭并重置 Supabase 客户端
 */
export function resetSupabaseClient(): void {
  supabaseClient = null;
}
