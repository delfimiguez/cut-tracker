'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { useApp } from '@/lib/context';
import { KPIHeader } from '@/components/KPIHeader';
import { MacroBars } from '@/components/MacroBars';
import { QuickAdd } from '@/components/QuickAdd';
import { MealsList } from '@/components/MealsList';
import { TrainingList } from '@/components/TrainingList';
import { DaySummaryCard } from '@/components/DaySummaryCard';
import { MealForm } from '@/components/MealForm';
import { TrainingForm } from '@/components/TrainingForm';
import { QuickMetricsForm } from '@/components/QuickMetricsForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/primitives';
import {
  getDayType, getCalorieTarget, getTotalMealCalories, getTotalMacros,
  getCaloriesRemaining, getDayDeficit, getAccumulatedDeficit, getProjectedFatLoss,
  getTrainingStreak, getAdherenceStreak, getRollingAverage,
} from '@/lib/calculations';
import { MealEntry, TrainingEntry, WEEKLY_SCHEDULE } from '@/lib/types';
import { Trophy, Dumbbell, CheckCircle2, Circle } from 'lucide-react';

export default function DashboardView() {
  const { state, todayStr, getDayLog, addMeal, updateMeal, deleteMeal, addTraining, updateTraining, deleteTraining, updateMetrics } = useApp();
  const [showMeal, setShowMeal] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [editMeal, setEditMeal] = useState<MealEntry | undefined>();
  const [editTraining, setEditTraining] = useState<TrainingEntry | undefined>();

  if (!state) return null;
  const { profile, logs, foods, templates } = state;
  const log = getDayLog(todayStr);
  const dayType = getDayType(log, todayStr);
  const target = getCalorieTarget(profile, dayType);
  const eaten = getTotalMealCalories(log);
  const macros = getTotalMacros(log);
  const remaining = getCaloriesRemaining(profile, log, todayStr);
  const deficitToday = log.meals.length > 0 ? getDayDeficit(profile, log, todayStr) : null;
  const accDeficit = getAccumulatedDeficit(profile, logs, profile.startDate, todayStr);
  const projFat = getProjectedFatLoss(accDeficit);
  const trainingStreak = getTrainingStreak(logs);
  const adherenceStreak = getAdherenceStreak(profile, logs);
  const { avgDeficit } = getRollingAverage(profile, logs, 7);

  const dayOfWeek = new Date(todayStr + 'T12:00:00').getDay();
  const scheduledToday = WEEKLY_SCHEDULE[dayOfWeek] ?? [];
  const loggedTypes = log.training.map(t => t.type);

  return (
    <div className="space-y-4">
      {/* 1. KPI Hero */}
      <KPIHeader remaining={remaining} eaten={eaten} target={target} dayType={dayType} date={todayStr} />

      {/* 2. Macros */}
      <MacroBars
        protein={macros.protein} carbs={macros.carbs} fat={macros.fat}
        proteinTarget={profile.proteinTargetG} calorieTarget={target}
      />

      {/* 3. Quick actions */}
      <QuickAdd
        onAddMeal={() => { setEditMeal(undefined); setShowMeal(true); }}
        onAddTraining={() => { setEditTraining(undefined); setShowTraining(true); }}
        onAddMetrics={() => setShowMetrics(true)}
      />

      {/* 4. Deficit summary */}
      <DaySummaryCard
        deficitToday={deficitToday}
        accumulatedDeficit={accDeficit}
        projectedFatLoss={projFat}
        avgDeficit={avgDeficit}
        goalFatLossKg={profile.goalFatLossKg}
        goalDate={profile.goalDate}
      />

      {/* 5. Streaks */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
              <Trophy className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{adherenceStreak}</p>
              <p className="text-xs text-muted-foreground">Adherence streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100">
              <Dumbbell className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{trainingStreak}</p>
              <p className="text-xs text-muted-foreground">Training streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 6. Today's plan checklist */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Today's plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {scheduledToday.map(t => {
            const done = loggedTypes.includes(t);
            return (
              <div key={t} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {done
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  }
                  <span className={done ? 'text-sm text-muted-foreground line-through' : 'text-sm'}>{t}</span>
                </div>
                {!done && (
                  <button onClick={() => { setEditTraining(undefined); setShowTraining(true); }}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    Log →
                  </button>
                )}
              </div>
            );
          })}
          <div className="flex items-center gap-2.5">
            {log.metrics.waterLiters && log.metrics.waterLiters >= 2
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            }
            <span className={log.metrics.waterLiters && log.metrics.waterLiters >= 2 ? 'text-sm text-muted-foreground line-through' : 'text-sm'}>
              Hydration ≥2L {log.metrics.waterLiters ? `(${log.metrics.waterLiters}L logged)` : ''}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            {log.metrics.steps && log.metrics.steps >= 7000
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              : <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
            }
            <span className={log.metrics.steps && log.metrics.steps >= 7000 ? 'text-sm text-muted-foreground line-through' : 'text-sm'}>
              Steps ≥7k {log.metrics.steps ? `(${log.metrics.steps.toLocaleString()} logged)` : ''}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 7. Meals */}
      <MealsList
        meals={log.meals}
        onAdd={() => { setEditMeal(undefined); setShowMeal(true); }}
        onEdit={m => { setEditMeal(m); setShowMeal(true); }}
        onDelete={id => deleteMeal(todayStr, id)}
      />

      {/* 8. Training */}
      <TrainingList
        training={log.training}
        onAdd={() => { setEditTraining(undefined); setShowTraining(true); }}
        onEdit={t => { setEditTraining(t); setShowTraining(true); }}
        onDelete={id => deleteTraining(todayStr, id)}
      />

      {/* 9. Metrics summary if logged */}
      {(log.metrics.weightKg || log.metrics.steps || log.metrics.waterLiters) && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Metrics</CardTitle>
              <button onClick={() => setShowMetrics(true)} className="text-xs text-muted-foreground hover:text-foreground">Edit</button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {log.metrics.weightKg && <div><p className="text-xs text-muted-foreground">Weight</p><p className="text-sm font-semibold">{log.metrics.weightKg} kg</p></div>}
              {log.metrics.steps && <div><p className="text-xs text-muted-foreground">Steps</p><p className="text-sm font-semibold">{log.metrics.steps.toLocaleString()}</p></div>}
              {log.metrics.waterLiters && <div><p className="text-xs text-muted-foreground">Water</p><p className="text-sm font-semibold">{log.metrics.waterLiters} L</p></div>}
              {log.metrics.sleepHours && <div><p className="text-xs text-muted-foreground">Sleep</p><p className="text-sm font-semibold">{log.metrics.sleepHours} h</p></div>}
            </div>
            {log.metrics.tags && log.metrics.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {log.metrics.tags.map(tag => (
                  <span key={tag} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <MealForm
        open={showMeal} onOpenChange={setShowMeal}
        onSubmit={m => editMeal ? updateMeal(todayStr, { ...m, id: editMeal.id }) : addMeal(todayStr, m)}
        foods={foods} templates={templates} initialMeal={editMeal} date={todayStr}
      />
      <TrainingForm
        open={showTraining} onOpenChange={setShowTraining}
        onSubmit={t => editTraining ? updateTraining(todayStr, { ...t, id: editTraining.id }) : addTraining(todayStr, t)}
        initialTraining={editTraining} date={todayStr}
      />
      <QuickMetricsForm
        open={showMetrics} onOpenChange={setShowMetrics}
        onSubmit={m => updateMetrics(todayStr, m)}
        current={log.metrics} date={todayStr}
      />
    </div>
  );
}
