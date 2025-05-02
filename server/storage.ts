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

// Import the DatabaseStorage from the separate file
import { DatabaseStorage } from './db-storage';

// Switch to the database storage implementation
export const storage = new DatabaseStorage();
