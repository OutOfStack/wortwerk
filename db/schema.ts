import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const learnerProgress = sqliteTable("learner_progress", {
  userId: text("user_id").primaryKey(),
  payload: text("payload").notNull(),
  updatedAt: integer("updated_at").notNull(),
  revision: integer("revision").notNull().default(0),
});

export const authUsers = sqliteTable('auth_users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at').notNull(),
});
export const authSessions = sqliteTable('auth_sessions', {
  tokenHash: text('token_hash').primaryKey(),
  userId: text('user_id').notNull().references(() => authUsers.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at').notNull(),
}, table => [index('idx_auth_sessions_expiry').on(table.expiresAt)]);
export const authLimits = sqliteTable('auth_limits', {
  key: text('key').primaryKey(),
  attempts: integer('attempts').notNull(),
  resetsAt: integer('resets_at').notNull(),
}, table => [index('idx_auth_limits_expiry').on(table.resetsAt)]);
