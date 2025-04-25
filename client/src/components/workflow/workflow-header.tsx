import React from 'react';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Save, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WorkflowHeaderProps {
  title: string;
  description: string;
  draftId: number;
  onSave: () => void;
}

export function WorkflowHeader({ 
  title, 
  description, 
  draftId, 
  onSave 
}: WorkflowHeaderProps) {
  const saveDraft = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/drafts/${draftId}/save`, {});
      onSave();
    }
  });
  
  return (
    <div className="md:flex md:items-center md:justify-between mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
          {title}
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          {description}
        </p>
      </div>
      <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
        <Button 
          variant="outline" 
          onClick={() => saveDraft.mutate()}
          disabled={saveDraft.isPending}
        >
          <Save className="mr-2 h-4 w-4" />
          {saveDraft.isPending ? "Saving..." : "Save Draft"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              Export
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              Markdown
            </DropdownMenuItem>
            <DropdownMenuItem>
              Word Document
            </DropdownMenuItem>
            <DropdownMenuItem>
              Copy to Clipboard
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
