'use client';

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { AppState, DEFAULT_PROFILE, SEED_FOODS, BREAKFAST_TEMPLATE, DayLog, FoodItem, MealTemplate, UserProfile } from './types';

interface CutTrackerDB extends DBSchema {
  profile: { key: string; value: UserProfile };
  logs: { key: string; value: DayLog };
  foods: { key: string; value: FoodItem };
  templates: { key: string; value: MealTemplate };
}

let dbPromise: Promise<IDBPDatabase<CutTrackerDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CutTrackerDB>('cut-tracker', 1, {
      upgrade(db) {
        db.createObjectStore('profile');
        db.createObjectStore('logs', { keyPath: 'date' });
        db.createObjectStore('foods', { keyPath: 'id' });
        db.createObjectStore('templates', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function loadAppState(): Promise<AppState> {
  try {
    const db = await getDB();
    const profile = (await db.get('profile', 'user')) ?? DEFAULT_PROFILE;
    const logsArr = await db.getAll('logs');
    const logs: Record<string, DayLog> = {};
    for (const log of logsArr) logs[log.date] = log;

    let foods = await db.getAll('foods');
    if (foods.length === 0) {
      for (const f of SEED_FOODS) await db.put('foods', f);
      foods = SEED_FOODS;
    }

    let templates = await db.getAll('templates');
    if (templates.length === 0) {
      await db.put('templates', BREAKFAST_TEMPLATE);
      templates = [BREAKFAST_TEMPLATE];
    }

    // Ensure breakfast template is set on profile if not
    if (!profile.breakfastTemplate) {
      profile.breakfastTemplate = BREAKFAST_TEMPLATE;
    }

    return { profile, logs, foods, templates };
  } catch {
    // Fallback to localStorage
    return loadFromLocalStorage();
  }
}

function loadFromLocalStorage(): AppState {
  try {
    const raw = localStorage.getItem('cut-tracker');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    profile: { ...DEFAULT_PROFILE, breakfastTemplate: BREAKFAST_TEMPLATE },
    logs: {},
    foods: SEED_FOODS,
    templates: [BREAKFAST_TEMPLATE],
  };
}

function saveToLocalStorage(state: AppState) {
  try {
    localStorage.setItem('cut-tracker', JSON.stringify(state));
  } catch {}
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    const db = await getDB();
    await db.put('profile', profile, 'user');
  } catch {
    const state = loadFromLocalStorage();
    saveToLocalStorage({ ...state, profile });
  }
}

export async function saveDayLog(log: DayLog): Promise<void> {
  try {
    const db = await getDB();
    await db.put('logs', log);
  } catch {
    const state = loadFromLocalStorage();
    saveToLocalStorage({ ...state, logs: { ...state.logs, [log.date]: log } });
  }
}

export async function saveFood(food: FoodItem): Promise<void> {
  try {
    const db = await getDB();
    await db.put('foods', food);
  } catch {
    const state = loadFromLocalStorage();
    const foods = [...state.foods.filter(f => f.id !== food.id), food];
    saveToLocalStorage({ ...state, foods });
  }
}

export async function deleteFood(id: string): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('foods', id);
  } catch {
    const state = loadFromLocalStorage();
    saveToLocalStorage({ ...state, foods: state.foods.filter(f => f.id !== id) });
  }
}

export async function saveTemplate(template: MealTemplate): Promise<void> {
  try {
    const db = await getDB();
    await db.put('templates', template);
  } catch {
    const state = loadFromLocalStorage();
    const templates = [...state.templates.filter(t => t.id !== template.id), template];
    saveToLocalStorage({ ...state, templates });
  }
}

export async function exportJSON(state: AppState): Promise<string> {
  return JSON.stringify(state, null, 2);
}

export async function importJSON(json: string): Promise<AppState> {
  const state = JSON.parse(json) as AppState;
  try {
    const db = await getDB();
    await db.put('profile', state.profile, 'user');
    for (const log of Object.values(state.logs)) await db.put('logs', log);
    for (const food of state.foods) await db.put('foods', food);
    for (const tmpl of state.templates) await db.put('templates', tmpl);
  } catch {
    saveToLocalStorage(state);
  }
  return state;
}

export function exportCSV(state: AppState): string {
  const rows: string[] = ['Date,Meal,Calories,Protein,Carbs,Fat,Training,Steps,Weight'];
  for (const [date, log] of Object.entries(state.logs).sort()) {
    const trainingSummary = log.training.map(t => `${t.type} ${t.durationMin}min`).join('; ');
    if (log.meals.length === 0 && log.training.length === 0) {
      rows.push(`${date},,,,,,${trainingSummary},${log.metrics.steps ?? ''},${log.metrics.weightKg ?? ''}`);
    }
    for (const meal of log.meals) {
      rows.push(`${date},"${meal.name}",${meal.calories},${meal.macros.protein},${meal.macros.carbs},${meal.macros.fat},"${trainingSummary}",${log.metrics.steps ?? ''},${log.metrics.weightKg ?? ''}`);
    }
  }
  return rows.join('\n');
}
