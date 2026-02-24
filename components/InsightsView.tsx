'use client';

import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/primitives';
import { useApp } from '@/lib/context';
import {
  getWeeklyData, getAccumulatedDeficit, getProjectedFatLoss, getRollingAverage,
  formatCalories, getDayDeficit, getTotalMealCalories, getTotalMacros,
} from '@/lib/calculations';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingDown, Target, Dumbbell, AlertCircle } from 'lucide-react';

export default function InsightsView() {
  const { state } = useApp();
  const [weeksBack, setWeeksBack] = useState(0);

  if (!state) return null;
  const { profile, logs } = state;

  const weekData = getWeeklyData(profile, logs, weeksBack);
  const accDeficit = getAccumulatedDeficit(profile, logs, profile.startDate, format(new Date(), 'yyyy-MM-dd'));
  const projFatLoss = getProjectedFatLoss(accDeficit);
  const { avgCalories, avgProtein, avgDeficit } = getRollingAverage(profile, logs, 7);

  const weightData: { date: string; weight: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const w = logs[d]?.metrics.weightKg;
    if (w) weightData.push({ date: format(subDays(new Date(), i), 'MMM d'), weight: w });
  }

  let cum = 0;
  const deficitAccData = Array.from({ length: 30 }, (_, i) => {
    const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
    const l = logs[d];
    if (l && l.meals.length > 0) cum += getDayDeficit(profile, l, d);
    return { date: format(subDays(new Date(), 29 - i), 'MMM d'), cumulative: Math.round(cum) };
  });

  const trainingSessions = weekData.filter(d => d.training.length > 0).length;
  const runMinutes = weekData.reduce((s, d) => s + d.training.filter(t => t.type.includes('Run')).reduce((a, t) => a + t.durationMin, 0), 0);
  const { avgDeficit: avg14 } = getRollingAverage(profile, logs, 14);
  const suggest = avg14 < 100 && Object.values(logs).length >= 14;

  const tooltipStyle = {
    borderRadius: '8px',
    border: '1px solid hsl(240 5.9% 90%)',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)',
    fontSize: '12px',
  };

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Plan deficit', value: `${formatCalories(accDeficit)} kcal`, sub: `≈ ${projFatLoss.toFixed(2)} kg fat`, icon: TrendingDown, iconColor: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Goal', value: `${projFatLoss.toFixed(2)} kg`, sub: `target: ${profile.goalFatLossKg} kg`, icon: Target, iconColor: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '7d avg calories', value: formatCalories(avgCalories), sub: `target ~${formatCalories(profile.calorieTargets.rest + 100)}`, icon: TrendingDown, iconColor: 'text-violet-600', bg: 'bg-violet-50' },
          { label: '7d avg protein', value: `${Math.round(avgProtein)}g`, sub: `target: ${profile.proteinTargetG}g`, icon: Dumbbell, iconColor: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-xl font-semibold tabular-nums">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                    <Icon className={`h-4 w-4 ${item.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Adjustment suggestion */}
      {suggest && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900">Adjustment suggested</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  14-day avg deficit is below 100 kcal/day. Consider reducing daily target by 100–150 kcal or increasing activity.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly calories chart */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Calories vs Target</CardTitle>
              <CardDescription>Weekly comparison</CardDescription>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeeksBack(w => w + 1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => setWeeksBack(0)}>This week</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setWeeksBack(w => Math.max(0, w - 1))} disabled={weeksBack === 0}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${formatCalories(Number(v))} kcal`]} />
              <Bar dataKey="target" fill="hsl(240 4.8% 95.9%)" radius={[3, 3, 0, 0]} name="Target" />
              <Bar dataKey="calories" radius={[3, 3, 0, 0]} name="Eaten">
                {weekData.map((entry, i) => (
                  <Cell key={i} fill={entry.calories > entry.target ? 'hsl(0 84.2% 60.2%)' : entry.hasLog ? 'hsl(240 5.9% 10%)' : 'hsl(240 4.8% 95.9%)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Protein chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Protein</CardTitle>
          <CardDescription>Daily intake vs {profile.proteinTargetG}g target</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={weekData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${Math.round(Number(v))}g`]} />
              <ReferenceLine y={profile.proteinTargetG} stroke="hsl(217 91% 60%)" strokeDasharray="4 2" />
              <Bar dataKey="protein" fill="hsl(217 91% 60%)" radius={[3, 3, 0, 0]} name="Protein" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weight trend */}
      {weightData.length >= 2 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Weight Trend</CardTitle>
            <CardDescription>Last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${v} kg`]} />
                <Line type="monotone" dataKey="weight" stroke="hsl(240 5.9% 10%)" strokeWidth={2} dot={{ r: 2.5, fill: 'hsl(240 5.9% 10%)' }} activeDot={{ r: 4 }} name="Weight" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Deficit accumulation */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Deficit Accumulation</CardTitle>
          <CardDescription>30-day running total · ≈ {projFatLoss.toFixed(2)}kg fat lost</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={deficitAccData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(240 5.9% 90%)" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 11, fill: 'hsl(240 3.8% 46.1%)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: any) => [`${formatCalories(Number(v))} kcal`]} />
              <Line type="monotone" dataKey="cumulative" stroke="hsl(152 69% 37%)" strokeWidth={2} dot={false} name="Cumulative deficit" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>This Week</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Training sessions</p>
              <p className="text-2xl font-semibold tabular-nums">{trainingSessions}<span className="text-sm font-normal text-muted-foreground"> /7</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Run minutes</p>
              <p className="text-2xl font-semibold tabular-nums">{runMinutes}<span className="text-sm font-normal text-muted-foreground">min</span></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Avg daily calories</p>
              <p className="text-2xl font-semibold tabular-nums">{formatCalories(avgCalories)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">7d avg deficit</p>
              <p className="text-2xl font-semibold tabular-nums">{formatCalories(avgDeficit)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
