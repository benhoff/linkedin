import React, { useState } from 'react';
import { Paragraph, Variant, RefinementOptions } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { VariantCard } from '@/components/ui/variant-card';
import { InlineDiffEditor } from '@/components/ui/inline-diff-editor';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  Lock, 
  LockOpen, 
  RotateCw, 
  ChevronDown 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ParagraphCardProps {
  index: number;
  paragraph: Paragraph;
  variants: Variant[];
  isLoading: boolean;
  onGetTakes: () => void;
  onToggleLock: () => void;
  onSelectVariant: (id: number) => void;
  onMergeToDraft: (selectedVariantIds: number[]) => void;
  onRefine: (options: RefinementOptions) => void;
  onRegenerate: () => void;
}

export function ParagraphCard({
  index,
  paragraph,
  variants,
  isLoading,
  onGetTakes,
  onToggleLock,
  onSelectVariant,
  onMergeToDraft,
  onRefine,
  onRegenerate
}: ParagraphCardProps) {
  const [mergingMode, setMergingMode] = useState(false);
  const [diffContent, setDiffContent] = useState<string | null>(null);
  
  const selectedVariants = variants.filter(v => v.isSelected);
  const paragraphLabel = paragraph.label || `Paragraph ${index + 1}`;
  
  const handleMerge = () => {
    if (selectedVariants.length > 0) {
      setMergingMode(true);
      onMergeToDraft(selectedVariants.map(v => v.id));
    }
  };
  
  return (
    <div className={cn(
      "paragraph-card",
      paragraph.isLocked && "paragraph-card-locked"
    )}>
      <div className="card-header">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-medium">
            {index + 1}
          </span>
          <span className="ml-2 text-sm font-medium text-neutral-700">
            {paragraphLabel}
          </span>
          {paragraph.isLocked && (
            <Badge className="ml-2 bg-secondary bg-opacity-10 text-secondary">
              <Lock className="h-3 w-3 mr-1" /> Locked
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {!paragraph.isLocked && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onGetTakes}
              disabled={isLoading}
            >
              <RotateCw className="h-4 w-4 mr-1" /> 
              {isLoading ? "Loading..." : "Get Takes"}
            </Button>
          )}
          <Button
            variant={paragraph.isLocked ? "outline" : "secondary"}
            size="sm"
            onClick={onToggleLock}
          >
            {paragraph.isLocked ? (
              <>
                <LockOpen className="h-4 w-4 mr-1" /> Unlock
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-1" /> Lock
              </>
            )}
          </Button>
        </div>
      </div>
      
      <div className="p-4 bg-white">
        {mergingMode ? (
          <InlineDiffEditor
            originalContent={paragraph.content}
            newContent={diffContent || selectedVariants[0]?.content || paragraph.content}
            onRefine={(options) => onRefine(options)}
            onRegenerate={onRegenerate}
          />
        ) : (
          <>
            <div className="prose max-w-none">
              <p>{paragraph.content}</p>
            </div>
            
            {variants.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-neutral-700 mb-2">
                  Variants ({variants.length})
                </h3>
                <div className="variant-carousel">
                  {variants.map((variant, idx) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      index={idx}
                      isSelected={variant.isSelected}
                      onToggleSelect={onSelectVariant}
                    />
                  ))}
                </div>
                
                <div className="mt-3 flex justify-end">
                  <Button 
                    variant="default" 
                    onClick={handleMerge}
                    disabled={selectedVariants.length === 0}
                  >
                    Merge into Draft
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
