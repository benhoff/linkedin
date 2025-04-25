import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Draft schema
export const drafts = pgTable("drafts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isCompleted: boolean("is_completed").default(false),
});

export const insertDraftSchema = createInsertSchema(drafts).pick({
  title: true,
  userId: true,
});

// Paragraph schema
export const paragraphs = pgTable("paragraphs", {
  id: serial("id").primaryKey(),
  draftId: integer("draft_id").references(() => drafts.id).notNull(),
  content: text("content").notNull(),
  position: integer("position").notNull(),
  label: text("label"),
  isLocked: boolean("is_locked").default(false),
});

export const insertParagraphSchema = createInsertSchema(paragraphs).pick({
  draftId: true,
  content: true,
  position: true,
  label: true,
  isLocked: true,
});

// Paragraph variants
export const variants = pgTable("variants", {
  id: serial("id").primaryKey(),
  paragraphId: integer("paragraph_id").references(() => paragraphs.id).notNull(),
  content: text("content").notNull(),
  label: text("label"),
  isSelected: boolean("is_selected").default(false),
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
