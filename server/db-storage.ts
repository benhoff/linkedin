import { 
  users,
  drafts,
  paragraphs,
  variants,
  User, 
  InsertUser, 
  Draft, 
  InsertDraft, 
  Paragraph, 
  InsertParagraph, 
  Variant, 
  InsertVariant, 
  DraftWithParagraphs, 
  ParagraphWithVariants 
} from "@shared/schema";
import { db } from './db';
import { eq } from 'drizzle-orm';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Draft methods
  async getDraft(id: number): Promise<Draft | undefined> {
    const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
    return draft || undefined;
  }

  async getDraftWithParagraphs(id: number): Promise<DraftWithParagraphs | undefined> {
    const [draft] = await db.select().from(drafts).where(eq(drafts.id, id));
    if (!draft) return undefined;

    const paragraphsList = await db.select()
      .from(paragraphs)
      .where(eq(paragraphs.draftId, id))
      .orderBy(paragraphs.position);

    const paragraphsWithVariants: ParagraphWithVariants[] = [];

    for (const paragraph of paragraphsList) {
      const variantsList = await db.select()
        .from(variants)
        .where(eq(variants.paragraphId, paragraph.id));

      paragraphsWithVariants.push({
        ...paragraph,
        variants: variantsList
      });
    }

    return {
      ...draft,
      paragraphs: paragraphsWithVariants
    };
  }

  async createDraft(insertDraft: InsertDraft): Promise<Draft> {
    const [draft] = await db.insert(drafts).values({
      ...insertDraft,
      isCompleted: false,
    }).returning();
    
    return draft;
  }

  async updateDraft(id: number, draftUpdate: Partial<Draft>): Promise<Draft> {
    const [updatedDraft] = await db.update(drafts)
      .set({
        ...draftUpdate,
        updatedAt: new Date()
      })
      .where(eq(drafts.id, id))
      .returning();
    
    if (!updatedDraft) {
      throw new Error(`Draft with id ${id} not found`);
    }
    
    return updatedDraft;
  }

  async deleteDraft(id: number): Promise<void> {
    // First delete all related paragraphs
    const paragraphsList = await db.select({ id: paragraphs.id })
      .from(paragraphs)
      .where(eq(paragraphs.draftId, id));
    
    for (const paragraph of paragraphsList) {
      await this.deleteParagraph(paragraph.id);
    }
    
    // Then delete the draft
    await db.delete(drafts).where(eq(drafts.id, id));
  }

  // Paragraph methods
  async getParagraph(id: number): Promise<Paragraph | undefined> {
    const [paragraph] = await db.select().from(paragraphs).where(eq(paragraphs.id, id));
    return paragraph || undefined;
  }

  async getParagraphWithVariants(id: number): Promise<ParagraphWithVariants | undefined> {
    const [paragraph] = await db.select().from(paragraphs).where(eq(paragraphs.id, id));
    if (!paragraph) return undefined;

    const variantsList = await db.select()
      .from(variants)
      .where(eq(variants.paragraphId, id));

    return {
      ...paragraph,
      variants: variantsList
    };
  }

  async getParagraphsByDraftId(draftId: number): Promise<Paragraph[]> {
    return db.select()
      .from(paragraphs)
      .where(eq(paragraphs.draftId, draftId))
      .orderBy(paragraphs.position);
  }

  async createParagraph(insertParagraph: InsertParagraph): Promise<Paragraph> {
    const [paragraph] = await db.insert(paragraphs)
      .values(insertParagraph)
      .returning();
    
    return paragraph;
  }

  async updateParagraph(id: number, paragraphUpdate: Partial<Paragraph>): Promise<Paragraph> {
    const [updatedParagraph] = await db.update(paragraphs)
      .set(paragraphUpdate)
      .where(eq(paragraphs.id, id))
      .returning();
    
    if (!updatedParagraph) {
      throw new Error(`Paragraph with id ${id} not found`);
    }
    
    return updatedParagraph;
  }

  async deleteParagraph(id: number): Promise<void> {
    // First delete all variants for this paragraph
    await db.delete(variants).where(eq(variants.paragraphId, id));
    
    // Then delete the paragraph
    await db.delete(paragraphs).where(eq(paragraphs.id, id));
  }

  // Variant methods
  async getVariant(id: number): Promise<Variant | undefined> {
    const [variant] = await db.select().from(variants).where(eq(variants.id, id));
    return variant || undefined;
  }

  async getVariantsByParagraphId(paragraphId: number): Promise<Variant[]> {
    return db.select()
      .from(variants)
      .where(eq(variants.paragraphId, paragraphId));
  }

  async createVariant(insertVariant: InsertVariant): Promise<Variant> {
    const [variant] = await db.insert(variants)
      .values(insertVariant)
      .returning();
    
    return variant;
  }

  async updateVariant(id: number, variantUpdate: Partial<Variant>): Promise<Variant> {
    const [updatedVariant] = await db.update(variants)
      .set(variantUpdate)
      .where(eq(variants.id, id))
      .returning();
    
    if (!updatedVariant) {
      throw new Error(`Variant with id ${id} not found`);
    }
    
    return updatedVariant;
  }

  async deleteVariant(id: number): Promise<void> {
    await db.delete(variants).where(eq(variants.id, id));
  }
}