import OpenAI from "openai";
import { splitIntoParagraphs, generateParagraphLabel, formatContent } from "@/lib/utils";
import { RefinementOptions } from "@shared/schema";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "mock_key_for_development"
});

// Mock implementation for local development
const MOCK_MODE = !process.env.OPENAI_API_KEY;

// Generate variants for a paragraph
export async function generateVariants(content: string, count: number = 3): Promise<string[]> {
  if (MOCK_MODE) {
    return mockGenerateVariants(content, count);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert content editor. Your task is to generate ${count} different variations of the given paragraph. 
          Each variation should preserve the main message but experiment with different tones, structures, and word choices.
          Output should be in JSON format with an array of paragraph variations.`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    if (Array.isArray(result.variations)) {
      return result.variations.map(formatContent);
    }
    
    // Fallback if result doesn't have expected format
    return mockGenerateVariants(content, count);
  } catch (error) {
    console.error("Error generating variants:", error);
    return mockGenerateVariants(content, count);
  }
}

// Refine a paragraph based on options
export async function refineParagraph(content: string, options: RefinementOptions): Promise<string> {
  if (MOCK_MODE) {
    return mockRefineParagraph(content, options);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert content editor. Your task is to refine the given paragraph according to these specifications:
          - Tone: ${options.tone}
          - Style: ${options.style}
          Preserve the core message but adjust the language to match the requested tone and style.
          Output should be just the revised paragraph text with no additional commentary.`
        },
        {
          role: "user",
          content: content
        }
      ]
    });
    
    return formatContent(response.choices[0].message.content);
  } catch (error) {
    console.error("Error refining paragraph:", error);
    return mockRefineParagraph(content, options);
  }
}

// Compress an entire draft
export async function compressDraft(content: string, percentage: number): Promise<string> {
  if (MOCK_MODE) {
    return mockCompressDraft(content, percentage);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert content editor. Your task is to compress the given text to approximately ${percentage}% of its original length.
          Preserve the main points and key information while removing redundancies and less important details.
          Maintain the paragraph structure of the original text.
          Output should be just the compressed text with no additional commentary.`
        },
        {
          role: "user",
          content: content
        }
      ]
    });
    
    return formatContent(response.choices[0].message.content);
  } catch (error) {
    console.error("Error compressing draft:", error);
    return mockCompressDraft(content, percentage);
  }
}

// Split content into paragraphs with labels
interface SplitParagraph {
  content: string;
  label: string;
}

export async function splitContent(content: string): Promise<SplitParagraph[]> {
  if (MOCK_MODE) {
    return mockSplitContent(content);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are an expert content editor. Your task is to split the given text into meaningful paragraphs.
          For each paragraph, provide a short descriptive label (e.g., Introduction, Main Point, Example, Conclusion).
          Output should be in JSON format with an array of objects, each with 'content' and 'label' properties.`
        },
        {
          role: "user",
          content: content
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(response.choices[0].message.content);
    
    if (Array.isArray(result.paragraphs)) {
      return result.paragraphs.map((p: any) => ({
        content: formatContent(p.content),
        label: p.label
      }));
    }
    
    // Fallback if result doesn't have expected format
    return mockSplitContent(content);
  } catch (error) {
    console.error("Error splitting content:", error);
    return mockSplitContent(content);
  }
}

// Mock implementations for local development
function mockGenerateVariants(content: string, count: number): string[] {
  const variations = [];
  
  for (let i = 0; i < count; i++) {
    // Create simple variations by adding or removing filler words
    let variation = content;
    
    if (i === 0) {
      variation = `Effectively, ${content} In essence, this is a crucial point.`;
    } else if (i === 1) {
      variation = `The fact is that ${content} This represents a key insight for consideration.`;
    } else {
      variation = `Consider this perspective: ${content} This understanding transforms our approach.`;
    }
    
    variations.push(formatContent(variation));
  }
  
  return variations;
}

function mockRefineParagraph(content: string, options: RefinementOptions): string {
  // Simple mock refinement based on options
  let refined = content;
  
  if (options.tone === 'professional') {
    refined = `It is important to note that ${content} Furthermore, this consideration warrants additional analysis.`;
  } else if (options.tone === 'casual') {
    refined = `So here's the thing: ${content} Pretty cool, right?`;
  } else if (options.tone === 'enthusiastic') {
    refined = `Wow! ${content} This is absolutely game-changing!`;
  }
  
  if (options.style === 'concise') {
    refined = refined.replace(/it is important to note that |furthermore|in essence|effectively|the fact is that /gi, '');
  } else if (options.style === 'detailed') {
    refined = `${refined} To elaborate further, this concept applies across multiple contexts and scenarios.`;
  }
  
  return formatContent(refined);
}

function mockCompressDraft(content: string, percentage: number): string {
  // Simple mock compression - remove some words and sentences
  const paragraphs = content.split('\n\n');
  const compressedParagraphs = paragraphs.map(p => {
    // Remove approximately (100 - percentage)% of the words
    const words = p.split(' ');
    const keepCount = Math.ceil(words.length * (percentage / 100));
    return words.slice(0, keepCount).join(' ');
  });
  
  return compressedParagraphs.join('\n\n');
}

function mockSplitContent(content: string): SplitParagraph[] {
  // Use a simple algorithm to split content into paragraphs
  const paragraphs = splitIntoParagraphs(content);
  
  return paragraphs.map((p, index) => ({
    content: p,
    label: generateParagraphLabel(p, index)
  }));
}
