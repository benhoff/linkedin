import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Draft, DraftWithParagraphs } from '@shared/schema';
import { WorkflowHeader } from '@/components/workflow/workflow-header';
import { WorkflowSteps } from '@/components/workflow/workflow-steps';
import { DraftEditor } from '@/components/workflow/draft-editor';
import { DraftCompression } from '@/components/workflow/draft-compression';
import { ExportOptions } from '@/components/workflow/export-options';
import { useToast } from '@/hooks/use-toast';

export default function DraftEdit() {
  const [currentStep, setCurrentStep] = useState(0);
  const [draftId, setDraftId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Create a new draft or get existing one
  const createDraft = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/drafts', {
        title: 'Untitled Draft',
        userId: 1 // In a real app, this would come from auth
      });
      const data = await response.json();
      return data as Draft;
    }
  });
  
  // Create initial draft if none exists
  useEffect(() => {
    if (!draftId) {
      createDraft.mutate(undefined, {
        onSuccess: (data) => {
          setDraftId(data.id);
        },
        onError: (error) => {
          toast({
            title: "Error creating draft",
            description: error.message,
            variant: "destructive"
          });
        }
      });
    }
  }, []);
  
  // Get current draft with paragraphs
  const { data: draft, isLoading, refetch } = useQuery({
    queryKey: draftId ? [`/api/drafts/${draftId}`] : null,
    enabled: !!draftId
  });
  
  const paragraphs = (draft as DraftWithParagraphs)?.paragraphs || [];
  
  // Determine current workflow step
  useEffect(() => {
    if (paragraphs.length > 0) {
      // If any paragraphs have variants, we're at generate step
      if (paragraphs.some(p => p.variants.length > 0)) {
        setCurrentStep(1);
      }
      
      // If any paragraphs are locked, we're at refine step
      if (paragraphs.some(p => p.isLocked)) {
        setCurrentStep(2);
      }
      
      // If all paragraphs are locked, we're at compress step
      if (paragraphs.length > 0 && paragraphs.every(p => p.isLocked)) {
        setCurrentStep(3);
      }
    }
  }, [paragraphs]);
  
  // Determine if compression is active (all paragraphs are locked)
  const isCompressionActive = paragraphs.length > 0 && paragraphs.every(p => p.isLocked);
  
  if (isLoading || !draftId) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-64 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <WorkflowHeader
          title="Draft Edit & Refinement Pipeline"
          description="Paste or compose your post, refine each paragraph, then tighten the full draft."
          draftId={draftId}
          onSave={() => {
            toast({
              title: "Draft saved",
              description: "Your draft has been saved successfully."
            });
          }}
        />
        
        <WorkflowSteps currentStep={currentStep} />
        
        <DraftEditor
          draftId={draftId}
          paragraphs={paragraphs}
          onParagraphsUpdated={refetch}
        />
        
        <DraftCompression
          draftId={draftId}
          isActive={isCompressionActive}
          onCompressionComplete={refetch}
        />
        
        <ExportOptions draftId={draftId} />
      </div>
    </div>
  );
}
