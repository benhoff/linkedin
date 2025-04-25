import React from 'react';
import { Variant } from '@shared/schema';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

interface VariantCardProps {
  variant: Variant;
  index: number;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

const variantLabels = ["A", "B", "C", "D", "E"];

export function VariantCard({ variant, index, isSelected, onToggleSelect }: VariantCardProps) {
  return (
    <div 
      className={cn(
        "variant-card", 
        isSelected && "border-primary bg-primary/5"
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs font-medium text-neutral-500">
          Variant {variantLabels[index % variantLabels.length]}
        </span>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(variant.id)}
          className="h-4 w-4"
        />
      </div>
      <p className="text-sm text-neutral-700">{variant.content}</p>
    </div>
  );
}
