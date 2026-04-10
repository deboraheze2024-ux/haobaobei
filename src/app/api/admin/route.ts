/**
 * 管理员认证 API
 * 支持管理员登录、登出和会话验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { createHash, randomBytes } from 'crypto';

// ============================================
// 工具函数
// ============================================

function generateId(): string {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function hashPassword(password: string, salt: string = 'positive-parenting-admin-salt'): string {
  return createHash('sha256').update(password + salt).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// ============================================
// POST /api/admin/auth - 管理员认证
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'login') {
      return handleLogin(body);
    } else if (action === 'logout') {
      return handleLogout(request);
    } else if (action === 'verify') {
      return handleVerify(request);
    } else if (action === 'stats') {
      return handleStats(request);
    } else if (action === 'get-users') {
      return handleGetUsers(request);
    } else if (action === 'delete-user') {
      return handleDeleteUser(request, body);
    } else if (action === 'get-table-data') {
      return handleGetTableData(request, body);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Admin auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================
// 处理管理员登录
// ============================================
async function handleLogin(data: { email: string; password: string }) {
  const { email, password } = data;

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  const client = getSupabaseClient();

  // 查找管理员
  const { data: admin, error } = await client
    .from('admins')
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error || !admin) {
    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    );
  }

  // 验证密码
  const hashedPassword = hashPassword(password);
  if (admin.password !== hashedPassword) {
    return NextResponse.json(
      { error: 'Invalid admin credentials' },
      { status: 401 }
    );
  }

  // 更新最后登录时间
  await client.from('admins').update({
    last_login_at: new Date().toISOString(),
  }).eq('id', admin.id);

  // 创建新会话
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7天后过期

  await client.from('admin_sessions').insert({
    id: generateId(),
    admin_id: admin.id,
    token,
    expires_at: expiresAt.toISOString(),
  });

  return NextResponse.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
    token,
  });
}

// ============================================
// 处理登出
// ============================================
async function handleLogout(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ success: true });
  }

  const client = getSupabaseClient();
  await client.from('admin_sessions').delete().eq('token', token);

  return NextResponse.json({ success: true });
}

// ============================================
// 验证 token
// ============================================
async function handleVerify(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  const client = getSupabaseClient();

  // 查找会话
  const { data: session } = await client
    .from('admin_sessions')
    .select('admin_id, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  // 检查是否过期
  if (new Date(session.expires_at) < new Date()) {
    await client.from('admin_sessions').delete().eq('token', token);
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  // 获取管理员信息
  const { data: admin } = await client
    .from('admins')
    .select('id, email, name, role')
    .eq('id', session.admin_id)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({
    valid: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  });
}

// ============================================
// 获取统计数据
// ============================================
async function handleStats(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient();

  // 验证管理员
  const { data: session } = await client
    .from('admin_sessions')
    .select('admin_id')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // 获取用户数量
  const { count: userCount } = await client
    .from('users')
    .select('*', { count: 'exact', head: true });

  // 获取各表数据统计
  const tables = [
    'child_profiles',
    'check_in_records',
    'emotion_records',
    'family_meetings',
    'growth_goals',
    'chat_messages',
    'phrase_cards',
    'parenting_notes',
    'reflection_records',
    'learning_records',
    'important_experiences',
  ];

  const tableStats: Record<string, number> = {};
  
  for (const table of tables) {
    const { count } = await client
      .from(table)
      .select('*', { count: 'exact', head: true });
    tableStats[table] = count || 0;
  }

  return NextResponse.json({
    userCount: userCount || 0,
    tableStats,
  });
}

// ============================================
// 获取用户列表
// ============================================
async function handleGetUsers(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient();

  // 验证管理员
  const { data: session } = await client
    .from('admin_sessions')
    .select('admin_id')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  // 获取所有用户（不包含密码）
  const { data: users, error } = await client
    .from('users')
    .select('id, email, name, created_at, last_login_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 获取每个用户的数据统计
  const usersWithStats = await Promise.all(
    (users || []).map(async (user) => {
      const [childCount, goalCount, meetingCount, noteCount] = await Promise.all([
        client.from('child_profiles').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        client.from('growth_goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        client.from('family_meetings').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        client.from('parenting_notes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      return {
        ...user,
        childCount: childCount.count || 0,
        goalCount: goalCount.count || 0,
        meetingCount: meetingCount.count || 0,
        noteCount: noteCount.count || 0,
      };
    })
  );

  return NextResponse.json({ users: usersWithStats });
}

// ============================================
// 删除用户
// ============================================
async function handleDeleteUser(request: NextRequest, data: { userId: string }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient();

  // 验证管理员
  const { data: session } = await client
    .from('admin_sessions')
    .select('admin_id')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const { userId } = data;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  // 删除用户的所有数据
  const tablesToClean = [
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
    'sessions',
  ];

  for (const table of tablesToClean) {
    await client.from(table).delete().eq('user_id', userId);
  }

  // 删除用户
  const { error } = await client.from('users').delete().eq('id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ============================================
// 获取指定表的数据
// ============================================
async function handleGetTableData(request: NextRequest, data: { table: string; limit?: number; offset?: number }) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient();

  // 验证管理员
  const { data: session } = await client
    .from('admin_sessions')
    .select('admin_id')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const { table, limit = 50, offset = 0 } = data;

  // 允许查看的表
  const allowedTables = [
    'users',
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
    'sessions',
  ];

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: 'Table not allowed' }, { status: 400 });
  }

  const { data: rows, error, count } = await client
    .from(table)
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    data: rows,
    count: count || 0,
    limit,
    offset,
  });
}
