import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Simple text splitting function for paragraph detection
export function splitIntoParagraphs(text: string): string[] {
  // Split on double newlines, then filter out empty strings
  return text
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p.length > 0);
}

// Simple function to auto-generate a label based on paragraph content
export function generateParagraphLabel(content: string, index: number): string {
  const firstWords = content.split(' ').slice(0, 3).join(' ');
  
  if (index === 0) {
    return 'Introduction';
  } else if (content.length < 100) {
    return firstWords + '...';
  } else {
    // Try to be slightly smarter about longer paragraphs
    if (content.toLowerCase().includes('conclusion')) {
      return 'Conclusion';
    } else if (content.toLowerCase().includes('summary')) {
      return 'Summary';
    } else if (content.toLowerCase().includes('therefore') || content.toLowerCase().includes('finally')) {
      return 'Summary Point';
    } else if (content.toLowerCase().includes('example') || content.toLowerCase().includes('for instance')) {
      return 'Example';
    } else {
      return `Point ${index + 1}`;
    }
  }
}

// Format with proper punctuation and spacing
export function formatContent(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?])/g, '$1')
    .trim();
}
