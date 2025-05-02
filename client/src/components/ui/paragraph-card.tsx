import React, { useState, useRef, useEffect } from 'react';
import { Paragraph, Variant, RefinementOptions } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { VariantCard } from '@/components/ui/variant-card';
import { InlineDiffEditor } from '@/components/ui/inline-diff-editor';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { 
  Lock, 
  LockOpen, 
  RotateCw, 
  ChevronDown,
  Edit,
  CheckCircle,
  XCircle,
  GripVertical
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
  onUpdateContent: (content: string) => void;
  onUpdateLabel: (label: string) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
  isDraggable?: boolean;
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
  onRegenerate,
  onUpdateContent,
  onUpdateLabel,
  onDragStart,
  onDragEnd,
  isDraggable = true
}: ParagraphCardProps) {
  const [mergingMode, setMergingMode] = useState(false);
  const [diffContent, setDiffContent] = useState<string | null>(null);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [editedLabel, setEditedLabel] = useState('');
  const [editedContent, setEditedContent] = useState('');
  
  const selectedVariants = variants.filter(v => v.isSelected);
  const paragraphLabel = paragraph.label || `Paragraph ${index + 1}`;
  
  const handleMerge = () => {
    if (selectedVariants.length > 0) {
      setMergingMode(true);
      onMergeToDraft(selectedVariants.map(v => v.id));
    }
  };
  
  const handleStartEditLabel = () => {
    setEditedLabel(paragraphLabel);
    setIsEditingLabel(true);
  };
  
  const handleSaveLabel = () => {
    onUpdateLabel(editedLabel);
    setIsEditingLabel(false);
  };
  
  const handleCancelEditLabel = () => {
    setIsEditingLabel(false);
  };
  
  const handleStartEditContent = () => {
    setEditedContent(paragraph.content);
    setIsEditingContent(true);
  };
  
  const handleSaveContent = () => {
    onUpdateContent(editedContent);
    setIsEditingContent(false);
  };
  
  const handleCancelEditContent = () => {
    setIsEditingContent(false);
  };
  
  return (
    <div 
      className={cn(
        "paragraph-card relative",
        paragraph.isLocked && "paragraph-card-locked"
      )}
      draggable={isDraggable && !paragraph.isLocked}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      data-paragraph-id={paragraph.id}
    >
      {isDraggable && !paragraph.isLocked && (
        <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab opacity-50 hover:opacity-100">
          <GripVertical className="h-4 w-4 text-neutral-400" />
        </div>
      )}
      
      <div className="card-header">
        <div className="flex items-center">
          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary text-white text-xs font-medium">
            {index + 1}
          </span>
          
          {isEditingLabel ? (
            <div className="ml-2 flex items-center">
              <Input
                className="h-8 text-sm"
                value={editedLabel}
                onChange={(e) => setEditedLabel(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveLabel();
                  if (e.key === 'Escape') handleCancelEditLabel();
                }}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2" 
                onClick={handleSaveLabel}
              >
                <CheckCircle className="h-4 w-4 text-green-500" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2" 
                onClick={handleCancelEditLabel}
              >
                <XCircle className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="ml-2 flex items-center">
              <span className="text-sm font-medium text-neutral-700">
                {paragraphLabel}
              </span>
              {!paragraph.isLocked && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-1 ml-1" 
                  onClick={handleStartEditLabel}
                >
                  <Edit className="h-3 w-3 text-neutral-400" />
                </Button>
              )}
            </div>
          )}
          
          {paragraph.isLocked && (
            <Badge className="ml-2 bg-secondary bg-opacity-10 text-secondary">
              <Lock className="h-3 w-3 mr-1" /> Locked
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {!paragraph.isLocked && (
            <>
              <Button 
                variant="outline" 
                size="sm"
                onClick={onGetTakes}
                disabled={isLoading}
              >
                <RotateCw className="h-4 w-4 mr-1" /> 
                {isLoading ? "Loading..." : "Get Takes"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEditContent}
                disabled={isEditingContent}
              >
                <Edit className="h-4 w-4 mr-1" /> Edit
              </Button>
            </>
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
        ) : isEditingContent ? (
          <div className="mb-4">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[120px] mb-2"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleCancelEditContent}
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={handleSaveContent}
              >
                Save Changes
              </Button>
            </div>
          </div>
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
                      isSelected={variant.isSelected ? true : false}
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
