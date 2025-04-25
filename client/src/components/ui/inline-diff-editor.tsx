import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCw, ChevronDown } from 'lucide-react';
import { RefinementOptions, ToneOption, StyleOption } from '@shared/schema';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface InlineDiffEditorProps {
  originalContent: string;
  newContent: string;
  onRefine: (options: RefinementOptions) => void;
  onRegenerate: () => void;
}

export function InlineDiffEditor({ 
  originalContent, 
  newContent, 
  onRefine,
  onRegenerate 
}: InlineDiffEditorProps) {
  const [currentContent, setCurrentContent] = useState(newContent);
  
  // Simple diff visualization
  // In a real app, we'd use a proper diffing library
  const simpleDiff = (original: string, updated: string): JSX.Element => {
    // This is just a placeholder implementation
    // A real implementation would use a proper diff algorithm
    return (
      <p>
        {updated.split(' ').map((word, index) => {
          if (!original.includes(word)) {
            return <span key={index} className="diff-added">{word} </span>;
          } else if (index % 5 === 0 && !original.startsWith(word)) {
            // Just to show some removed content for the demo
            return (
              <React.Fragment key={index}>
                <span className="diff-removed">original text </span>
                <span>{word} </span>
              </React.Fragment>
            );
          }
          return <span key={index}>{word} </span>;
        })}
      </p>
    );
  };

  const toneOptions: ToneOption[] = [
    'professional', 
    'casual', 
    'enthusiastic', 
    'authoritative', 
    'friendly'
  ];
  
  const styleOptions: StyleOption[] = [
    'concise', 
    'detailed', 
    'storytelling', 
    'analytical', 
    'persuasive'
  ];
  
  return (
    <div className="border border-neutral-200 rounded-md p-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-neutral-700">Merge Editor</h3>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Refine <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Tone</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {toneOptions.map((tone) => (
                      <DropdownMenuItem 
                        key={tone}
                        onClick={() => onRefine({ tone, style: 'concise' })}
                      >
                        {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <span>Style</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    {styleOptions.map((style) => (
                      <DropdownMenuItem 
                        key={style}
                        onClick={() => onRefine({ tone: 'professional', style })}
                      >
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRegenerate}
          >
            <RotateCw className="mr-1 h-4 w-4" /> Regenerate
          </Button>
        </div>
      </div>
      
      <div className="bg-neutral-50 p-2 rounded-md text-sm text-neutral-700 mb-3">
        {simpleDiff(originalContent, currentContent)}
      </div>
      
      <div className="prose max-w-none">
        <p>{currentContent}</p>
      </div>
    </div>
  );
}
