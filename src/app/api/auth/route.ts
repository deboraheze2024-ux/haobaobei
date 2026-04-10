/**
 * 用户认证 API
 * 支持注册、登录、登出和会话验证
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { SupabaseClient } from '@supabase/supabase-js';
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
      // 如果是网络错误，等待后重试
      if (error?.message?.includes('fetch') || 
          error?.message?.includes('network') ||
          error?.message?.includes('timeout') ||
          error?.cause?.code === 'ETIMEDOUT' ||
          error?.code === 'ETIMEDOUT') {
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
  return createHash('sha256').update(password + 'positive-parenting-salt').digest('hex');
}

function generateToken(): string {
  return randomBytes(32).toString('hex');
}

// ============================================
// POST /api/auth/register - 用户注册
// ============================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'register') {
      return handleRegister(body);
    } else if (action === 'login') {
      return handleLogin(body);
    } else if (action === 'logout') {
      return handleLogout(request);
    } else if (action === 'verify') {
      return handleVerify(request);
    } else if (action === 'update-profile') {
      return handleUpdateProfile(request, body);
    } else if (action === 'get-profile') {
      return handleGetProfile(request);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================
// 处理注册
// ============================================
async function handleRegister(data: {
  email: string;
  password: string;
  name?: string;
}) {
  const { email, password, name } = data;

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

  const client = getSupabaseClient();

  // 检查邮箱是否已存在（带重试）
  const { data: existing } = await withRetry(() =>
    client.from('users').select('id').eq('email', email).maybeSingle()
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

  const { error: insertError } = await withRetry(() =>
    client.from('users').insert({
      id: userId,
      email,
      password: hashedPassword,
      name: name || email.split('@')[0],
      created_at: now,
      updated_at: now,
    })
  );

  if (insertError) {
    return NextResponse.json(
      { error: 'Failed to create user: ' + insertError.message },
      { status: 500 }
    );
  }

  // 创建默认话术卡片
  await withRetry(() => createDefaultPhraseCards(client, userId));

  // 创建默认任务模板
  await withRetry(() => createDefaultTaskTemplates(client, userId));

  // 创建会话
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30天后过期

  await withRetry(() =>
    client.from('sessions').insert({
      id: generateId(),
      user_id: userId,
      token,
      expires_at: expiresAt.toISOString(),
    })
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

// ============================================
// 处理登录
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

  // 查找用户（带重试）
  const { data: user, error } = await withRetry(() =>
    client.from('users').select('*').eq('email', email).maybeSingle()
  );

  if (error || !user) {
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
    client.from('users').update({
      last_login_at: new Date().toISOString(),
    }).eq('id', user.id)
  );

  // 创建新会话
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await withRetry(() =>
    client.from('sessions').insert({
      id: generateId(),
    user_id: user.id,
    token,
    expires_at: expiresAt.toISOString(),
  });

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

// ============================================
// 处理登出
// ============================================
async function handleLogout(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ success: true });
  }

  const client = getSupabaseClient();
  await client.from('sessions').delete().eq('token', token);

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
    .from('sessions')
    .select('user_id, expires_at')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  // 检查是否过期
  if (new Date(session.expires_at) < new Date()) {
    await client.from('sessions').delete().eq('token', token);
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  // 获取用户信息
  const { data: user } = await client
    .from('users')
    .select('id, email, name, avatar')
    .eq('id', session.user_id)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }

  return NextResponse.json({
    valid: true,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    },
  });
}

// ============================================
// 获取用户资料
// ============================================
async function handleGetProfile(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient();

  const { data: session } = await client
    .from('sessions')
    .select('user_id')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const { data: user } = await client
    .from('users')
    .select('id, email, name, avatar, created_at, last_login_at')
    .eq('id', session.user_id)
    .maybeSingle();

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({ user });
}

// ============================================
// 更新用户资料
// ============================================
async function handleUpdateProfile(request: NextRequest, data: {
  name?: string;
  avatar?: string;
}) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = getSupabaseClient();

  const { data: session } = await client
    .from('sessions')
    .select('user_id')
    .eq('token', token)
    .maybeSingle();

  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const { error } = await client.from('users').update({
    name: data.name,
    avatar: data.avatar,
    updated_at: new Date().toISOString(),
  }).eq('id', session.user_id);

  if (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

// ============================================
// 创建默认话术卡片
// ============================================
interface DefaultCard {
  category: string;
  title: string;
  content: string;
  situation: string;
}

async function createDefaultPhraseCards(client: SupabaseClient, userId: string) {
  const defaultCards: DefaultCard[] = [
    { category: '赢得合作', title: '表达理解', content: '我能看出来你真的很生气。你希望能自己决定什么时候做作业，对吗？', situation: '孩子抗拒做作业时' },
    { category: '赢得合作', title: '表达感受', content: '当你...的时候，我感到...，因为...', situation: '引导孩子理解他人感受' },
    { category: '启发式提问', title: '探索原因', content: '你觉得为什么会出现这个问题呢？', situation: '问题解决前的引导' },
    { category: '启发式提问', title: '引导思考', content: '你对这个有什么想法？我们一起想想有什么办法。', situation: '需要孩子参与解决方案' },
    { category: '情绪调节', title: '接纳情绪', content: '我理解你现在很难过。每个人都会有难过的时候。', situation: '孩子情绪崩溃时' },
    { category: '情绪调节', title: '命名情绪', content: '你现在感到...对吗？让我们一起把这些情绪说出来。', situation: '帮助孩子识别情绪' },
    { category: '正向引导', title: '关注进步', content: '我注意到你这次...做得很好！你是怎么做到的？', situation: '肯定孩子的努力' },
    { category: '正向引导', title: '强调优点', content: '你真的很擅长...！这让我很骄傲。', situation: '强化孩子的自信心' },
    { category: '日常互动', title: '日常致谢', content: '谢谢你...，这让我感到很温暖。', situation: '日常生活中表达感激' },
    { category: '日常互动', title: '陪伴时光', content: '我很喜欢和你一起...的时候，那是我们的特别时光。', situation: '增进亲子关系' },
  ];

  for (const card of defaultCards) {
    await client.from('phrase_cards').insert({
      id: generateId(),
      user_id: userId,
      category: card.category,
      title: card.title,
      content: card.content,
      situation: card.situation,
      is_favorite: false,
      tags: [],
    });
  }
}

// ============================================
// 创建默认任务模板
// ============================================
interface DefaultTemplate {
  period: string;
  title: string;
  icon: string;
  description: string;
}

async function createDefaultTaskTemplates(client: SupabaseClient, userId: string) {
  const defaultTemplates: DefaultTemplate[] = [
    // 早晨任务
    { period: 'morning', title: '起床整理', icon: '🌅', description: '自己起床、穿衣服、整理床铺' },
    { period: 'morning', title: '个人卫生', icon: '🪥', description: '刷牙、洗脸、梳头' },
    { period: 'morning', title: '营养早餐', icon: '🍳', description: '吃早餐（不挑食）' },
    // 日间任务
    { period: 'afternoon', title: '专心学习', icon: '📚', description: '完成学校作业' },
    { period: 'afternoon', title: '户外活动', icon: '⚽', description: '户外运动或游戏' },
    { period: 'afternoon', title: '兴趣爱好', icon: '🎨', description: '画画、音乐、阅读等' },
    // 晚间任务
    { period: 'evening', title: '整理书包', icon: '🎒', description: '整理好第二天要带的东西' },
    { period: 'evening', title: '洗漱准备', icon: '🛁', description: '洗澡、刷牙、准备睡觉' },
    { period: 'evening', title: '亲子阅读', icon: '📖', description: '和家长一起读书' },
  ];

  for (const template of defaultTemplates) {
    await client.from('task_templates').insert({
      id: generateId(),
      user_id: userId,
      period: template.period,
      title: template.title,
      description: template.description,
      icon: template.icon,
    });
  }
}
