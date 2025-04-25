import React from 'react';
import { cn } from '@/lib/utils';
import { 
  FileText, 
  WandSparkles, 
  Sliders, 
  Combine, 
  Download 
} from 'lucide-react';

interface WorkflowStepsProps {
  currentStep: number;
}

export function WorkflowSteps({ currentStep }: WorkflowStepsProps) {
  const steps = [
    { name: 'Draft', icon: FileText },
    { name: 'Generate', icon: WandSparkles },
    { name: 'Refine', icon: Sliders },
    { name: 'Combine', icon: Combine },
    { name: 'Export', icon: Download },
  ];
  
  // Calculate progress percentage
  const progressPercentage = (currentStep / (steps.length - 1)) * 100;
  
  return (
    <div className="mb-8">
      <div className="relative">
        <div className="overflow-hidden h-2 flex rounded bg-neutral-200">
          <div 
            className="bg-primary" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-6 hidden sm:flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            
            return (
              <div key={index} className="workflow-step">
                <div className={cn(
                  "workflow-step-icon",
                  (isActive || isCompleted) ? "workflow-step-active" : "workflow-step-inactive"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className={cn(
                  "workflow-step-text",
                  (isActive || isCompleted) ? "workflow-step-text-active" : "workflow-step-text-inactive"
                )}>
                  {step.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
