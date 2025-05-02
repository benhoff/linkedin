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

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Draft methods
  getDraft(id: number): Promise<Draft | undefined>;
  getDraftWithParagraphs(id: number): Promise<DraftWithParagraphs | undefined>;
  createDraft(draft: InsertDraft): Promise<Draft>;
  updateDraft(id: number, draft: Partial<Draft>): Promise<Draft>;
  deleteDraft(id: number): Promise<void>;
  
  // Paragraph methods
  getParagraph(id: number): Promise<Paragraph | undefined>;
  getParagraphWithVariants(id: number): Promise<ParagraphWithVariants | undefined>;
  getParagraphsByDraftId(draftId: number): Promise<Paragraph[]>;
  createParagraph(paragraph: InsertParagraph): Promise<Paragraph>;
  updateParagraph(id: number, paragraph: Partial<Paragraph>): Promise<Paragraph>;
  deleteParagraph(id: number): Promise<void>;
  
  // Variant methods
  getVariant(id: number): Promise<Variant | undefined>;
  getVariantsByParagraphId(paragraphId: number): Promise<Variant[]>;
  createVariant(variant: InsertVariant): Promise<Variant>;
  updateVariant(id: number, variant: Partial<Variant>): Promise<Variant>;
  deleteVariant(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private drafts: Map<number, Draft>;
  private paragraphs: Map<number, Paragraph>;
  private variants: Map<number, Variant>;
  
  private userIdCounter: number;
  private draftIdCounter: number;
  private paragraphIdCounter: number;
  private variantIdCounter: number;
  
  constructor() {
    this.users = new Map();
    this.drafts = new Map();
    this.paragraphs = new Map();
    this.variants = new Map();
    
    this.userIdCounter = 1;
    this.draftIdCounter = 1;
    this.paragraphIdCounter = 1;
    this.variantIdCounter = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Draft methods
  async getDraft(id: number): Promise<Draft | undefined> {
    return this.drafts.get(id);
  }
  
  async getDraftWithParagraphs(id: number): Promise<DraftWithParagraphs | undefined> {
    const draft = this.drafts.get(id);
    if (!draft) return undefined;
    
    const paragraphs = await this.getParagraphsByDraftId(id);
    const paragraphsWithVariants: ParagraphWithVariants[] = [];
    
    for (const paragraph of paragraphs) {
      const variants = await this.getVariantsByParagraphId(paragraph.id);
      paragraphsWithVariants.push({
        ...paragraph,
        variants
      });
    }
    
    // Sort paragraphs by position
    paragraphsWithVariants.sort((a, b) => a.position - b.position);
    
    return {
      ...draft,
      paragraphs: paragraphsWithVariants
    };
  }
  
  async createDraft(insertDraft: InsertDraft): Promise<Draft> {
    const id = this.draftIdCounter++;
    const now = new Date();
    const draft: Draft = {
      ...insertDraft,
      id,
      isCompleted: false,
      createdAt: now,
      updatedAt: now
    };
    this.drafts.set(id, draft);
    return draft;
  }
  
  async updateDraft(id: number, draftUpdate: Partial<Draft>): Promise<Draft> {
    const draft = this.drafts.get(id);
    if (!draft) throw new Error(`Draft with id ${id} not found`);
    
    const updatedDraft: Draft = {
      ...draft,
      ...draftUpdate,
      updatedAt: new Date()
    };
    
    this.drafts.set(id, updatedDraft);
    return updatedDraft;
  }
  
  async deleteDraft(id: number): Promise<void> {
    this.drafts.delete(id);
  }
  
  // Paragraph methods
  async getParagraph(id: number): Promise<Paragraph | undefined> {
    return this.paragraphs.get(id);
  }
  
  async getParagraphWithVariants(id: number): Promise<ParagraphWithVariants | undefined> {
    const paragraph = this.paragraphs.get(id);
    if (!paragraph) return undefined;
    
    const variants = await this.getVariantsByParagraphId(id);
    
    return {
      ...paragraph,
      variants
    };
  }
  
  async getParagraphsByDraftId(draftId: number): Promise<Paragraph[]> {
    return Array.from(this.paragraphs.values())
      .filter(p => p.draftId === draftId)
      .sort((a, b) => a.position - b.position);
  }
  
  async createParagraph(insertParagraph: InsertParagraph): Promise<Paragraph> {
    const id = this.paragraphIdCounter++;
    const paragraph: Paragraph = {
      ...insertParagraph,
      id
    };
    this.paragraphs.set(id, paragraph);
    return paragraph;
  }
  
  async updateParagraph(id: number, paragraphUpdate: Partial<Paragraph>): Promise<Paragraph> {
    const paragraph = this.paragraphs.get(id);
    if (!paragraph) throw new Error(`Paragraph with id ${id} not found`);
    
    const updatedParagraph: Paragraph = {
      ...paragraph,
      ...paragraphUpdate
    };
    
    this.paragraphs.set(id, updatedParagraph);
    return updatedParagraph;
  }
  
  async deleteParagraph(id: number): Promise<void> {
    // Delete all variants for this paragraph
    const variantsToDelete = Array.from(this.variants.values())
      .filter(v => v.paragraphId === id);
    
    for (const variant of variantsToDelete) {
      this.variants.delete(variant.id);
    }
    
    // Delete the paragraph
    this.paragraphs.delete(id);
  }
  
  // Variant methods
  async getVariant(id: number): Promise<Variant | undefined> {
    return this.variants.get(id);
  }
  
  async getVariantsByParagraphId(paragraphId: number): Promise<Variant[]> {
    return Array.from(this.variants.values())
      .filter(v => v.paragraphId === paragraphId);
  }
  
  async createVariant(insertVariant: InsertVariant): Promise<Variant> {
    const id = this.variantIdCounter++;
    const variant: Variant = {
      ...insertVariant,
      id
    };
    this.variants.set(id, variant);
    return variant;
  }
  
  async updateVariant(id: number, variantUpdate: Partial<Variant>): Promise<Variant> {
    const variant = this.variants.get(id);
    if (!variant) throw new Error(`Variant with id ${id} not found`);
    
    const updatedVariant: Variant = {
      ...variant,
      ...variantUpdate
    };
    
    this.variants.set(id, updatedVariant);
    return updatedVariant;
  }
  
  async deleteVariant(id: number): Promise<void> {
    this.variants.delete(id);
  }
}

// Create a DatabaseStorage class that uses Drizzle ORM
import { db } from './db';
import { eq, and, desc, asc } from 'drizzle-orm';

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

// Switch to the database storage implementation
export const storage = new DatabaseStorage();
