import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertDraftSchema, 
  insertParagraphSchema, 
  refinementOptionsSchema,
  compressionSchema
} from "@shared/schema";
import { generateVariants, refineParagraph, compressDraft, splitContent } from "./openai";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Drafts routes
  app.post("/api/drafts", async (req, res) => {
    try {
      const validatedData = insertDraftSchema.parse(req.body);
      const draft = await storage.createDraft(validatedData);
      res.status(201).json(draft);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/drafts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const draft = await storage.getDraftWithParagraphs(id);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      res.json(draft);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/drafts/:id/auto-split", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { content } = z.object({ content: z.string() }).parse(req.body);
      
      // Use OpenAI to smartly split content
      const paragraphs = await splitContent(content);
      
      // Get the existing paragraphs, if any
      const existingParagraphs = await storage.getParagraphsByDraftId(id);
      let position = existingParagraphs.length > 0 
        ? Math.max(...existingParagraphs.map(p => p.position)) + 1 
        : 1;
      
      // Create the new paragraphs
      for (const paragraph of paragraphs) {
        await storage.createParagraph({
          draftId: id,
          content: paragraph.content,
          position: position++,
          label: paragraph.label,
          isLocked: false
        });
      }
      
      res.json({ message: "Content split successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/drafts/:id/save", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // In a real app, we'd save the draft or update its status
      res.json({ message: "Draft saved successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/drafts/:id/compress", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { percentage } = compressionSchema.parse(req.body);
      
      // Get all paragraphs from the draft
      const draft = await storage.getDraftWithParagraphs(id);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      
      // Make sure all paragraphs are locked
      const allLocked = draft.paragraphs.every(p => p.isLocked);
      if (!allLocked) {
        return res.status(400).json({ message: "All paragraphs must be locked before compression" });
      }
      
      // Combine all paragraph content
      const fullContent = draft.paragraphs.map(p => p.content).join("\n\n");
      
      // Use OpenAI to compress the full draft
      const compressedContent = await compressDraft(fullContent, percentage);
      
      // Split the compressed content back into paragraphs
      const compressedParagraphs = await splitContent(compressedContent);
      
      // Update each paragraph with the compressed content
      // This is a simplistic approach - in a real app we'd be more sophisticated
      // about mapping compressed content back to original paragraphs
      const minLength = Math.min(draft.paragraphs.length, compressedParagraphs.length);
      for (let i = 0; i < minLength; i++) {
        await storage.updateParagraph(draft.paragraphs[i].id, {
          ...draft.paragraphs[i],
          content: compressedParagraphs[i].content
        });
      }
      
      // If there are fewer compressed paragraphs, update the remaining ones
      if (compressedParagraphs.length < draft.paragraphs.length) {
        for (let i = compressedParagraphs.length; i < draft.paragraphs.length; i++) {
          await storage.deleteParagraph(draft.paragraphs[i].id);
        }
      }
      
      res.json({ message: "Draft compressed successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export routes
  app.get("/api/drafts/:id/export/markdown", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const draft = await storage.getDraftWithParagraphs(id);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      
      // Generate markdown
      const markdown = draft.paragraphs.map(p => p.content).join("\n\n");
      
      res.setHeader('Content-Type', 'text/markdown');
      res.send(markdown);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/drafts/:id/export/docx", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      // In a real app, we'd generate a .docx file here
      res.json({ message: "DOCX export not implemented" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/drafts/:id/export/text", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const draft = await storage.getDraftWithParagraphs(id);
      if (!draft) {
        return res.status(404).json({ message: "Draft not found" });
      }
      
      // Plain text export
      const text = draft.paragraphs.map(p => p.content).join("\n\n");
      
      res.setHeader('Content-Type', 'text/plain');
      res.send(text);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Paragraphs routes
  app.post("/api/paragraphs", async (req, res) => {
    try {
      const validatedData = insertParagraphSchema.parse(req.body);
      const paragraph = await storage.createParagraph(validatedData);
      res.status(201).json(paragraph);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/paragraphs/:id/variants", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paragraph = await storage.getParagraph(id);
      if (!paragraph) {
        return res.status(404).json({ message: "Paragraph not found" });
      }
      
      // Generate variants using OpenAI
      const count = req.body.count || 3;
      const variants = await generateVariants(paragraph.content, count);
      
      // Save the variants to storage
      for (const variantContent of variants) {
        await storage.createVariant({
          paragraphId: id,
          content: variantContent,
          label: `Variant`,
          isSelected: false
        });
      }
      
      res.json({ message: "Variants generated successfully" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/paragraphs/:id/toggle-lock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paragraph = await storage.getParagraph(id);
      if (!paragraph) {
        return res.status(404).json({ message: "Paragraph not found" });
      }
      
      // Toggle the lock status
      const updatedParagraph = await storage.updateParagraph(id, {
        ...paragraph,
        isLocked: !paragraph.isLocked
      });
      
      res.json(updatedParagraph);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/paragraphs/:id/merge", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { variantIds } = z.object({ variantIds: z.array(z.number()) }).parse(req.body);
      
      const paragraph = await storage.getParagraph(id);
      if (!paragraph) {
        return res.status(404).json({ message: "Paragraph not found" });
      }
      
      // Get the selected variants
      const variants = await Promise.all(
        variantIds.map(variantId => storage.getVariant(variantId))
      );
      
      // Filter out any variants that weren't found
      const validVariants = variants.filter(v => v !== undefined);
      
      if (validVariants.length === 0) {
        return res.status(400).json({ message: "No valid variants selected" });
      }
      
      // For simplicity, we'll just use the content from the first selected variant
      // In a real app, we might merge the content from multiple variants
      const newContent = validVariants[0].content;
      
      // Update the paragraph with the new content
      const updatedParagraph = await storage.updateParagraph(id, {
        ...paragraph,
        content: newContent
      });
      
      res.json(updatedParagraph);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/paragraphs/:id/refine", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const options = refinementOptionsSchema.parse(req.body);
      
      const paragraph = await storage.getParagraph(id);
      if (!paragraph) {
        return res.status(404).json({ message: "Paragraph not found" });
      }
      
      // Refine the paragraph using OpenAI
      const refinedContent = await refineParagraph(paragraph.content, options);
      
      // Update the paragraph with the refined content
      const updatedParagraph = await storage.updateParagraph(id, {
        ...paragraph,
        content: refinedContent
      });
      
      res.json(updatedParagraph);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/paragraphs/:id/regenerate", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const paragraph = await storage.getParagraph(id);
      if (!paragraph) {
        return res.status(404).json({ message: "Paragraph not found" });
      }
      
      // Generate a new variant using OpenAI
      const variants = await generateVariants(paragraph.content, 1);
      
      if (variants.length === 0) {
        return res.status(500).json({ message: "Failed to generate new content" });
      }
      
      // Update the paragraph with the new content
      const updatedParagraph = await storage.updateParagraph(id, {
        ...paragraph,
        content: variants[0]
      });
      
      res.json(updatedParagraph);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Variants routes
  app.patch("/api/variants/:id/toggle-select", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const variant = await storage.getVariant(id);
      if (!variant) {
        return res.status(404).json({ message: "Variant not found" });
      }
      
      // Toggle the selection status
      const updatedVariant = await storage.updateVariant(id, {
        ...variant,
        isSelected: !variant.isSelected
      });
      
      res.json(updatedVariant);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
