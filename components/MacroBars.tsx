'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface MacroBarItemProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}

function MacroBarItem({ label, current, target, unit = 'g', color }: MacroBarItemProps) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const over = current > target;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          <span className={cn('font-medium', over ? 'text-destructive' : 'text-foreground')}>
            {Math.round(current)}
          </span>
          {' / '}{Math.round(target)}{unit}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', over ? 'bg-destructive' : color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

interface MacroBarsProps {
  protein: number;
  carbs: number;
  fat: number;
  proteinTarget: number;
  calorieTarget: number;
}

export function MacroBars({ protein, carbs, fat, proteinTarget, calorieTarget }: MacroBarsProps) {
  const carbTarget = Math.round((calorieTarget * 0.4) / 4);
  const fatTarget = Math.round((calorieTarget * 0.25) / 9);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Macros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <MacroBarItem label="Protein" current={protein} target={proteinTarget} color="bg-blue-500" />
        <MacroBarItem label="Carbohydrates" current={carbs} target={carbTarget} color="bg-amber-400" />
        <MacroBarItem label="Fat" current={fat} target={fatTarget} color="bg-violet-400" />
      </CardContent>
    </Card>
  );
}
