import { pgTable, text, varchar, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";

// ============================================
// 孩子档案表
// ============================================
export const childProfiles = pgTable(
  "child_profiles",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    birth_date: varchar("birth_date", { length: 20 }),
    gender: varchar("gender", { length: 20 }),
    avatar: text("avatar"),
    nickname: varchar("nickname", { length: 100 }),
    personality: text("personality"),
    strengths: jsonb("strengths"),
    challenges: jsonb("challenges"),
    interests: jsonb("interests"),
    current_stage: varchar("current_stage", { length: 50 }),
    key_behaviors: jsonb("key_behaviors"),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("child_profiles_user_id_idx").on(table.user_id),
    index("child_profiles_name_idx").on(table.name),
    index("child_profiles_current_stage_idx").on(table.current_stage),
  ]
);

// ============================================
// 打卡记录表
// ============================================
export const checkInRecords = pgTable(
  "check_in_records",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    date: varchar("date", { length: 20 }).notNull(),
    period: varchar("period", { length: 20 }).notNull(),
    tasks: jsonb("tasks").notNull(),
    completed_at: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("check_in_records_user_id_idx").on(table.user_id),
    index("check_in_records_date_idx").on(table.date),
    index("check_in_records_period_idx").on(table.period),
  ]
);

// ============================================
// 情绪记录表
// ============================================
export const emotionRecords = pgTable(
  "emotion_records",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    child_id: varchar("child_id", { length: 36 }).notNull(),
    date: varchar("date", { length: 20 }).notNull(),
    time: varchar("time", { length: 10 }),
    emotion: varchar("emotion", { length: 20 }).notNull(),
    intensity: integer("intensity"),
    trigger: text("trigger"),
    behavior: text("behavior"),
    parent_response: text("parent_response"),
    result: varchar("result", { length: 20 }),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("emotion_records_user_id_idx").on(table.user_id),
    index("emotion_records_child_id_idx").on(table.child_id),
    index("emotion_records_date_idx").on(table.date),
    index("emotion_records_emotion_idx").on(table.emotion),
  ]
);

// ============================================
// 家庭会议表
// ============================================
export const familyMeetings = pgTable(
  "family_meetings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    date: varchar("date", { length: 20 }).notNull(),
    status: varchar("status", { length: 20 }).notNull(),
    attendees: jsonb("attendees"),
    agenda: jsonb("agenda"),
    gratitude_list: jsonb("gratitude_list"),
    brainstorms: jsonb("brainstorms"),
    decisions: jsonb("decisions"),
    fun_plan: text("fun_plan"),
    notes: text("notes"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("family_meetings_user_id_idx").on(table.user_id),
    index("family_meetings_date_idx").on(table.date),
    index("family_meetings_status_idx").on(table.status),
  ]
);

// ============================================
// 成长目标表
// ============================================
export const growthGoals = pgTable(
  "growth_goals",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    child_id: varchar("child_id", { length: 36 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 50 }),
    status: varchar("status", { length: 20 }).notNull().default("active"),
    priority: varchar("priority", { length: 20 }),
    progress: integer("progress").notNull().default(0),
    nodes: jsonb("nodes"),
    start_date: varchar("start_date", { length: 20 }),
    target_end_date: varchar("target_end_date", { length: 20 }),
    actual_end_date: varchar("actual_end_date", { length: 20 }),
    total_duration: integer("total_duration"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    completed_at: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    index("growth_goals_user_id_idx").on(table.user_id),
    index("growth_goals_child_id_idx").on(table.child_id),
    index("growth_goals_status_idx").on(table.status),
    index("growth_goals_category_idx").on(table.category),
  ]
);

// ============================================
// 聊天记录表
// ============================================
export const chatMessages = pgTable(
  "chat_messages",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(),
    content: text("content").notNull(),
    references: jsonb("references"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("chat_messages_user_id_idx").on(table.user_id),
    index("chat_messages_role_idx").on(table.role),
    index("chat_messages_created_at_idx").on(table.created_at),
  ]
);

// ============================================
// 话术卡片表
// ============================================
export const phraseCards = pgTable(
  "phrase_cards",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    situation: text("situation"),
    source_chapter: varchar("source_chapter", { length: 100 }),
    is_favorite: boolean("is_favorite").notNull().default(false),
    tags: jsonb("tags"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("phrase_cards_user_id_idx").on(table.user_id),
    index("phrase_cards_category_idx").on(table.category),
    index("phrase_cards_is_favorite_idx").on(table.is_favorite),
  ]
);

// ============================================
// 任务模板表
// ============================================
export const taskTemplates = pgTable(
  "task_templates",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    period: varchar("period", { length: 20 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("task_templates_user_id_idx").on(table.user_id),
    index("task_templates_period_idx").on(table.period),
  ]
);

// ============================================
// 陪伴笔记表
// ============================================
export const parentingNotes = pgTable(
  "parenting_notes",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    child_id: varchar("child_id", { length: 36 }),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    tags: jsonb("tags"),
    is_pinned: boolean("is_pinned").notNull().default(false),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("parenting_notes_user_id_idx").on(table.user_id),
    index("parenting_notes_child_id_idx").on(table.child_id),
    index("parenting_notes_is_pinned_idx").on(table.is_pinned),
    index("parenting_notes_created_at_idx").on(table.created_at),
  ]
);

// ============================================
// 复盘记录表
// ============================================
export const reflectionRecords = pgTable(
  "reflection_records",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    child_id: varchar("child_id", { length: 36 }),
    title: varchar("title", { length: 200 }).notNull(),
    date: varchar("date", { length: 20 }).notNull(),
    situation: text("situation").notNull(),
    thoughts: text("thoughts").notNull(),
    feelings: text("feelings").notNull(),
    actions: text("actions").notNull(),
    result: text("result").notNull(),
    analysis: text("analysis").notNull(),
    learnings: text("learnings").notNull(),
    images: jsonb("images"),
    tags: jsonb("tags"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("reflection_records_user_id_idx").on(table.user_id),
    index("reflection_records_child_id_idx").on(table.child_id),
    index("reflection_records_date_idx").on(table.date),
    index("reflection_records_created_at_idx").on(table.created_at),
  ]
);

// ============================================
// 学习成长记录表
// ============================================
export const learningRecords = pgTable(
  "learning_records",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    child_id: varchar("child_id", { length: 36 }),
    title: varchar("title", { length: 200 }).notNull(),
    source: varchar("source", { length: 20 }).notNull(),
    source_name: varchar("source_name", { length: 200 }),
    date: varchar("date", { length: 20 }).notNull(),
    summary: text("summary").notNull(),
    insights: text("insights").notNull(),
    application: text("application").notNull(),
    action_plan: text("action_plan").notNull(),
    images: jsonb("images"),
    tags: jsonb("tags"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("learning_records_user_id_idx").on(table.user_id),
    index("learning_records_child_id_idx").on(table.child_id),
    index("learning_records_source_idx").on(table.source),
    index("learning_records_date_idx").on(table.date),
  ]
);

// ============================================
// 重要经验表
// ============================================
export const importantExperiences = pgTable(
  "important_experiences",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    child_id: varchar("child_id", { length: 36 }),
    title: varchar("title", { length: 200 }).notNull(),
    content: text("content").notNull(),
    category: varchar("category", { length: 20 }).notNull(),
    is_starred: boolean("is_starred").notNull().default(false),
    highlight: text("highlight"),
    related_notes: jsonb("related_notes"),
    related_reflections: jsonb("related_reflections"),
    images: jsonb("images"),
    tags: jsonb("tags"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("important_experiences_user_id_idx").on(table.user_id),
    index("important_experiences_child_id_idx").on(table.child_id),
    index("important_experiences_category_idx").on(table.category),
    index("important_experiences_is_starred_idx").on(table.is_starred),
  ]
);

// ============================================
// 应用设置表（存储用户设置）
// ============================================
export const appSettings = pgTable(
  "app_settings",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull().unique(),
    active_child_id: varchar("active_child_id", { length: 36 }),
    knowledge_base: jsonb("knowledge_base"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("app_settings_user_id_idx").on(table.user_id),
    index("app_settings_active_child_id_idx").on(table.active_child_id),
  ]
);
