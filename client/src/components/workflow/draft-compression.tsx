import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Combine } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface DraftCompressionProps {
  draftId: number;
  isActive: boolean;
  onCompressionComplete: () => void;
}

export function DraftCompression({ draftId, isActive, onCompressionComplete }: DraftCompressionProps) {
  const [compressionPercentage, setCompressionPercentage] = useState(80);
  
  const compressDraft = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/drafts/${draftId}/compress`, {
        percentage: compressionPercentage
      });
      onCompressionComplete();
    }
  });
  
  return (
    <div className="bg-white rounded-lg border border-neutral-200 mb-8">
      <div className="border-b border-neutral-200 p-4">
        <h2 className="text-lg font-medium text-neutral-900">Draft Compression</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Once all paragraphs are locked, use this tool to compress your entire draft.
        </p>
      </div>
      
      <div className={`p-4 ${!isActive ? 'opacity-60' : ''}`} aria-disabled={!isActive}>
        <div className="flex items-center mb-4">
          <label 
            htmlFor="compression-slider" 
            className="block text-sm font-medium text-neutral-700 mr-3 w-32"
          >
            Target Length:
          </label>
          <div className="flex-1">
            <Slider
              id="compression-slider"
              min={50}
              max={100}
              step={5}
              defaultValue={[compressionPercentage]}
              onValueChange={(value) => setCompressionPercentage(value[0])}
              disabled={!isActive || compressDraft.isPending}
              className="w-full"
            />
          </div>
          <span className="text-sm font-medium text-neutral-700 ml-3 w-16">
            {compressionPercentage}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm text-neutral-500">
              {isActive 
                ? "Combine your draft to make it more concise" 
                : "All paragraphs must be locked before compression"}
            </span>
          </div>
          <Button
            onClick={() => compressDraft.mutate()}
            disabled={!isActive || compressDraft.isPending}
            className={!isActive ? "bg-neutral-400 cursor-not-allowed" : ""}
          >
            <Combine className="mr-2 h-4 w-4" /> 
            {compressDraft.isPending ? "Processing..." : "Shorten Entire Draft"}
          </Button>
        </div>
      </div>
    </div>
  );
}
