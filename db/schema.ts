import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    displayName: text("display_name"),
    avatarUrl: text("avatar_url"),
    googleSub: text("google_sub"),
    authProvider: text("auth_provider").notNull().default("email"),
    freeUsed: integer("free_used").notNull().default(0),
    createdAt: integer("created_at").notNull(),
    lastLoginAt: integer("last_login_at"),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    googleSubIdx: uniqueIndex("users_google_sub_idx").on(table.googleSub),
  })
);

export const loginCodes = sqliteTable(
  "login_codes",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    codeHash: text("code_hash").notNull(),
    attempts: integer("attempts").notNull().default(0),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
    usedAt: integer("used_at"),
    ipHash: text("ip_hash"),
  },
  (table) => ({
    emailCreatedIdx: index("login_codes_email_created_idx").on(
      table.email,
      table.createdAt
    ),
  })
);

export const oauthStates = sqliteTable(
  "oauth_states",
  {
    id: text("id").primaryKey(),
    provider: text("provider").notNull(),
    stateHash: text("state_hash").notNull(),
    verifierHash: text("verifier_hash").notNull(),
    redirectPath: text("redirect_path").notNull().default("/"),
    expiresAt: integer("expires_at").notNull(),
    createdAt: integer("created_at").notNull(),
    usedAt: integer("used_at"),
    ipHash: text("ip_hash"),
  },
  (table) => ({
    stateIdx: uniqueIndex("oauth_states_state_idx").on(table.stateHash),
    providerCreatedIdx: index("oauth_states_provider_created_idx").on(
      table.provider,
      table.createdAt
    ),
  })
);

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    createdAt: integer("created_at").notNull(),
    expiresAt: integer("expires_at").notNull(),
    revokedAt: integer("revoked_at"),
    userAgent: text("user_agent"),
    ipHash: text("ip_hash"),
  },
  (table) => ({
    userIdx: index("sessions_user_idx").on(table.userId),
    tokenIdx: uniqueIndex("sessions_token_idx").on(table.tokenHash),
  })
);

export const subscriptions = sqliteTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paypalSubscriptionId: text("paypal_subscription_id").notNull(),
    plan: text("plan").notNull(),
    status: text("status").notNull(),
    currentPeriodEnd: integer("current_period_end"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    paypalIdx: uniqueIndex("subscriptions_paypal_idx").on(
      table.paypalSubscriptionId
    ),
    userIdx: index("subscriptions_user_idx").on(table.userId),
  })
);

export const paypalWebhookEvents = sqliteTable("paypal_webhook_events", {
  id: text("id").primaryKey(),
  eventType: text("event_type").notNull(),
  processedAt: integer("processed_at").notNull(),
});

export const readings = sqliteTable(
  "readings",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    spreadId: text("spread_id").notNull(),
    spreadName: text("spread_name").notNull(),
    question: text("question").notNull().default(""),
    payload: text("payload").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => ({
    userCreatedIdx: index("readings_user_created_idx").on(
      table.userId,
      table.createdAt
    ),
  })
);
