/**
 * 用户认证 API
 * 支持注册、登录、登出和会话验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/postgres';
import { createHash, randomBytes } from 'crypto';

// ============================================
// 工具函数
// ============================================

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

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// ============================================
// 默认数据
// ============================================

const defaultPhraseCards = [
  { category: 'win_cooperation', title: '表达理解', content: '我理解你感到沮丧，因为...', situation: '孩子情绪激动时' },
  { category: 'win_cooperation', title: '表达感受', content: '我感到...因为...', situation: '需要表达自己感受时' },
  { category: 'win_cooperation', title: '肯定孩子', content: '我相信你能...', situation: '鼓励孩子时' },
  { category: 'heuristic', title: '启发思考', content: '你觉得怎么做比较好？', situation: '需要孩子自己做决定时' },
  { category: 'heuristic', title: '探索感受', content: '你现在的感受是什么？', situation: '帮助孩子识别情绪时' },
  { category: 'emotion', title: '情绪命名', content: '你现在是不是感到...（愤怒/伤心/害怕）？', situation: '帮助孩子命名情绪时' },
  { category: 'positive', title: '关注进步', content: '我注意到你...这真的很棒！', situation: '关注孩子积极行为时' },
  { category: 'daily', title: '日常问候', content: '今天过得怎么样？', situation: '日常对话时' },
];

const defaultTaskTemplates = [
  { period: 'morning', title: '起床整理', icon: 'sunrise', sortOrder: 1 },
  { period: 'morning', title: '早餐时光', icon: 'coffee', sortOrder: 2 },
  { period: 'morning', title: '上学准备', icon: 'backpack', sortOrder: 3 },
  { period: 'afternoon', title: '午休/午点', icon: 'utensils', sortOrder: 1 },
  { period: 'afternoon', title: '学习时间', icon: 'book', sortOrder: 2 },
  { period: 'afternoon', title: '户外活动', icon: 'running', sortOrder: 3 },
  { period: 'evening', title: '晚餐时光', icon: 'utensils', sortOrder: 1 },
  { period: 'evening', title: '家庭时光', icon: 'home', sortOrder: 2 },
  { period: 'evening', title: '睡前准备', icon: 'moon', sortOrder: 3 },
];

async function createDefaultPhraseCards(userId: string) {
  for (const card of defaultPhraseCards) {
    await query(
      `INSERT INTO phrase_cards (id, user_id, category, title, content, situation) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [generateId(), userId, card.category, card.title, card.content, card.situation]
    );
  }
}

async function createDefaultTaskTemplates(userId: string) {
  for (const task of defaultTaskTemplates) {
    await query(
      `INSERT INTO task_templates (id, user_id, period, title, icon, sort_order) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [generateId(), userId, task.period, task.title, task.icon, task.sortOrder]
    );
  }
}

// ============================================
// API 处理器
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, name } = body;

    switch (action) {
      case 'register':
        return await handleRegister(email, password, name);
      case 'login':
        return await handleLogin(email, password);
      case 'logout':
        return await handleLogout(request);
      case 'verify':
        return await handleVerify(request);
      case 'update-profile':
        return await handleUpdateProfile(request, body);
      case 'get-profile':
        return await handleGetProfile(request);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Auth API error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// 处理函数
// ============================================

async function handleRegister(email: string, password: string, name?: string) {
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 }
    );
  }

  // 检查邮箱是否已存在
  const existing = await withRetry(() =>
    queryOne('SELECT id FROM users WHERE email = $1', [email])
  );

  if (existing) {
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 400 }
    );
  }

  // 创建用户
  const userId = generateId();
  const hashedPassword = hashPassword(password);
  const now = new Date().toISOString();

  await withRetry(() =>
    query(
      `INSERT INTO users (id, email, password, name, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, email, hashedPassword, name || email.split('@')[0], now, now]
    )
  );

  // 创建默认数据
  await withRetry(() => createDefaultPhraseCards(userId));
  await withRetry(() => createDefaultTaskTemplates(userId));

  // 创建会话
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await withRetry(() =>
    query(
      `INSERT INTO sessions (id, user_id, token, expires_at, created_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [generateId(), userId, token, expiresAt.toISOString(), now]
    )
  );

  return NextResponse.json({
    success: true,
    user: {
      id: userId,
      email,
      name: name || email.split('@')[0],
    },
    token,
  });
}

async function handleLogin(email: string, password: string) {
  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required' },
      { status: 400 }
    );
  }

  // 查找用户
  const user = await withRetry(() =>
    queryOne<any>('SELECT * FROM users WHERE email = $1', [email])
  );

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  // 验证密码
  const hashedPassword = hashPassword(password);
  if (user.password !== hashedPassword) {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }

  // 更新最后登录时间
  await withRetry(() =>
    query(
      'UPDATE users SET last_login_at = $1 WHERE id = $2',
      [new Date().toISOString(), user.id]
    )
  );

  // 创建新会话
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await withRetry(() =>
    query(
      `INSERT INTO sessions (id, user_id, token, expires_at, created_at) 
       VALUES ($1, $2, $3, $4, $5)`,
      [generateId(), user.id, token, expiresAt.toISOString(), new Date().toISOString()]
    )
  );

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  });
}

async function handleLogout(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (token) {
    await withRetry(() =>
      query('DELETE FROM sessions WHERE token = $1', [token])
    );
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
      `SELECT s.*, u.id as user_id, u.email, u.name, u.avatar 
       FROM sessions s JOIN users u ON s.user_id = u.id 
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    )
  );

  if (!session) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: session.user_id,
      email: session.email,
      name: session.name,
      avatar: session.avatar,
    },
  });
}

async function handleUpdateProfile(request: NextRequest, body: any) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const session = await withRetry(() =>
    queryOne<any>(
      'SELECT user_id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    )
  );

  if (!session) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { name, avatar } = body;
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (name !== undefined) {
    updates.push(`name = $${paramIndex++}`);
    values.push(name);
  }
  if (avatar !== undefined) {
    updates.push(`avatar = $${paramIndex++}`);
    values.push(avatar);
  }
  updates.push(`updated_at = $${paramIndex++}`);
  values.push(new Date().toISOString());
  values.push(session.user_id);

  await withRetry(() =>
    query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    )
  );

  return NextResponse.json({ success: true });
}

async function handleGetProfile(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'No token provided' }, { status: 401 });
  }

  const session = await withRetry(() =>
    queryOne<any>(
      `SELECT u.id, u.email, u.name, u.avatar, u.created_at 
       FROM sessions s JOIN users u ON s.user_id = u.id 
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    )
  );

  if (!session) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: {
      id: session.id,
      email: session.email,
      name: session.name,
      avatar: session.avatar,
      createdAt: session.created_at,
    },
  });
}
