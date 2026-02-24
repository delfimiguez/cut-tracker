'use client';

import React, { useState } from 'react';
import { format, subDays } from 'date-fns';
import { Card, StatCard, Badge } from '@/components/ui';
import { useApp } from '@/lib/context';
import {
  getWeeklyData, getAccumulatedDeficit, getProjectedFatLoss, getRollingAverage,
  formatCalories, getDayDeficit, getTotalMealCalories, getTotalMacros,
} from '@/lib/calculations';
import { KCAL_PER_KG_FAT } from '@/lib/types';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { TrendingDown, TrendingUp, Target, Dumbbell, Footprints } from 'lucide-react';

export default function InsightsView() {
  const { state } = useApp();
  const [weeksBack, setWeeksBack] = useState(0);

  if (!state) return null;
  const { profile, logs } = state;

  const weekData = getWeeklyData(profile, logs, weeksBack);
  const accDeficit = getAccumulatedDeficit(profile, logs, profile.startDate, format(new Date(), 'yyyy-MM-dd'));
  const projFatLoss = getProjectedFatLoss(accDeficit);
  const { avgCalories, avgProtein, avgDeficit } = getRollingAverage(profile, logs, 7);

  // Weight trend: last 30 days
  const weightData: { date: string; weight: number | null }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const w = logs[d]?.metrics.weightKg ?? null;
    if (w) weightData.push({ date: format(subDays(new Date(), i), 'MMM d'), weight: w });
  }

  // Deficit accumulation
  const deficitAccData: { date: string; cumulative: number }[] = [];
  let cum = 0;
  for (let i = 29; i >= 0; i--) {
    const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const l = logs[d];
    if (l && l.meals.length > 0) {
      cum += getDayDeficit(profile, l, d);
    }
    deficitAccData.push({ date: format(subDays(new Date(), i), 'MMM d'), cumulative: Math.round(cum) });
  }

  // Weekly training sessions
  const trainingSessions = weekData.filter(d => d.training.length > 0).length;
  const runMinutes = weekData.reduce((s, d) => s + d.training.filter(t => t.type.includes('Run')).reduce((a, t) => a + t.durationMin, 0), 0);
  const avgWeeklyCalories = weekData.filter(d => d.hasLog).reduce((s, d) => s + d.calories, 0) / Math.max(1, weekData.filter(d => d.hasLog).length);

  // 14-day trend suggestion
  const { avgDeficit: avg14 } = getRollingAverage(profile, logs, 14);
  const suggest14 = avg14 < 100 && Object.values(logs).length >= 14;

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Deficit" value={`${formatCalories(accDeficit)}`} sub="kcal accumulated" icon={<TrendingDown size={16} className="text-emerald-500" />} />
        <StatCard label="Fat Lost (est)" value={`${projFatLoss.toFixed(2)}kg`} sub={`goal: ${profile.goalFatLossKg}kg`} accent icon={<Target size={16} className="text-white" />} />
        <StatCard label="7d Avg Calories" value={formatCalories(avgCalories)} sub={`target ~${formatCalories(profile.calorieTargets.rest + 100)}`} icon={<TrendingUp size={16} className="text-zinc-500" />} />
        <StatCard label="7d Avg Protein" value={`${Math.round(avgProtein)}g`} sub={`target: ${profile.proteinTargetG}g`} icon={<Dumbbell size={16} className="text-blue-500" />} />
      </div>

      {/* Suggestion */}
      {suggest14 && (
        <Card className="p-4 border-amber-200 bg-amber-50">
          <p className="text-sm font-semibold text-amber-800">📊 Adjustment suggested</p>
          <p className="text-xs text-amber-700 mt-1">
            14-day average deficit is below 100 kcal/day. Consider reducing daily target by 100–150 kcal or increasing activity.
          </p>
        </Card>
      )}

      {/* Weekly calories chart */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900">Calories vs Target</h3>
          <div className="flex gap-1">
            <button onClick={() => setWeeksBack(w => w + 1)} className="p-1 rounded hover:bg-zinc-100 text-zinc-500 text-xs">◀</button>
            <button onClick={() => setWeeksBack(0)} className="px-2 py-1 text-xs rounded hover:bg-zinc-100 text-zinc-500">This week</button>
            <button onClick={() => setWeeksBack(w => Math.max(0, w - 1))} className="p-1 rounded hover:bg-zinc-100 text-zinc-500 text-xs">▶</button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={weekData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
            <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${formatCalories(Number(v))} kcal`]}
              contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }}
            />
            <Bar dataKey="target" fill="#f4f4f5" radius={[4, 4, 0, 0]} />
            <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
              {weekData.map((entry, i) => (
                <Cell key={i} fill={entry.calories > entry.target ? '#ef4444' : entry.hasLog ? '#18181b' : '#e4e4e7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Protein chart */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Protein Intake</h3>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={weekData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a1a1aa' }} />
            <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
            <Tooltip formatter={(v: any) => [`${Math.round(Number(v))}g`, 'Protein']} contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }} />
            <ReferenceLine y={profile.proteinTargetG} stroke="#3b82f6" strokeDasharray="4 2" label={{ value: `${profile.proteinTargetG}g`, position: 'right', fontSize: 10, fill: '#3b82f6' }} />
            <Bar dataKey="protein" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Weight trend */}
      {weightData.length >= 2 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Weight Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={weightData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a1a1aa' }} interval={4} />
              <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip formatter={(v: any) => [`${v}kg`]} contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="#18181b" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Deficit accumulation */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Deficit Accumulation (30 days)</h3>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={deficitAccData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#a1a1aa' }} interval={6} />
            <YAxis tick={{ fontSize: 11, fill: '#a1a1aa' }} />
            <Tooltip formatter={(v: any) => [`${formatCalories(Number(v))} kcal`, 'Cumulative deficit']} contentStyle={{ borderRadius: 8, border: '1px solid #e4e4e7', fontSize: 12 }} />
            <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
        <p className="text-xs text-zinc-400 mt-2">≈ {projFatLoss.toFixed(2)}kg fat lost · 7700 kcal = 1kg</p>
      </Card>

      {/* Weekly summary */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">This Week Summary</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-zinc-500">Training sessions</p>
            <p className="text-xl font-bold">{trainingSessions}<span className="text-sm font-normal text-zinc-500"> / 7 days</span></p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Run minutes</p>
            <p className="text-xl font-bold">{runMinutes}<span className="text-sm font-normal text-zinc-500">min</span></p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Avg daily calories</p>
            <p className="text-xl font-bold">{formatCalories(avgWeeklyCalories)}</p>
          </div>
          <div>
            <p className="text-xs text-zinc-500">Weekly deficit</p>
            <p className="text-xl font-bold">{formatCalories(weekData.filter(d => d.deficit !== null).reduce((s, d) => s + (d.deficit ?? 0), 0))}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
