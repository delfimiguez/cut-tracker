'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppState, DayLog, FoodItem, MealTemplate, UserProfile, MealEntry, TrainingEntry, DayMetrics } from './types';
import { loadAppState, saveProfile, saveDayLog, saveFood, deleteFood, saveTemplate, exportJSON, importJSON, exportCSV } from './storage';
import { format } from 'date-fns';

interface AppContextValue {
  state: AppState | null;
  loading: boolean;
  todayStr: string;
  getDayLog: (date: string) => DayLog;
  updateProfile: (profile: UserProfile) => Promise<void>;
  addMeal: (date: string, meal: Omit<MealEntry, 'id'>) => Promise<void>;
  updateMeal: (date: string, meal: MealEntry) => Promise<void>;
  deleteMeal: (date: string, mealId: string) => Promise<void>;
  addTraining: (date: string, training: Omit<TrainingEntry, 'id'>) => Promise<void>;
  updateTraining: (date: string, training: TrainingEntry) => Promise<void>;
  deleteTraining: (date: string, trainingId: string) => Promise<void>;
  updateMetrics: (date: string, metrics: Partial<DayMetrics>) => Promise<void>;
  addFood: (food: Omit<FoodItem, 'id'>) => Promise<void>;
  updateFood: (food: FoodItem) => Promise<void>;
  removeFood: (id: string) => Promise<void>;
  addTemplate: (template: Omit<MealTemplate, 'id'>) => Promise<void>;
  exportData: () => Promise<{ json: string; csv: string }>;
  importData: (json: string) => Promise<void>;
  resetData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function makeEmptyDayLog(date: string): DayLog {
  return { date, meals: [], training: [], metrics: {} };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    loadAppState().then(s => {
      setState(s);
      setLoading(false);
    });
  }, []);

  const getDayLog = useCallback(
    (date: string): DayLog => {
      return state?.logs[date] ?? makeEmptyDayLog(date);
    },
    [state]
  );

  const updateProfile = useCallback(async (profile: UserProfile) => {
    await saveProfile(profile);
    setState(s => s ? { ...s, profile } : s);
  }, []);

  const addMeal = useCallback(async (date: string, meal: Omit<MealEntry, 'id'>) => {
    setState(s => {
      if (!s) return s;
      const existing = s.logs[date] ?? makeEmptyDayLog(date);
      const updated: DayLog = {
        ...existing,
        meals: [...existing.meals, { ...meal, id: generateId() }],
      };
      saveDayLog(updated);
      return { ...s, logs: { ...s.logs, [date]: updated } };
    });
  }, []);

  const updateMeal = useCallback(async (date: string, meal: MealEntry) => {
    setState(s => {
      if (!s) return s;
      const existing = s.logs[date] ?? makeEmptyDayLog(date);
      const updated: DayLog = {
        ...existing,
        meals: existing.meals.map(m => m.id === meal.id ? meal : m),
      };
      saveDayLog(updated);
      return { ...s, logs: { ...s.logs, [date]: updated } };
    });
  }, []);

  const deleteMeal = useCallback(async (date: string, mealId: string) => {
    setState(s => {
      if (!s) return s;
      const existing = s.logs[date] ?? makeEmptyDayLog(date);
      const updated: DayLog = {
        ...existing,
        meals: existing.meals.filter(m => m.id !== mealId),
      };
      saveDayLog(updated);
      return { ...s, logs: { ...s.logs, [date]: updated } };
    });
  }, []);

  const addTraining = useCallback(async (date: string, training: Omit<TrainingEntry, 'id'>) => {
    setState(s => {
      if (!s) return s;
      const existing = s.logs[date] ?? makeEmptyDayLog(date);
      const updated: DayLog = {
        ...existing,
        training: [...existing.training, { ...training, id: generateId() }],
      };
      saveDayLog(updated);
      return { ...s, logs: { ...s.logs, [date]: updated } };
    });
  }, []);

  const updateTraining = useCallback(async (date: string, training: TrainingEntry) => {
    setState(s => {
      if (!s) return s;
      const existing = s.logs[date] ?? makeEmptyDayLog(date);
      const updated: DayLog = {
        ...existing,
        training: existing.training.map(t => t.id === training.id ? training : t),
      };
      saveDayLog(updated);
      return { ...s, logs: { ...s.logs, [date]: updated } };
    });
  }, []);

  const deleteTraining = useCallback(async (date: string, trainingId: string) => {
    setState(s => {
      if (!s) return s;
      const existing = s.logs[date] ?? makeEmptyDayLog(date);
      const updated: DayLog = {
        ...existing,
        training: existing.training.filter(t => t.id !== trainingId),
      };
      saveDayLog(updated);
      return { ...s, logs: { ...s.logs, [date]: updated } };
    });
  }, []);

  const updateMetrics = useCallback(async (date: string, metrics: Partial<DayMetrics>) => {
    setState(s => {
      if (!s) return s;
      const existing = s.logs[date] ?? makeEmptyDayLog(date);
      const updated: DayLog = {
        ...existing,
        metrics: { ...existing.metrics, ...metrics },
      };
      saveDayLog(updated);
      return { ...s, logs: { ...s.logs, [date]: updated } };
    });
  }, []);

  const addFood = useCallback(async (food: Omit<FoodItem, 'id'>) => {
    const newFood = { ...food, id: generateId() };
    await saveFood(newFood);
    setState(s => s ? { ...s, foods: [...s.foods, newFood] } : s);
  }, []);

  const updateFood = useCallback(async (food: FoodItem) => {
    await saveFood(food);
    setState(s => s ? { ...s, foods: s.foods.map(f => f.id === food.id ? food : f) } : s);
  }, []);

  const removeFood = useCallback(async (id: string) => {
    await deleteFood(id);
    setState(s => s ? { ...s, foods: s.foods.filter(f => f.id !== id) } : s);
  }, []);

  const addTemplate = useCallback(async (template: Omit<MealTemplate, 'id'>) => {
    const newTemplate = { ...template, id: generateId() };
    await saveTemplate(newTemplate);
    setState(s => s ? { ...s, templates: [...s.templates, newTemplate] } : s);
  }, []);

  const exportData = useCallback(async () => {
    if (!state) return { json: '{}', csv: '' };
    const json = await exportJSON(state);
    const csv = exportCSV(state);
    return { json, csv };
  }, [state]);

  const importData = useCallback(async (json: string) => {
    const newState = await importJSON(json);
    setState(newState);
  }, []);

  const resetData = useCallback(async () => {
    const fresh = await loadAppState();
    setState(fresh);
  }, []);

  return (
    <AppContext.Provider value={{
      state, loading, todayStr, getDayLog, updateProfile,
      addMeal, updateMeal, deleteMeal,
      addTraining, updateTraining, deleteTraining,
      updateMetrics, addFood, updateFood, removeFood,
      addTemplate, exportData, importData, resetData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
