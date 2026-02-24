'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addMonths, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/primitives';
import { MealForm } from '@/components/MealForm';
import { TrainingForm } from '@/components/TrainingForm';
import { QuickMetricsForm } from '@/components/QuickMetricsForm';
import { MealsList } from '@/components/MealsList';
import { TrainingList } from '@/components/TrainingList';
import { useApp } from '@/lib/context';
import { getDayType, getCalorieTarget, getTotalMealCalories, getTotalMacros, getCaloriesRemaining } from '@/lib/calculations';
import { MealEntry, TrainingEntry } from '@/lib/types';
import { ChevronLeft, ChevronRight, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LogView() {
  const { state, getDayLog, addMeal, updateMeal, deleteMeal, addTraining, updateTraining, deleteTraining, updateMetrics } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showMeal, setShowMeal] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showMetrics, setShowMetrics] = useState(false);
  const [editMeal, setEditMeal] = useState<MealEntry | undefined>();
  const [editTraining, setEditTraining] = useState<TrainingEntry | undefined>();

  if (!state) return null;
  const { profile, logs, foods, templates } = state;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDow = (monthStart.getDay() + 6) % 7;
  const paddedDays = Array(firstDow).fill(null).concat(days);

  const log = getDayLog(selectedDate);
  const dayType = getDayType(log, selectedDate);
  const target = getCalorieTarget(profile, dayType);
  const eaten = getTotalMealCalories(log);
  const macros = getTotalMacros(log);
  const remaining = getCaloriesRemaining(profile, log, selectedDate);

  function getDotColor(dateStr: string) {
    const l = logs[dateStr];
    if (!l || l.meals.length === 0) return null;
    const rem = getCaloriesRemaining(profile, l, dateStr);
    if (rem >= 0) return 'bg-emerald-400';
    if (rem >= -200) return 'bg-amber-400';
    return 'bg-red-400';
  }

  return (
    <div className="space-y-4">
      {/* Calendar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>{format(currentMonth, 'MMMM yyyy')}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-xs px-2" onClick={() => setCurrentMonth(new Date())}>Today</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 mb-2">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <div key={i} className="text-center text-xs font-medium text-muted-foreground py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((day, i) => {
              if (!day) return <div key={`pad-${i}`} />;
              const dateStr = format(day, 'yyyy-MM-dd');
              const isSelected = dateStr === selectedDate;
              const today = isToday(day);
              const dot = getDotColor(dateStr);
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    'relative flex flex-col items-center justify-center aspect-square rounded-lg text-sm font-medium transition-colors',
                    isSelected ? 'bg-foreground text-background' : today ? 'bg-accent font-bold' : 'hover:bg-accent',
                    !isSameMonth(day, currentMonth) && 'opacity-30'
                  )}
                >
                  {day.getDate()}
                  {dot && (
                    <span className={cn('absolute bottom-1 h-1 w-1 rounded-full', isSelected ? 'bg-background' : dot)} />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected day header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">{format(parseISO(selectedDate), 'EEEE, MMMM d')}</h2>
          <p className="text-sm text-muted-foreground capitalize">{dayType} day · {target.toLocaleString()} kcal target</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setShowMetrics(true)}>
          <Scale className="h-3.5 w-3.5" />
          Metrics
        </Button>
      </div>

      {/* Day summary row */}
      {log.meals.length > 0 && (
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-4 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Eaten</p>
                <p className="text-base font-semibold tabular-nums">{eaten.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                <p className={cn('text-base font-semibold tabular-nums', remaining < 0 && 'text-destructive')}>
                  {remaining < 0 ? '–' : ''}{Math.abs(Math.round(remaining)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Protein</p>
                <p className="text-base font-semibold tabular-nums">{Math.round(macros.protein)}g</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Meals</p>
                <p className="text-base font-semibold tabular-nums">{log.meals.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Meals */}
      <MealsList
        meals={log.meals}
        onAdd={() => { setEditMeal(undefined); setShowMeal(true); }}
        onEdit={m => { setEditMeal(m); setShowMeal(true); }}
        onDelete={id => deleteMeal(selectedDate, id)}
      />

      {/* Training */}
      <TrainingList
        training={log.training}
        onAdd={() => { setEditTraining(undefined); setShowTraining(true); }}
        onEdit={t => { setEditTraining(t); setShowTraining(true); }}
        onDelete={id => deleteTraining(selectedDate, id)}
      />

      {/* Notes/metrics */}
      {(log.metrics.notes || (log.metrics.tags && log.metrics.tags.length > 0)) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {log.metrics.tags && log.metrics.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {log.metrics.tags.map(tag => (
                  <span key={tag} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">{tag}</span>
                ))}
              </div>
            )}
            {log.metrics.notes && <p className="text-sm text-muted-foreground">{log.metrics.notes}</p>}
          </CardContent>
        </Card>
      )}

      <MealForm open={showMeal} onOpenChange={setShowMeal}
        onSubmit={m => editMeal ? updateMeal(selectedDate, { ...m, id: editMeal.id }) : addMeal(selectedDate, m)}
        foods={foods} templates={templates} initialMeal={editMeal} date={selectedDate} />
      <TrainingForm open={showTraining} onOpenChange={setShowTraining}
        onSubmit={t => editTraining ? updateTraining(selectedDate, { ...t, id: editTraining.id }) : addTraining(selectedDate, t)}
        initialTraining={editTraining} date={selectedDate} />
      <QuickMetricsForm open={showMetrics} onOpenChange={setShowMetrics}
        onSubmit={m => updateMetrics(selectedDate, m)} current={log.metrics} date={selectedDate} />
    </div>
  );
}
