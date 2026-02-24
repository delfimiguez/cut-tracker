'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/primitives';

interface KPIHeaderProps {
  remaining: number;
  eaten: number;
  target: number;
  dayType: string;
  date: string;
}

const DAY_TYPE_LABELS: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'secondary' | 'outline' }> = {
  hybrid: { label: 'Hybrid day', variant: 'default' },
  running: { label: 'Run day', variant: 'success' },
  pilates: { label: 'Pilates day', variant: 'success' },
  rest: { label: 'Rest day', variant: 'secondary' },
};

export function KPIHeader({ remaining, eaten, target, dayType, date }: KPIHeaderProps) {
  const isOver = remaining < 0;
  const pct = Math.min(100, (eaten / target) * 100);
  const typeInfo = DAY_TYPE_LABELS[dayType] ?? { label: 'Rest day', variant: 'secondary' as const };

  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-1">
          <p className="text-sm font-medium text-muted-foreground">Calories remaining</p>
          <Badge variant={typeInfo.variant as 'default' | 'secondary' | 'success' | 'warning' | 'outline' | 'destructive'}>{typeInfo.label}</Badge>
        </div>

        <div className="flex items-end gap-3 mb-5">
          <span className={cn('text-5xl font-semibold tabular-nums tracking-tight leading-none', isOver ? 'text-destructive' : 'text-foreground')}>
            {isOver ? '–' : ''}{Math.abs(Math.round(remaining)).toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground mb-1">kcal</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700 ease-out',
                isOver ? 'bg-destructive' : 'bg-foreground'
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{Math.round(eaten).toLocaleString()} eaten</span>
            <span>{target.toLocaleString()} target</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
