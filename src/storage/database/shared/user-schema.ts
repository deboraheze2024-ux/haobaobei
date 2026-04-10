import { pgTable, varchar, timestamp, boolean, text } from "drizzle-orm/pg-core";

// ============================================
// 用户表
// ============================================
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    name: varchar("name", { length: 100 }),
    avatar: text("avatar"),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    last_login_at: timestamp("last_login_at", { withTimezone: true }),
  }
);

// ============================================
// 会话表（用于 JWT token 管理）
// ============================================
export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 36 }).primaryKey(),
    user_id: varchar("user_id", { length: 36 }).notNull(),
    token: text("token").notNull().unique(),
    expires_at: timestamp("expires_at", { withTimezone: true }).notNull(),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  }
);
