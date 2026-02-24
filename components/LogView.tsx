'use client';

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addMonths, subMonths } from 'date-fns';
import { Card, Badge, Button, EmptyState } from '@/components/ui';
import { MealForm } from '@/components/MealForm';
import { TrainingForm } from '@/components/TrainingForm';
import { QuickMetricsForm } from '@/components/QuickMetricsForm';
import { useApp } from '@/lib/context';
import { getDayType, getCalorieTarget, getTotalMealCalories, getTotalMacros, getCaloriesRemaining, formatCalories, formatMacro } from '@/lib/calculations';
import { MealEntry, TrainingEntry } from '@/lib/types';
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Utensils, Dumbbell } from 'lucide-react';

export default function LogView() {
  const { state, getDayLog, addMeal, updateMeal, deleteMeal, addTraining, updateTraining, deleteTraining, updateMetrics } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showMealForm, setShowMealForm] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
  const [editMeal, setEditMeal] = useState<MealEntry | undefined>();
  const [editTraining, setEditTraining] = useState<TrainingEntry | undefined>();

  if (!state) return null;
  const { profile, logs, foods, templates } = state;

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad to start from Monday
  const firstDow = (monthStart.getDay() + 6) % 7; // Mon=0
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
    <div className="space-y-5">
      {/* Calendar */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-900">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex gap-1">
            <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-1 text-xs rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors">Today</button>
            <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-xs font-medium text-zinc-400 py-1">{d}</div>
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
                className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-sm font-medium transition-all ${
                  isSelected ? 'bg-zinc-900 text-white' : today ? 'bg-zinc-100 text-zinc-900 font-bold' : 'hover:bg-zinc-50 text-zinc-700'
                } ${!isSameMonth(day, currentMonth) ? 'opacity-30' : ''}`}
              >
                {day.getDate()}
                {dot && (
                  <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? 'bg-white' : dot}`} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Selected day header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-zinc-900">{format(parseISO(selectedDate), 'EEEE, MMM d')}</h3>
          <p className="text-xs text-zinc-500 capitalize">{dayType} day · {formatCalories(target)} kcal target</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => { setEditMeal(undefined); setShowMealForm(true); }}>
            <Plus size={14} /> Meal
          </Button>
          <Button size="sm" variant="secondary" onClick={() => { setEditTraining(undefined); setShowTrainingForm(true); }}>
            <Plus size={14} /> Training
          </Button>
        </div>
      </div>

      {/* Day summary */}
      {log.meals.length > 0 && (
        <Card className="p-4 grid grid-cols-4 gap-2 text-center">
          {[
            { l: 'Eaten', v: `${formatCalories(eaten)} kcal` },
            { l: 'Left', v: `${remaining < 0 ? '-' : ''}${formatCalories(Math.abs(remaining))} kcal` },
            { l: 'Protein', v: `${formatMacro(macros.protein)}g` },
            { l: 'Meals', v: log.meals.length },
          ].map(s => (
            <div key={s.l}>
              <p className="text-xs text-zinc-500">{s.l}</p>
              <p className="text-sm font-bold text-zinc-900">{s.v}</p>
            </div>
          ))}
        </Card>
      )}

      {/* Meals */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-zinc-900">Meals</h3>
          <button onClick={() => { setEditMeal(undefined); setShowMealForm(true); }} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
            <Plus size={14} /> Add
          </button>
        </div>
        {log.meals.length === 0 ? (
          <EmptyState icon={<Utensils size={20} />} title="No meals logged" description="Add a meal for this day" />
        ) : (
          <div className="divide-y divide-zinc-50">
            {log.meals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 truncate">{meal.name}</p>
                  <p className="text-xs text-zinc-500">{meal.time} · P {formatMacro(meal.macros.protein)}g · C {formatMacro(meal.macros.carbs)}g · F {formatMacro(meal.macros.fat)}g</p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm font-semibold text-zinc-900">{formatCalories(meal.calories)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditMeal(meal); setShowMealForm(true); }} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => deleteMeal(selectedDate, meal.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Training */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-zinc-900">Training</h3>
          <button onClick={() => { setEditTraining(undefined); setShowTrainingForm(true); }} className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
            <Plus size={14} /> Add
          </button>
        </div>
        {log.training.length === 0 ? (
          <EmptyState icon={<Dumbbell size={20} />} title="No training" description="Log a session for this day" />
        ) : (
          <div className="divide-y divide-zinc-50">
            {log.training.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-zinc-900">{t.type}</p>
                  <p className="text-xs text-zinc-500">{t.durationMin}min {t.distanceKm ? `· ${t.distanceKm}km` : ''} {t.rpe ? `· RPE ${t.rpe}` : ''}</p>
                  {t.notes && <p className="text-xs text-zinc-400 mt-0.5">{t.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditTraining(t); setShowTrainingForm(true); }} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors"><Pencil size={13} /></button>
                  <button onClick={() => deleteTraining(selectedDate, t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Metrics */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-zinc-900">Metrics & Notes</h3>
          <button onClick={() => setShowMetricsForm(true)} className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
            {log.metrics.weightKg ? 'Edit' : 'Add'}
          </button>
        </div>
        {log.metrics.weightKg || log.metrics.steps || log.metrics.waterLiters ? (
          <div className="flex flex-wrap gap-4">
            {log.metrics.weightKg && <div><p className="text-xs text-zinc-500">Weight</p><p className="text-sm font-semibold">{log.metrics.weightKg}kg</p></div>}
            {log.metrics.steps && <div><p className="text-xs text-zinc-500">Steps</p><p className="text-sm font-semibold">{log.metrics.steps.toLocaleString()}</p></div>}
            {log.metrics.waterLiters && <div><p className="text-xs text-zinc-500">Water</p><p className="text-sm font-semibold">{log.metrics.waterLiters}L</p></div>}
            {log.metrics.sleepHours && <div><p className="text-xs text-zinc-500">Sleep</p><p className="text-sm font-semibold">{log.metrics.sleepHours}h</p></div>}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">No metrics logged.</p>
        )}
        {log.metrics.tags && log.metrics.tags.length > 0 && (
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {log.metrics.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}
        {log.metrics.notes && <p className="text-xs text-zinc-500 mt-2">{log.metrics.notes}</p>}
      </Card>

      <MealForm open={showMealForm} onOpenChange={setShowMealForm} onSubmit={m => editMeal ? updateMeal(selectedDate, { ...m, id: editMeal.id }) : addMeal(selectedDate, m)} foods={foods} templates={templates} initialMeal={editMeal} date={selectedDate} />
      <TrainingForm open={showTrainingForm} onOpenChange={setShowTrainingForm} onSubmit={t => editTraining ? updateTraining(selectedDate, { ...t, id: editTraining.id }) : addTraining(selectedDate, t)} initialTraining={editTraining} date={selectedDate} />
      <QuickMetricsForm open={showMetricsForm} onOpenChange={setShowMetricsForm} onSubmit={m => updateMetrics(selectedDate, m)} current={log.metrics} date={selectedDate} />
    </div>
  );
}
