import React, { useState, useRef } from 'react';
import { ParagraphCard } from '@/components/ui/paragraph-card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  ParagraphWithVariants, 
  InsertParagraph, 
  RefinementOptions 
} from '@shared/schema';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Clipboard, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DraftEditorProps {
  draftId: number;
  paragraphs: ParagraphWithVariants[];
  onParagraphsUpdated: () => void;
}

export function DraftEditor({ draftId, paragraphs, onParagraphsUpdated }: DraftEditorProps) {
  const [rawContent, setRawContent] = useState('');
  const [showTextarea, setShowTextarea] = useState(false);
  const [draggedParagraphId, setDraggedParagraphId] = useState<number | null>(null);
  const [dragOverParagraphId, setDragOverParagraphId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // API mutations
  const generateVariants = useMutation({
    mutationFn: async (paragraphId: number) => {
      await apiRequest('POST', `/api/paragraphs/${paragraphId}/variants`, {});
      onParagraphsUpdated();
    }
  });
  
  const toggleLock = useMutation({
    mutationFn: async (paragraphId: number) => {
      await apiRequest('PATCH', `/api/paragraphs/${paragraphId}/toggle-lock`, {});
      onParagraphsUpdated();
    }
  });
  
  const selectVariant = useMutation({
    mutationFn: async (variantId: number) => {
      await apiRequest('PATCH', `/api/variants/${variantId}/toggle-select`, {});
      onParagraphsUpdated();
    }
  });
  
  const mergeToDraft = useMutation({
    mutationFn: async ({ paragraphId, variantIds }: { paragraphId: number, variantIds: number[] }) => {
      await apiRequest('POST', `/api/paragraphs/${paragraphId}/merge`, { variantIds });
      onParagraphsUpdated();
    }
  });
  
  const refineParagraph = useMutation({
    mutationFn: async ({ paragraphId, options }: { paragraphId: number, options: RefinementOptions }) => {
      await apiRequest('POST', `/api/paragraphs/${paragraphId}/refine`, options);
      onParagraphsUpdated();
    }
  });
  
  const regenerateParagraph = useMutation({
    mutationFn: async (paragraphId: number) => {
      await apiRequest('POST', `/api/paragraphs/${paragraphId}/regenerate`, {});
      onParagraphsUpdated();
    }
  });
  
  const addParagraph = useMutation({
    mutationFn: async (paragraph: InsertParagraph) => {
      await apiRequest('POST', '/api/paragraphs', paragraph);
      onParagraphsUpdated();
    }
  });
  
  const autoSplit = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', `/api/drafts/${draftId}/auto-split`, { content });
      onParagraphsUpdated();
      setShowTextarea(false);
      setRawContent('');
    }
  });
  
  const handlePaste = () => {
    setShowTextarea(true);
    
    // Try to get content from clipboard
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText()
        .then(text => {
          setRawContent(text);
        })
        .catch(() => {
          toast({
            title: "Clipboard access denied",
            description: "Please paste your content manually",
            variant: "destructive"
          });
        });
    }
  };
  
  const handleAddParagraph = () => {
    addParagraph.mutate({
      draftId,
      content: "New paragraph content...",
      position: paragraphs.length + 1,
      label: `Paragraph ${paragraphs.length + 1}`,
      isLocked: false
    });
  };
  
  return (
    <div className="bg-white rounded-lg border border-neutral-200 mb-6">
      <div className="flex items-center justify-between border-b border-neutral-200 p-4">
        <h2 className="text-lg font-medium text-neutral-900">Draft Editor</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handlePaste}
          >
            <Clipboard className="mr-2 h-4 w-4" /> Paste
          </Button>
          <Button
            variant="default"
            onClick={() => {
              if (rawContent && showTextarea) {
                autoSplit.mutate(rawContent);
              } else if (paragraphs.length === 0) {
                setShowTextarea(true);
              } else {
                toast({
                  title: "Need content to split",
                  description: "Please paste content first or add paragraphs manually.",
                  variant: "default"
                });
              }
            }}
            disabled={autoSplit.isPending}
          >
            <Wand2 className="mr-2 h-4 w-4" /> Auto-Split
          </Button>
        </div>
      </div>
      
      <div className="p-4">
        {showTextarea && (
          <div className="mb-4">
            <Textarea
              value={rawContent}
              onChange={(e) => setRawContent(e.target.value)}
              placeholder="Paste or type your content here..."
              className="min-h-[200px]"
            />
            <div className="mt-2 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setShowTextarea(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => autoSplit.mutate(rawContent)}
                disabled={!rawContent || autoSplit.isPending}
              >
                {autoSplit.isPending ? "Processing..." : "Split Content"}
              </Button>
            </div>
          </div>
        )}
        
        {paragraphs.map((paragraph, index) => (
          <ParagraphCard
            key={paragraph.id}
            index={index}
            paragraph={paragraph}
            variants={paragraph.variants}
            isLoading={generateVariants.isPending}
            onGetTakes={() => generateVariants.mutate(paragraph.id)}
            onToggleLock={() => toggleLock.mutate(paragraph.id)}
            onSelectVariant={(id) => selectVariant.mutate(id)}
            onMergeToDraft={(variantIds) => 
              mergeToDraft.mutate({ paragraphId: paragraph.id, variantIds })}
            onRefine={(options) => 
              refineParagraph.mutate({ paragraphId: paragraph.id, options })}
            onRegenerate={() => regenerateParagraph.mutate(paragraph.id)}
          />
        ))}
        
        <Button
          onClick={handleAddParagraph}
          variant="outline"
          className="w-full border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center text-neutral-500 hover:text-neutral-700 hover:border-neutral-400"
        >
          + Add Paragraph
        </Button>
      </div>
    </div>
  );
}
