'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatItemProps {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
  muted?: boolean;
}

function StatItem({ label, value, sub, highlight, muted }: StatItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn('text-xl font-semibold tabular-nums tracking-tight', highlight && 'text-foreground', muted && 'text-muted-foreground')}>
        {value}
      </p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

interface DaySummaryCardProps {
  deficitToday: number | null;
  accumulatedDeficit: number;
  projectedFatLoss: number;
  avgDeficit: number;
  goalFatLossKg: number;
  goalDate: string;
}

export function DaySummaryCard({
  deficitToday,
  accumulatedDeficit,
  projectedFatLoss,
  avgDeficit,
  goalFatLossKg,
  goalDate,
}: DaySummaryCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <StatItem
            label="Today's deficit"
            value={deficitToday !== null ? `${Math.round(deficitToday).toLocaleString()} kcal` : '—'}
            sub={deficitToday !== null ? (deficitToday > 0 ? 'On track' : 'Surplus') : 'Log meals first'}
            highlight
          />
          <StatItem
            label="Plan deficit"
            value={`${Math.round(accumulatedDeficit).toLocaleString()} kcal`}
            sub={`≈ ${projectedFatLoss.toFixed(2)} kg fat`}
            highlight
          />
          <StatItem
            label="7-day avg deficit"
            value={`${Math.round(avgDeficit).toLocaleString()} kcal`}
            sub="rolling average"
          />
          <StatItem
            label="Projected loss"
            value={`${projectedFatLoss.toFixed(2)} kg`}
            sub={`goal: ${goalFatLossKg} kg`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
