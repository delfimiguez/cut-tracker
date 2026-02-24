'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Utensils, Dumbbell, Scale } from 'lucide-react';

interface QuickAddProps {
  onAddMeal: () => void;
  onAddTraining: () => void;
  onAddMetrics: () => void;
}

export function QuickAdd({ onAddMeal, onAddTraining, onAddMetrics }: QuickAddProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onAddMeal} className="flex-1 gap-2">
        <Utensils className="h-4 w-4" />
        <span className="hidden sm:inline">Add Meal</span>
        <span className="sm:hidden">Meal</span>
      </Button>
      <Button variant="outline" onClick={onAddTraining} className="flex-1 gap-2">
        <Dumbbell className="h-4 w-4" />
        <span className="hidden sm:inline">Log Training</span>
        <span className="sm:hidden">Training</span>
      </Button>
      <Button variant="outline" onClick={onAddMetrics} className="flex-1 gap-2">
        <Scale className="h-4 w-4" />
        <span className="hidden sm:inline">Metrics</span>
        <span className="sm:hidden">Metrics</span>
      </Button>
    </div>
  );
}
