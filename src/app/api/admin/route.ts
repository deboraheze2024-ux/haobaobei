/**
 * 管理员 API
 * 支持管理员登录、登出、验证和用户管理
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/postgres';
import { createHash, randomBytes } from 'crypto';

// 带重试
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
      if (error?.code === 'ETIMEDOUT' || error?.code === 'ECONNRESET') {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

function generateId(): string {
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'login':
        return await handleLogin(body);
      case 'logout':
        return await handleLogout(request);
      case 'verify':
        return await handleVerify(request);
      case 'stats':
        return await handleStats(request);
      case 'get-users':
        return await handleGetUsers(request);
      case 'delete-user':
        return await handleDeleteUser(request, body);
      case 'get-table-data':
        return await handleGetTableData(request, body);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleLogin(body: any) {
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  const hashedPassword = hashPassword(password);

  const admin = await withRetry(() =>
    queryOne<any>('SELECT * FROM admins WHERE email = $1', [email])
  );

  if (!admin || admin.password !== hashedPassword) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  }

  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await withRetry(() =>
    query(
      `INSERT INTO admin_sessions (id, admin_id, token, expires_at, created_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [generateId(), admin.id, token, expiresAt.toISOString(), new Date().toISOString()]
    )
  );

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

async function handleLogout(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (token) {
    await withRetry(() => query('DELETE FROM admin_sessions WHERE token = $1', [token]));
  }

  return NextResponse.json({ success: true });
}

async function handleVerify(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const session = await withRetry(() =>
    queryOne<any>(
      `SELECT s.*, a.id as admin_id, a.email, a.name, a.role 
       FROM admin_sessions s JOIN admins a ON s.admin_id = a.id 
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    )
  );

  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    admin: {
      id: session.admin_id,
      email: session.email,
      name: session.name,
      role: session.role,
    },
  });
}

async function handleStats(request: NextRequest) {
  await verifyAdmin(request);

  const tables = [
    'users', 'child_profiles', 'check_in_records', 'emotion_records',
    'family_meetings', 'growth_goals', 'chat_messages', 'phrase_cards',
    'parenting_notes', 'reflection_records', 'learning_records', 'important_experiences'
  ];

  const tableStats: Record<string, number> = {};
  let userCount = 0;

  for (const table of tables) {
    try {
      const result = await withRetry(() => query(`SELECT COUNT(*) as count FROM ${table}`));
      tableStats[table] = parseInt(result.rows[0]?.count || '0');
      if (table === 'users') userCount = tableStats[table];
    } catch (e) {
      tableStats[table] = 0;
    }
  }

  return NextResponse.json({ userCount, tableStats });
}

async function handleGetUsers(request: NextRequest) {
  await verifyAdmin(request);

  const users = await withRetry(() =>
    query(`
      SELECT u.id, u.email, u.name, u.created_at, u.last_login_at,
        (SELECT COUNT(*) FROM child_profiles WHERE user_id = u.id) as child_count,
        (SELECT COUNT(*) FROM growth_goals WHERE user_id = u.id) as goal_count,
        (SELECT COUNT(*) FROM family_meetings WHERE user_id = u.id) as meeting_count,
        (SELECT COUNT(*) FROM parenting_notes WHERE user_id = u.id) as note_count
      FROM users u ORDER BY u.created_at DESC LIMIT 100
    `)
  );

  return NextResponse.json({
    users: users.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      created_at: row.created_at,
      last_login_at: row.last_login_at,
      childCount: parseInt(row.child_count),
      goalCount: parseInt(row.goal_count),
      meetingCount: parseInt(row.meeting_count),
      noteCount: parseInt(row.note_count),
    })),
  });
}

async function handleDeleteUser(request: NextRequest, body: any) {
  await verifyAdmin(request);

  const { userId } = body;
  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  }

  const tables = [
    'sessions', 'child_profiles', 'check_in_records', 'emotion_records',
    'family_meetings', 'growth_goals', 'chat_messages', 'phrase_cards',
    'task_templates', 'parenting_notes', 'reflection_records', 
    'learning_records', 'important_experiences', 'app_settings'
  ];

  for (const table of tables) {
    try {
      await withRetry(() => query(`DELETE FROM ${table} WHERE user_id = $1`, [userId]));
    } catch (e) {}
  }

  await withRetry(() => query('DELETE FROM users WHERE id = $1', [userId]));

  return NextResponse.json({ success: true });
}

async function handleGetTableData(request: NextRequest, body: any) {
  await verifyAdmin(request);

  const { table, limit = 100 } = body;
  if (!table) {
    return NextResponse.json({ error: 'Table name required' }, { status: 400 });
  }

  // 防止 SQL 注入
  const safeTables = [
    'users', 'sessions', 'admins', 'admin_sessions', 'child_profiles',
    'check_in_records', 'emotion_records', 'family_meetings', 'growth_goals',
    'chat_messages', 'phrase_cards', 'task_templates', 'parenting_notes',
    'reflection_records', 'learning_records', 'important_experiences', 'app_settings'
  ];

  if (!safeTables.includes(table)) {
    return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
  }

  const result = await withRetry(() =>
    query(`SELECT * FROM ${table} ORDER BY created_at DESC LIMIT $1`, [limit])
  );

  return { data: result.rows, count: result.rowCount };
}

async function verifyAdmin(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) {
    throw new Error('Unauthorized');
  }

  const session = await withRetry(() =>
    queryOne<any>(
      'SELECT admin_id FROM admin_sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    )
  );

  if (!session) {
    throw new Error('Unauthorized');
  }
}
