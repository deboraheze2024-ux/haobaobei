/**
 * 数据库操作模块
 * 通过 API 路由访问 Supabase 数据库
 * 支持在客户端环境中使用
 */

// ============================================
// 工具函数
// ============================================

function generateId(): string {
  // 使用 crypto.randomUUID() 生成 UUID
  return typeof globalThis.crypto?.randomUUID === 'function'
    ? globalThis.crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// API 请求辅助函数
// ============================================

interface DbQueryOptions {
  table: string;
  operation: 'select' | 'insert' | 'update' | 'delete';
  filters?: Record<string, any>;
  data?: Record<string, any>;
  order?: { column: string; ascending?: boolean };
  limit?: number;
  single?: boolean;
}

async function dbQuery<T = any>(options: DbQueryOptions): Promise<T[]> {
  const response = await fetch('/api/db-query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Database error: ${error.error}`);
  }

  const result = await response.json();
  return result.data || [];
}

async function dbQuerySingle<T = any>(options: DbQueryOptions): Promise<T | null> {
  const data = await dbQuery<T>({ ...options, single: true });
  return data.length > 0 ? data[0] : null;
}

// ============================================
// 孩子档案 CRUD
// ============================================

export async function getChildProfiles() {
  return await dbQuery({ table: 'child_profiles', operation: 'select' });
}

export async function getChildProfile(id: string) {
  return await dbQuerySingle({ table: 'child_profiles', operation: 'select', filters: { id } });
}

export async function createChildProfile(profile: {
  name: string;
  birthDate?: string;
  gender?: string;
  avatar?: string;
  nickname?: string;
  personality?: string;
  strengths?: string[];
  challenges?: string[];
  interests?: string[];
  currentStage?: string;
  keyBehaviors?: any[];
  notes?: string;
}) {
  const now = new Date().toISOString();
  return await dbQuery({ table: 'child_profiles',
    operation: 'insert',
    data: {
      id: generateId(),
      name: profile.name,
      birth_date: profile.birthDate,
      gender: profile.gender,
      avatar: profile.avatar,
      nickname: profile.nickname,
      personality: profile.personality,
      strengths: profile.strengths,
      challenges: profile.challenges,
      interests: profile.interests,
      current_stage: profile.currentStage,
      key_behaviors: profile.keyBehaviors,
      notes: profile.notes,
      created_at: now,
      updated_at: now,
    },
  });
}

export async function updateChildProfile(id: string, profile: Partial<{
  name: string;
  birthDate: string;
  gender: string;
  avatar: string;
  nickname: string;
  personality: string;
  strengths: string[];
  challenges: string[];
  interests: string[];
  currentStage: string;
  keyBehaviors: any[];
  notes: string;
}>) {
  return await dbQuery({ table: 'child_profiles',
    operation: 'update',
    filters: { id },
    data: {
      ...profile,
      birth_date: profile.birthDate,
      gender: profile.gender,
      avatar: profile.avatar,
      nickname: profile.nickname,
      personality: profile.personality,
      strengths: profile.strengths,
      challenges: profile.challenges,
      interests: profile.interests,
      current_stage: profile.currentStage,
      key_behaviors: profile.keyBehaviors,
      notes: profile.notes,
      updated_at: new Date().toISOString(),
    },
  });
}

export async function deleteChildProfile(id: string) {
  return await dbQuery({ table: 'child_profiles',
    operation: 'delete',
    filters: { id },
  });
}

// ============================================
// 打卡记录 CRUD
// ============================================

export async function getCheckInRecords() {
  const data = await dbQuery({ table: 'check_in_records', 
    operation: 'select',
    order: { column: 'date', ascending: false }
  });
  return data;
}

export async function getTodayCheckIn() {
  const today = new Date().toISOString().split('T')[0];
  return await dbQuery({ table: 'check_in_records',
    operation: 'select',
    filters: { date: today }
  });
}

export async function saveCheckInRecord(record: {
  date: string;
  period: string;
  tasks: any[];
  completedAt?: string;
  notes?: string;
}) {
  // 检查是否已存在
  const existing = await dbQuerySingle({
    table: 'check_in_records',
    operation: 'select',
    filters: { date: record.date, period: record.period }
  });

  if (existing) {
    // 更新
    return await dbQuery({ table: 'check_in_records',
      operation: 'update',
      filters: { id: existing.id },
      data: {
        tasks: record.tasks,
        completed_at: record.completedAt,
        notes: record.notes,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'check_in_records',
      operation: 'insert',
      data: {
        id: generateId(),
        date: record.date,
        period: record.period,
        tasks: record.tasks,
        completed_at: record.completedAt,
        notes: record.notes,
      },
    });
  }
}

// ============================================
// 情绪记录 CRUD
// ============================================

export async function getEmotionRecords(childId?: string) {
  const filters = childId ? { child_id: childId } : undefined;
  const data = await dbQuery({ table: 'emotion_records',
    operation: 'select',
    filters,
    order: { column: 'created_at', ascending: false }
  });
  return data;
}

export async function getRecentEmotions(childId: string, days: number = 7) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().split('T')[0];
  
  const data = await dbQuery({ table: 'emotion_records',
    operation: 'select',
    filters: { 
      child_id: childId,
      date: cutoffStr // 注意：这里需要后端支持范围查询
    },
    order: { column: 'created_at', ascending: false }
  });
  return data;
}

export async function createEmotionRecord(record: {
  childId: string;
  date: string;
  time?: string;
  emotion: string;
  intensity?: number;
  trigger?: string;
  behavior?: string;
  parentResponse?: string;
  result?: string;
  notes?: string;
}) {
  return await dbQuery({ table: 'emotion_records',
    operation: 'insert',
    data: {
      id: generateId(),
      child_id: record.childId,
      date: record.date,
      time: record.time,
      emotion: record.emotion,
      intensity: record.intensity,
      trigger: record.trigger,
      behavior: record.behavior,
      parent_response: record.parentResponse,
      result: record.result,
      notes: record.notes,
    },
  });
}

// ============================================
// 家庭会议 CRUD
// ============================================

export async function getFamilyMeetings() {
  const data = await dbQuery({ table: 'family_meetings',
    operation: 'select',
    order: { column: 'date', ascending: false }
  });
  return data;
}

export async function getFamilyMeeting(id: string) {
  return await dbQuerySingle({ table: 'family_meetings',
    operation: 'select',
    filters: { id }
  });
}

export async function saveFamilyMeeting(meeting: {
  id?: string;
  date: string;
  status: string;
  attendees?: string[];
  agenda?: any[];
  gratitudeList?: string[];
  brainstorms?: any[];
  decisions?: any[];
  funPlan?: string;
  notes?: string;
}) {
  const now = new Date().toISOString();

  if (meeting.id) {
    // 更新
    return await dbQuery({ table: 'family_meetings',
      operation: 'update',
      filters: { id: meeting.id },
      data: {
        date: meeting.date,
        status: meeting.status,
        attendees: meeting.attendees,
        agenda: meeting.agenda,
        gratitude_list: meeting.gratitudeList,
        brainstorms: meeting.brainstorms,
        decisions: meeting.decisions,
        fun_plan: meeting.funPlan,
        notes: meeting.notes,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'family_meetings',
      operation: 'insert',
      data: {
        id: generateId(),
        date: meeting.date,
        status: meeting.status,
        attendees: meeting.attendees,
        agenda: meeting.agenda,
        gratitude_list: meeting.gratitudeList,
        brainstorms: meeting.brainstorms,
        decisions: meeting.decisions,
        fun_plan: meeting.funPlan,
        notes: meeting.notes,
        created_at: now,
      },
    });
  }
}

export async function deleteFamilyMeeting(id: string) {
  return await dbQuery({ table: 'family_meetings',
    operation: 'delete',
    filters: { id },
  });
}

// ============================================
// 成长目标 CRUD
// ============================================

export async function getGrowthGoals(childId?: string) {
  const filters = childId ? { child_id: childId } : undefined;
  const data = await dbQuery({ table: 'growth_goals',
    operation: 'select',
    filters,
    order: { column: 'created_at', ascending: false }
  });
  return data;
}

export async function getActiveGoals(childId: string) {
  return await dbQuery({ table: 'growth_goals',
    operation: 'select',
    filters: { child_id: childId, status: 'active' },
    order: { column: 'created_at', ascending: false }
  });
}

export async function saveGrowthGoal(goal: {
  id?: string;
  childId: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  priority?: string;
  progress?: number;
  nodes?: any[];
  startDate?: string;
  targetEndDate?: string;
  actualEndDate?: string;
  totalDuration?: number;
  completedAt?: string;
}) {
  const now = new Date().toISOString();

  if (goal.id) {
    // 更新
    return await dbQuery({ table: 'growth_goals',
      operation: 'update',
      filters: { id: goal.id },
      data: {
        child_id: goal.childId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status,
        priority: goal.priority,
        progress: goal.progress,
        nodes: goal.nodes,
        start_date: goal.startDate,
        target_end_date: goal.targetEndDate,
        actual_end_date: goal.actualEndDate,
        total_duration: goal.totalDuration,
        completed_at: goal.completedAt,
        updated_at: now,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'growth_goals',
      operation: 'insert',
      data: {
        id: generateId(),
        child_id: goal.childId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        status: goal.status || 'active',
        priority: goal.priority,
        progress: goal.progress || 0,
        nodes: goal.nodes,
        start_date: goal.startDate,
        target_end_date: goal.targetEndDate,
        actual_end_date: goal.actualEndDate,
        total_duration: goal.totalDuration,
        completed_at: goal.completedAt,
        created_at: now,
        updated_at: now,
      },
    });
  }
}

export async function deleteGrowthGoal(id: string) {
  return await dbQuery({ table: 'growth_goals',
    operation: 'delete',
    filters: { id },
  });
}

// ============================================
// 聊天记录 CRUD
// ============================================

export async function getChatMessages() {
  return await dbQuery({ table: 'chat_messages',
    operation: 'select',
    order: { column: 'created_at', ascending: true },
    limit: 50
  });
}

export async function saveChatMessage(message: {
  role: string;
  content: string;
  references?: any[];
}) {
  return await dbQuery({ table: 'chat_messages',
    operation: 'insert',
    data: {
      id: generateId(),
      role: message.role,
      content: message.content,
      references: message.references,
    },
  });
}

export async function clearChatMessages() {
  // 获取所有消息并逐个删除
  const messages = await getChatMessages();
  for (const msg of messages) {
    await dbQuery({ table: 'chat_messages',
      operation: 'delete',
      filters: { id: msg.id }
    });
  }
}

// ============================================
// 话术卡片 CRUD
// ============================================

export async function getPhraseCards(category?: string) {
  const filters = category ? { category } : undefined;
  const data = await dbQuery({ table: 'phrase_cards',
    operation: 'select',
    filters
  });
  return data;
}

export async function getFavoritePhrases() {
  return await dbQuery({ table: 'phrase_cards',
    operation: 'select',
    filters: { is_favorite: true }
  });
}

export async function savePhraseCard(card: {
  id?: string;
  category: string;
  title: string;
  content: string;
  situation?: string;
  sourceChapter?: string;
  isFavorite?: boolean;
  tags?: string[];
}) {
  if (card.id) {
    // 更新
    return await dbQuery({ table: 'phrase_cards',
      operation: 'update',
      filters: { id: card.id },
      data: {
        category: card.category,
        title: card.title,
        content: card.content,
        situation: card.situation,
        source_chapter: card.sourceChapter,
        is_favorite: card.isFavorite,
        tags: card.tags,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'phrase_cards',
      operation: 'insert',
      data: {
        id: generateId(),
        category: card.category,
        title: card.title,
        content: card.content,
        situation: card.situation,
        source_chapter: card.sourceChapter,
        is_favorite: card.isFavorite || false,
        tags: card.tags || [],
      },
    });
  }
}

export async function togglePhraseFavorite(id: string, isFavorite: boolean) {
  return await dbQuery({ table: 'phrase_cards',
    operation: 'update',
    filters: { id },
    data: { is_favorite: isFavorite }
  });
}

// ============================================
// 任务模板 CRUD
// ============================================

export async function getTaskTemplates() {
  return await dbQuery({ table: 'task_templates', operation: 'select' });
}

export async function saveTaskTemplate(template: {
  id?: string;
  period: string;
  title: string;
  description?: string;
  icon?: string;
}) {
  if (template.id) {
    return await dbQuery({ table: 'task_templates',
      operation: 'update',
      filters: { id: template.id },
      data: {
        period: template.period,
        title: template.title,
        description: template.description,
        icon: template.icon,
      },
    });
  } else {
    return await dbQuery({ table: 'task_templates',
      operation: 'insert',
      data: {
        id: generateId(),
        period: template.period,
        title: template.title,
        description: template.description,
        icon: template.icon,
      },
    });
  }
}

// ============================================
// 陪伴笔记 CRUD
// ============================================

export async function getParentingNotes(childId?: string) {
  const filters = childId ? { child_id: childId } : undefined;
  const data = await dbQuery({ table: 'parenting_notes',
    operation: 'select',
    filters,
    order: { column: 'created_at', ascending: false }
  });
  return data;
}

export async function saveParentingNote(note: {
  id?: string;
  childId?: string;
  title: string;
  content: string;
  tags?: string[];
  isPinned?: boolean;
}) {
  const now = new Date().toISOString();

  if (note.id) {
    // 更新
    return await dbQuery({ table: 'parenting_notes',
      operation: 'update',
      filters: { id: note.id },
      data: {
        child_id: note.childId,
        title: note.title,
        content: note.content,
        tags: note.tags,
        is_pinned: note.isPinned,
        updated_at: now,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'parenting_notes',
      operation: 'insert',
      data: {
        id: generateId(),
        child_id: note.childId,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        is_pinned: note.isPinned || false,
        created_at: now,
        updated_at: now,
      },
    });
  }
}

export async function deleteParentingNote(id: string) {
  return await dbQuery({ table: 'parenting_notes',
    operation: 'delete',
    filters: { id },
  });
}

// ============================================
// 复盘记录 CRUD
// ============================================

export async function getReflectionRecords(childId?: string) {
  const filters = childId ? { child_id: childId } : undefined;
  const data = await dbQuery({ table: 'reflection_records',
    operation: 'select',
    filters,
    order: { column: 'date', ascending: false }
  });
  return data;
}

export async function saveReflectionRecord(record: {
  id?: string;
  childId?: string;
  title: string;
  date: string;
  situation: string;
  thoughts: string;
  feelings: string;
  actions: string;
  result: string;
  analysis: string;
  learnings: string;
  images?: string[];
  tags?: string[];
}) {
  const now = new Date().toISOString();

  if (record.id) {
    // 更新
    return await dbQuery({ table: 'reflection_records',
      operation: 'update',
      filters: { id: record.id },
      data: {
        child_id: record.childId,
        title: record.title,
        date: record.date,
        situation: record.situation,
        thoughts: record.thoughts,
        feelings: record.feelings,
        actions: record.actions,
        result: record.result,
        analysis: record.analysis,
        learnings: record.learnings,
        images: record.images,
        tags: record.tags,
        updated_at: now,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'reflection_records',
      operation: 'insert',
      data: {
        id: generateId(),
        child_id: record.childId,
        title: record.title,
        date: record.date,
        situation: record.situation,
        thoughts: record.thoughts,
        feelings: record.feelings,
        actions: record.actions,
        result: record.result,
        analysis: record.analysis,
        learnings: record.learnings,
        images: record.images || [],
        tags: record.tags || [],
        created_at: now,
        updated_at: now,
      },
    });
  }
}

export async function deleteReflectionRecord(id: string) {
  return await dbQuery({ table: 'reflection_records',
    operation: 'delete',
    filters: { id },
  });
}

// ============================================
// 学习成长记录 CRUD
// ============================================

export async function getLearningRecords(childId?: string) {
  const filters = childId ? { child_id: childId } : undefined;
  const data = await dbQuery({ table: 'learning_records',
    operation: 'select',
    filters,
    order: { column: 'date', ascending: false }
  });
  return data;
}

export async function saveLearningRecord(record: {
  id?: string;
  childId?: string;
  title: string;
  source: string;
  sourceName?: string;
  date: string;
  summary: string;
  insights: string;
  application: string;
  actionPlan: string;
  images?: string[];
  tags?: string[];
}) {
  const now = new Date().toISOString();

  if (record.id) {
    // 更新
    return await dbQuery({ table: 'learning_records',
      operation: 'update',
      filters: { id: record.id },
      data: {
        child_id: record.childId,
        title: record.title,
        source: record.source,
        source_name: record.sourceName,
        date: record.date,
        summary: record.summary,
        insights: record.insights,
        application: record.application,
        action_plan: record.actionPlan,
        images: record.images,
        tags: record.tags,
        updated_at: now,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'learning_records',
      operation: 'insert',
      data: {
        id: generateId(),
        child_id: record.childId,
        title: record.title,
        source: record.source,
        source_name: record.sourceName,
        date: record.date,
        summary: record.summary,
        insights: record.insights,
        application: record.application,
        action_plan: record.actionPlan,
        images: record.images || [],
        tags: record.tags || [],
        created_at: now,
        updated_at: now,
      },
    });
  }
}

export async function deleteLearningRecord(id: string) {
  return await dbQuery({ table: 'learning_records',
    operation: 'delete',
    filters: { id },
  });
}

// ============================================
// 重要经验 CRUD
// ============================================

export async function getImportantExperiences(childId?: string) {
  const filters = childId ? { child_id: childId } : undefined;
  const data = await dbQuery({ table: 'important_experiences',
    operation: 'select',
    filters,
    order: { column: 'created_at', ascending: false }
  });
  return data;
}

export async function saveImportantExperience(experience: {
  id?: string;
  childId?: string;
  title: string;
  content: string;
  category: string;
  isStarred?: boolean;
  highlight?: string;
  relatedNotes?: string[];
  relatedReflections?: string[];
  images?: string[];
  tags?: string[];
}) {
  const now = new Date().toISOString();

  if (experience.id) {
    // 更新
    return await dbQuery({ table: 'important_experiences',
      operation: 'update',
      filters: { id: experience.id },
      data: {
        child_id: experience.childId,
        title: experience.title,
        content: experience.content,
        category: experience.category,
        is_starred: experience.isStarred,
        highlight: experience.highlight,
        related_notes: experience.relatedNotes,
        related_reflections: experience.relatedReflections,
        images: experience.images,
        tags: experience.tags,
        updated_at: now,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'important_experiences',
      operation: 'insert',
      data: {
        id: generateId(),
        child_id: experience.childId,
        title: experience.title,
        content: experience.content,
        category: experience.category,
        is_starred: experience.isStarred || false,
        highlight: experience.highlight,
        related_notes: experience.relatedNotes,
        related_reflections: experience.relatedReflections,
        images: experience.images || [],
        tags: experience.tags || [],
        created_at: now,
        updated_at: now,
      },
    });
  }
}

export async function deleteImportantExperience(id: string) {
  return await dbQuery({ table: 'important_experiences',
    operation: 'delete',
    filters: { id },
  });
}

export async function toggleExperienceStarred(id: string, isStarred: boolean) {
  return await dbQuery({ table: 'important_experiences',
    operation: 'update',
    filters: { id },
    data: { 
      is_starred: isStarred,
      updated_at: new Date().toISOString()
    }
  });
}

// ============================================
// 应用设置 CRUD
// ============================================

export async function getAppSettings() {
  return await dbQuerySingle({ table: 'app_settings', operation: 'select' });
}

export async function saveAppSettings(settings: {
  activeChildId?: string;
  knowledgeBase?: any[];
}) {
  const now = new Date().toISOString();

  // 检查是否已存在
  const existing = await getAppSettings();

  if (existing) {
    // 更新
    return await dbQuery({ table: 'app_settings',
      operation: 'update',
      filters: { id: existing.id },
      data: {
        active_child_id: settings.activeChildId,
        knowledge_base: settings.knowledgeBase,
        updated_at: now,
      },
    });
  } else {
    // 创建
    return await dbQuery({ table: 'app_settings',
      operation: 'insert',
      data: {
        id: generateId(),
        active_child_id: settings.activeChildId,
        knowledge_base: settings.knowledgeBase,
        created_at: now,
        updated_at: now,
      },
    });
  }
}
