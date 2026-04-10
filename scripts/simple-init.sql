-- 核心用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- 会话表
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 孩子档案表
CREATE TABLE IF NOT EXISTS child_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  birth_date DATE,
  gender TEXT,
  current_stage TEXT,
  personality TEXT,
  interests TEXT,
  strengths TEXT,
  challenges TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 打卡记录表
CREATE TABLE IF NOT EXISTS check_in_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  child_id TEXT,
  date DATE NOT NULL,
  period TEXT NOT NULL,
  task_id TEXT,
  task_title TEXT,
  completed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 情绪记录表
CREATE TABLE IF NOT EXISTS emotion_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  child_id TEXT,
  emotion_type TEXT NOT NULL,
  emotion_name TEXT NOT NULL,
  intensity INTEGER DEFAULT 5,
  trigger_event TEXT,
  response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 家庭会议表
CREATE TABLE IF NOT EXISTS family_meetings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  child_id TEXT,
  title TEXT NOT NULL,
  meeting_date DATE,
  status TEXT DEFAULT 'draft',
  gratitude_notes TEXT,
  agenda_items TEXT,
  brainstorm_data TEXT,
  decisions TEXT,
  entertainment_plan TEXT,
  meeting_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 成长目标表
CREATE TABLE IF NOT EXISTS growth_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  child_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  target_date DATE,
  breakdown TEXT,
  tips TEXT,
  related_knowledge TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 聊天记录表
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sources TEXT,
  child_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 话术卡片表
CREATE TABLE IF NOT EXISTS phrase_cards (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  situation TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务模板表
CREATE TABLE IF NOT EXISTS task_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  period TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 陪伴笔记表
CREATE TABLE IF NOT EXISTS parenting_notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 复盘记录表
CREATE TABLE IF NOT EXISTS reflection_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT,
  situation TEXT,
  thought TEXT,
  feeling TEXT,
  action TEXT,
  result TEXT,
  analysis TEXT,
  learning TEXT,
  images TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT,
  source_name TEXT,
  content_summary TEXT,
  key_points TEXT,
  action_plan TEXT,
  reflection TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 重要经验表
CREATE TABLE IF NOT EXISTS important_experiences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  category TEXT,
  is_starred BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 应用设置表
CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入默认管理员 (密码: admin123)
INSERT INTO admins (id, email, password, name, role) 
VALUES ('admin-001', 'admin@haobaobei.com', '5dabf36d62ac456bf85e48076576ca07a3e26207ef9c4da85f406f098018327f', '超级管理员', 'super_admin')
ON CONFLICT (email) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_child_profiles_user_id ON child_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_check_in_records_user_id ON check_in_records(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_records_user_id ON emotion_records(user_id);
CREATE INDEX IF NOT EXISTS idx_family_meetings_user_id ON family_meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_goals_user_id ON growth_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_phrase_cards_user_id ON phrase_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_user_id ON task_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_parenting_notes_user_id ON parenting_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_reflection_records_user_id ON reflection_records(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_user_id ON learning_records(user_id);
CREATE INDEX IF NOT EXISTS idx_important_experiences_user_id ON important_experiences(user_id);
CREATE INDEX IF NOT EXISTS idx_app_settings_user_id ON app_settings(user_id);
