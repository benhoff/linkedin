import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  File, 
  Copy, 
  MoreHorizontal,
  Zap,
  Megaphone,
  Image
} from 'lucide-react';

interface ExportOptionsProps {
  draftId: number;
}

export function ExportOptions({ draftId }: ExportOptionsProps) {
  const { toast } = useToast();
  
  const exportMarkdown = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', `/api/drafts/${draftId}/export/markdown`, {});
      const text = await response.text();
      downloadFile(text, 'markdown.md', 'text/markdown');
    }
  });
  
  const exportWord = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', `/api/drafts/${draftId}/export/docx`, {});
      // In a real app, we'd get the blob and download it
      toast({
        title: "Export to Word",
        description: "Word export functionality would be implemented here.",
      });
    }
  });
  
  const copyToClipboard = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', `/api/drafts/${draftId}/export/text`, {});
      const text = await response.text();
      
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied to your clipboard."
        });
      } else {
        toast({
          title: "Copy failed",
          description: "Your browser doesn't support clipboard access.",
          variant: "destructive"
        });
      }
    }
  });
  
  const downloadFile = (content: string, filename: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  
  return (
    <div className="bg-white rounded-lg border border-neutral-200 mb-8">
      <div className="border-b border-neutral-200 p-4">
        <h2 className="text-lg font-medium text-neutral-900">Export or Advance</h2>
        <p className="mt-1 text-sm text-neutral-500">
          Download your refined draft or send it to another lab for further enhancement.
        </p>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap -m-2">
          <div className="p-2 w-full sm:w-1/2 lg:w-1/4">
            <Button
              variant="outline"
              className="h-full w-full flex flex-col items-center justify-center p-4 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
              onClick={() => exportMarkdown.mutate()}
              disabled={exportMarkdown.isPending}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Markdown</span>
            </Button>
          </div>
          <div className="p-2 w-full sm:w-1/2 lg:w-1/4">
            <Button
              variant="outline"
              className="h-full w-full flex flex-col items-center justify-center p-4 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
              onClick={() => exportWord.mutate()}
              disabled={exportWord.isPending}
            >
              <File className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Word (.docx)</span>
            </Button>
          </div>
          <div className="p-2 w-full sm:w-1/2 lg:w-1/4">
            <Button
              variant="outline"
              className="h-full w-full flex flex-col items-center justify-center p-4 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
              onClick={() => copyToClipboard.mutate()}
              disabled={copyToClipboard.isPending}
            >
              <Copy className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">Copy to Clipboard</span>
            </Button>
          </div>
          <div className="p-2 w-full sm:w-1/2 lg:w-1/4">
            <Button
              variant="outline"
              className="h-full w-full flex flex-col items-center justify-center bg-neutral-50 p-4 hover:border-primary hover:text-primary hover:shadow-sm transition-all"
            >
              <MoreHorizontal className="h-6 w-6 mb-2" />
              <span className="text-sm font-medium">More Options</span>
            </Button>
          </div>
        </div>
        
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <h3 className="text-sm font-medium text-neutral-900 mb-3">Send to Another Lab</h3>
          <div className="flex flex-wrap -m-2">
            <div className="p-2 w-full sm:w-1/3">
              <Link href={`/hook-lab?draftId=${draftId}`}>
                <a className="h-full w-full flex items-center justify-center border border-neutral-300 rounded-lg p-3 hover:border-primary hover:bg-primary hover:bg-opacity-5 hover:shadow-sm transition-all">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-sm font-medium">Hook Lab</span>
                </a>
              </Link>
            </div>
            <div className="p-2 w-full sm:w-1/3">
              <Link href={`/cta-lab?draftId=${draftId}`}>
                <a className="h-full w-full flex items-center justify-center border border-neutral-300 rounded-lg p-3 hover:border-primary hover:bg-primary hover:bg-opacity-5 hover:shadow-sm transition-all">
                  <Megaphone className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-sm font-medium">CTA Lab</span>
                </a>
              </Link>
            </div>
            <div className="p-2 w-full sm:w-1/3">
              <Link href={`/graphics-lab?draftId=${draftId}`}>
                <a className="h-full w-full flex items-center justify-center border border-neutral-300 rounded-lg p-3 hover:border-primary hover:bg-primary hover:bg-opacity-5 hover:shadow-sm transition-all">
                  <Image className="h-5 w-5 mr-2 text-primary" />
                  <span className="text-sm font-medium">Graphics Lab</span>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
