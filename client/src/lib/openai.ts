// Client-side helper for OpenAI API call formatting
import { RefinementOptions } from '@shared/schema';

export interface GenerateVariantsParams {
  content: string;
  count?: number;
}

export interface RefineParagraphParams {
  content: string;
  options: RefinementOptions;
}

export interface CompressDraftParams {
  content: string;
  percentage: number;
}

export interface SplitContentParams {
  content: string;
}

// We don't use OpenAI directly on the client - these are just type definitions
// for what gets sent to the server
export type OpenAIRequestType = 
  | 'generate-variants'
  | 'refine-paragraph'
  | 'compress-draft'
  | 'split-content';

export interface OpenAIRequest {
  type: OpenAIRequestType;
  params: 
    | GenerateVariantsParams 
    | RefineParagraphParams 
    | CompressDraftParams
    | SplitContentParams;
}
