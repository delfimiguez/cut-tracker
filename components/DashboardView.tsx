'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  CalorieRing, MacroBar, Card, Button, Badge, StatCard, EmptyState
} from '@/components/ui';
import { MealForm } from '@/components/MealForm';
import { TrainingForm } from '@/components/TrainingForm';
import { QuickMetricsForm } from '@/components/QuickMetricsForm';
import { useApp } from '@/lib/context';
import {
  getDayType, getCalorieTarget, getTotalMealCalories, getTotalMacros,
  getCaloriesRemaining, getDayDeficit, getAccumulatedDeficit, getProjectedFatLoss,
  getProjectedOutcome, getTrainingStreak, getAdherenceStreak, formatCalories, formatMacro,
  getWeeklyData, getRollingAverage,
} from '@/lib/calculations';
import {
  Plus, Utensils, Dumbbell, Footprints, Droplets, Scale, Flame,
  TrendingDown, Target, Trophy, Zap, ChevronRight, Trash2, Pencil,
} from 'lucide-react';
import { MealEntry, TrainingEntry } from '@/lib/types';
import { WEEKLY_SCHEDULE } from '@/lib/types';

export default function DashboardView() {
  const { state, todayStr, getDayLog, addMeal, updateMeal, deleteMeal, addTraining, updateTraining, deleteTraining, updateMetrics } = useApp();
  const [showMealForm, setShowMealForm] = useState(false);
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [showMetricsForm, setShowMetricsForm] = useState(false);
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
  const projectedFatLoss = getProjectedFatLoss(accDeficit);
  const outcome = getProjectedOutcome(profile, logs);
  const trainingStreak = getTrainingStreak(logs);
  const adherenceStreak = getAdherenceStreak(profile, logs);
  const weeklyData = getWeeklyData(profile, logs, 0);
  const { avgDeficit } = getRollingAverage(profile, logs, 7);

  const daysTotal = weeklyData.filter(d => d.hasLog).length;
  const trainingSessions = weeklyData.reduce((s, d) => s + d.training.length, 0);

  // Scheduled training today
  const dayOfWeek = new Date(todayStr + 'T12:00:00').getDay();
  const scheduledToday = WEEKLY_SCHEDULE[dayOfWeek] ?? [];
  const loggedTypes = log.training.map(t => t.type);

  const carbohydrateTarget = Math.round(target * 0.4 / 4);
  const fatTarget = Math.round(target * 0.25 / 9);

  return (
    <div className="space-y-5">
      {/* Hero: Calories */}
      <Card className="p-5">
        <div className="flex items-center gap-5">
          <div className="relative flex items-center justify-center" style={{ width: 120, height: 120 }}>
            <CalorieRing eaten={eaten} target={target} size={120} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-2xl font-bold ${remaining < 0 ? 'text-red-500' : 'text-zinc-900'}`}>
                {remaining < 0 ? `-${formatCalories(Math.abs(remaining))}` : formatCalories(remaining)}
              </span>
              <span className="text-xs text-zinc-500">kcal left</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-zinc-900">Today</h2>
              <Badge variant={dayType === 'hybrid' ? 'info' : dayType === 'running' || dayType === 'pilates' ? 'success' : 'default'}>
                {dayType === 'hybrid' ? 'Hybrid day' : dayType === 'running' ? 'Run day' : dayType === 'pilates' ? 'Pilates day' : 'Rest day'}
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 mb-3">
              {formatCalories(eaten)} eaten · {formatCalories(target)} target
            </p>

            <div className="space-y-2">
              <MacroBar label="Protein" current={macros.protein} target={profile.proteinTargetG} color="bg-blue-500" />
              <MacroBar label="Carbs" current={macros.carbs} target={carbohydrateTarget} color="bg-amber-400" />
              <MacroBar label="Fat" current={macros.fat} target={fatTarget} color="bg-purple-400" />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Add */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {[
          { label: '+Meal', icon: <Utensils size={16} />, action: () => { setEditMeal(undefined); setShowMealForm(true); } },
          { label: '+Training', icon: <Dumbbell size={16} />, action: () => { setEditTraining(undefined); setShowTrainingForm(true); } },
          { label: '+Metrics', icon: <Scale size={16} />, action: () => setShowMetricsForm(true) },
        ].map(item => (
          <button
            key={item.label}
            onClick={item.action}
            className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-zinc-900 text-white hover:bg-zinc-700 transition-colors col-span-1 sm:col-span-2"
          >
            {item.icon}
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Deficit stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard
          label="Deficit Today"
          value={deficitToday !== null ? `${formatCalories(deficitToday)} kcal` : '—'}
          sub={deficitToday !== null ? (deficitToday > 0 ? 'On track' : 'Surplus') : 'Log meals first'}
          icon={<Flame size={16} className={deficitToday && deficitToday > 0 ? 'text-orange-500' : 'text-zinc-400'} />}
        />
        <StatCard
          label="Plan Deficit"
          value={`${formatCalories(accDeficit)} kcal`}
          sub={`≈ ${projectedFatLoss.toFixed(2)}kg fat`}
          icon={<TrendingDown size={16} className="text-emerald-500" />}
        />
        <StatCard
          label="Projected"
          value={`${outcome.mid.toFixed(2)}kg`}
          sub={`by ${format(new Date(profile.goalDate), 'MMM d')}`}
          icon={<Target size={16} className="text-blue-500" />}
        />
        <StatCard
          label="7-day Avg Deficit"
          value={`${formatCalories(avgDeficit)} kcal`}
          sub="rolling average"
          icon={<Zap size={16} className="text-violet-500" />}
        />
      </div>

      {/* Streaks */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-amber-50 rounded-xl"><Trophy size={18} className="text-amber-500" /></div>
          <div>
            <p className="text-xs text-zinc-500">Adherence streak</p>
            <p className="text-xl font-bold text-zinc-900">{adherenceStreak} <span className="text-sm font-normal text-zinc-500">days</span></p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl"><Dumbbell size={18} className="text-emerald-500" /></div>
          <div>
            <p className="text-xs text-zinc-500">Training streak</p>
            <p className="text-xl font-bold text-zinc-900">{trainingStreak} <span className="text-sm font-normal text-zinc-500">days</span></p>
          </div>
        </Card>
      </div>

      {/* Today's plan checklist */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Today's Plan</h3>
        <div className="space-y-2">
          {scheduledToday.map(t => {
            const done = loggedTypes.includes(t);
            return (
              <div key={t} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${done ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200'}`}>
                    {done && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span className={`text-sm ${done ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>{t}</span>
                </div>
                {!done && (
                  <button
                    onClick={() => { setEditTraining(undefined); setShowTrainingForm(true); }}
                    className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
                  >
                    Log →
                  </button>
                )}
              </div>
            );
          })}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${log.metrics.waterLiters && log.metrics.waterLiters >= 2 ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200'}`}>
                {log.metrics.waterLiters && log.metrics.waterLiters >= 2 && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className={`text-sm ${log.metrics.waterLiters && log.metrics.waterLiters >= 2 ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                Hydration (≥2L) {log.metrics.waterLiters ? `· ${log.metrics.waterLiters}L logged` : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${log.metrics.steps && log.metrics.steps >= 7000 ? 'bg-zinc-900 border-zinc-900' : 'border-zinc-200'}`}>
                {log.metrics.steps && log.metrics.steps >= 7000 && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span className={`text-sm ${log.metrics.steps && log.metrics.steps >= 7000 ? 'text-zinc-400 line-through' : 'text-zinc-700'}`}>
                Steps (≥7k) {log.metrics.steps ? `· ${log.metrics.steps.toLocaleString()}` : ''}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Meals list */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-zinc-900">Meals</h3>
          <button
            onClick={() => { setEditMeal(undefined); setShowMealForm(true); }}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {log.meals.length === 0 ? (
          <EmptyState
            icon={<Utensils size={20} />}
            title="No meals logged"
            description="Tap + Add to log your first meal today"
          />
        ) : (
          <div className="divide-y divide-zinc-50">
            {log.meals.map(meal => (
              <div key={meal.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900 truncate">{meal.name}</p>
                  <p className="text-xs text-zinc-500">
                    {meal.time} · P {formatMacro(meal.macros.protein)}g · C {formatMacro(meal.macros.carbs)}g · F {formatMacro(meal.macros.fat)}g
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <span className="text-sm font-semibold text-zinc-900">{formatCalories(meal.calories)}</span>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditMeal(meal); setShowMealForm(true); }} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => deleteMeal(todayStr, meal.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-between px-4 py-3 bg-zinc-50">
              <span className="text-xs font-medium text-zinc-600">Total</span>
              <span className="text-sm font-bold text-zinc-900">{formatCalories(eaten)} kcal · P {formatMacro(macros.protein)}g</span>
            </div>
          </div>
        )}
      </Card>

      {/* Training list */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3 className="text-sm font-semibold text-zinc-900">Training</h3>
          <button
            onClick={() => { setEditTraining(undefined); setShowTrainingForm(true); }}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        </div>
        {log.training.length === 0 ? (
          <EmptyState
            icon={<Dumbbell size={20} />}
            title="No training logged"
            description="Log a workout to track your activity"
          />
        ) : (
          <div className="divide-y divide-zinc-50">
            {log.training.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-900">{t.type}</p>
                  <p className="text-xs text-zinc-500">
                    {t.durationMin}min {t.distanceKm ? `· ${t.distanceKm}km` : ''} {t.rpe ? `· RPE ${t.rpe}` : ''}
                  </p>
                </div>
                <div className="flex gap-1 ml-3">
                  <button onClick={() => { setEditTraining(t); setShowTrainingForm(true); }} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => deleteTraining(todayStr, t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Metrics summary */}
      {(log.metrics.weightKg || log.metrics.steps || log.metrics.waterLiters) && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-zinc-900">Metrics</h3>
            <button onClick={() => setShowMetricsForm(true)} className="text-xs text-zinc-400 hover:text-zinc-700">Edit</button>
          </div>
          <div className="flex flex-wrap gap-4">
            {log.metrics.weightKg && <div><p className="text-xs text-zinc-500">Weight</p><p className="text-sm font-semibold">{log.metrics.weightKg}kg</p></div>}
            {log.metrics.steps && <div><p className="text-xs text-zinc-500">Steps</p><p className="text-sm font-semibold">{log.metrics.steps.toLocaleString()}</p></div>}
            {log.metrics.waterLiters && <div><p className="text-xs text-zinc-500">Water</p><p className="text-sm font-semibold">{log.metrics.waterLiters}L</p></div>}
            {log.metrics.sleepHours && <div><p className="text-xs text-zinc-500">Sleep</p><p className="text-sm font-semibold">{log.metrics.sleepHours}h</p></div>}
          </div>
          {log.metrics.tags && log.metrics.tags.length > 0 && (
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {log.metrics.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Projected outcome card */}
      <Card className="p-4 border-zinc-200">
        <h3 className="text-sm font-semibold text-zinc-900 mb-2">Projected by {format(new Date(profile.goalDate), 'MMM d')}</h3>
        <div className="flex items-end gap-3">
          <div>
            <p className="text-3xl font-bold text-zinc-900">{outcome.mid.toFixed(2)}<span className="text-base font-normal text-zinc-500">kg</span></p>
            <p className="text-xs text-zinc-500">estimated fat loss</p>
          </div>
          <div className="text-xs text-zinc-400 pb-1">
            <p>Range: {outcome.low.toFixed(2)}–{outcome.high.toFixed(2)}kg</p>
            <p>Goal: {profile.goalFatLossKg}kg</p>
          </div>
        </div>
        {outcome.mid < profile.goalFatLossKg * 0.5 && (
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg">
            ⚠ Current trend is below goal pace. Consider a 100–150 kcal reduction.
          </p>
        )}
      </Card>

      {/* Modals */}
      <MealForm
        open={showMealForm}
        onOpenChange={setShowMealForm}
        onSubmit={meal => editMeal ? updateMeal(todayStr, { ...meal, id: editMeal.id }) : addMeal(todayStr, meal)}
        foods={foods}
        templates={templates}
        initialMeal={editMeal}
        date={todayStr}
      />
      <TrainingForm
        open={showTrainingForm}
        onOpenChange={setShowTrainingForm}
        onSubmit={t => editTraining ? updateTraining(todayStr, { ...t, id: editTraining.id }) : addTraining(todayStr, t)}
        initialTraining={editTraining}
        date={todayStr}
      />
      <QuickMetricsForm
        open={showMetricsForm}
        onOpenChange={setShowMetricsForm}
        onSubmit={metrics => updateMetrics(todayStr, metrics)}
        current={log.metrics}
        date={todayStr}
      />
    </div>
  );
}
