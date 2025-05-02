import {
  sqliteTable,
  text,
  integer
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Draft schema
export const drafts = sqliteTable("drafts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(strftime('%s','now'))`),
  isCompleted: integer("is_completed").default(sql`(0)`),

});

export const insertDraftSchema = createInsertSchema(drafts).pick({
  title: true,
}).extend({
  userId: z.number().nullable().optional(),
});

// Paragraph schema
export const paragraphs = sqliteTable("paragraphs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  draftId: integer("draft_id").references(() => drafts.id).notNull(),
  content: text("content").notNull(),
  position: integer("position").notNull(),
  label: text("label"),
  isLocked: integer("is_locked").default(sql`(0)`),

});

export const insertParagraphSchema = createInsertSchema(paragraphs).pick({
  draftId: true,
  content: true,
  position: true,
  label: true,
  isLocked: true,
});

// Paragraph variants
export const variants = sqliteTable("variants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  paragraphId: integer("paragraph_id").references(() => paragraphs.id).notNull(),
  content: text("content").notNull(),
  label: text("label"),
  isSelected: integer("is_selected").default(sql`(0)`),

});

export const insertVariantSchema = createInsertSchema(variants).pick({
  paragraphId: true,
  content: true,
  label: true,
  isSelected: true,
});

// Define types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Draft = typeof drafts.$inferSelect;
export type InsertDraft = z.infer<typeof insertDraftSchema>;

export type Paragraph = typeof paragraphs.$inferSelect;
export type InsertParagraph = z.infer<typeof insertParagraphSchema>;

export type Variant = typeof variants.$inferSelect;
export type InsertVariant = z.infer<typeof insertVariantSchema>;

// API request/response types for frontend consumption
export type DraftWithParagraphs = Draft & {
  paragraphs: ParagraphWithVariants[];
};

export type ParagraphWithVariants = Paragraph & {
  variants: Variant[];
};

// OpenAI API Types
export type ToneOption = 'professional' | 'casual' | 'enthusiastic' | 'authoritative' | 'friendly';
export type StyleOption = 'concise' | 'detailed' | 'storytelling' | 'analytical' | 'persuasive';

export const refinementOptionsSchema = z.object({
  tone: z.enum(['professional', 'casual', 'enthusiastic', 'authoritative', 'friendly']),
  style: z.enum(['concise', 'detailed', 'storytelling', 'analytical', 'persuasive']),
});

export type RefinementOptions = z.infer<typeof refinementOptionsSchema>;

export const compressionSchema = z.object({
  draftId: z.number(),
  percentage: z.number().min(50).max(100)
});

export type Compression = z.infer<typeof compressionSchema>;
