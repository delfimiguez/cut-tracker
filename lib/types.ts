export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface UserProfile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  startDate: string; // ISO date string YYYY-MM-DD
  goalDate: string;
  goalFatLossKg: number;
  proteinTargetG: number;
  calorieTargets: {
    hybrid: number;
    running: number;
    pilates: number;
    rest: number;
  };
  maintenanceTdee: number;
  countExerciseCalories: boolean;
  units: 'metric' | 'imperial';
  breakfastTemplate: MealTemplate | null;
}

export type TrainingType = 'Hybrid' | 'Pilates' | 'Run Z2' | 'Run' | 'Strength' | 'Walk' | 'Rest';
export type DayType = 'hybrid' | 'running' | 'pilates' | 'rest';

export interface MealEntry {
  id: string;
  time: string; // HH:MM
  name: string;
  calories: number;
  macros: Macros;
  notes?: string;
}

export interface TrainingEntry {
  id: string;
  type: TrainingType;
  durationMin: number;
  distanceKm?: number;
  rpe?: number;
  caloriesBurned?: number;
  notes?: string;
}

export interface DayMetrics {
  weightKg?: number;
  steps?: number;
  waterLiters?: number;
  sleepHours?: number;
  notes?: string;
  tags?: string[];
  mood?: 1 | 2 | 3 | 4 | 5;
  dayTypeOverride?: DayType;
}

export interface DayLog {
  date: string; // YYYY-MM-DD
  meals: MealEntry[];
  training: TrainingEntry[];
  metrics: DayMetrics;
}

export interface FoodItem {
  id: string;
  name: string;
  servingGrams: number;
  calories: number;
  macros: Macros;
  category?: string;
}

export interface MealTemplate {
  id: string;
  name: string;
  items: {
    foodItemId?: string;
    name: string;
    grams: number;
    calories: number;
    macros: Macros;
  }[];
}

export interface AppState {
  profile: UserProfile;
  logs: Record<string, DayLog>;
  foods: FoodItem[];
  templates: MealTemplate[];
}

export const KCAL_PER_KG_FAT = 7700;

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Delfi',
  age: 28,
  heightCm: 169,
  weightKg: 60.0,
  startDate: '2026-02-25',
  goalDate: '2026-04-13',
  goalFatLossKg: 2.0,
  proteinTargetG: 120,
  calorieTargets: {
    hybrid: 1900,
    running: 1800,
    pilates: 1800,
    rest: 1700,
  },
  maintenanceTdee: 2150,
  countExerciseCalories: false,
  units: 'metric',
  breakfastTemplate: null,
};

export const BREAKFAST_TEMPLATE: MealTemplate = {
  id: 'breakfast-fixed',
  name: 'Fixed Breakfast',
  items: [
    { name: 'Chia seeds', grams: 16, calories: 77, macros: { protein: 2.6, carbs: 5.3, fat: 4.9 } },
    { name: 'Whey protein (1 scoop)', grams: 30, calories: 120, macros: { protein: 24, carbs: 3, fat: 1.5 } },
    { name: 'Skim milk', grams: 60, calories: 21, macros: { protein: 2.1, carbs: 3.0, fat: 0.1 } },
    { name: 'Banana', grams: 30, calories: 27, macros: { protein: 0.4, carbs: 6.9, fat: 0.1 } },
    { name: 'Blueberries', grams: 20, calories: 11, macros: { protein: 0.1, carbs: 2.7, fat: 0.1 } },
    { name: 'Apple', grams: 40, calories: 21, macros: { protein: 0.1, carbs: 5.5, fat: 0.1 } },
    { name: 'Granola', grams: 15, calories: 67, macros: { protein: 1.5, carbs: 10.5, fat: 2.1 } },
  ],
};

export const SEED_FOODS: FoodItem[] = [
  { id: 'f1', name: 'Chicken breast (cooked)', servingGrams: 100, calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6 }, category: 'Protein' },
  { id: 'f2', name: 'Salmon fillet', servingGrams: 100, calories: 208, macros: { protein: 20, carbs: 0, fat: 13 }, category: 'Protein' },
  { id: 'f3', name: 'Eggs (1 large)', servingGrams: 50, calories: 72, macros: { protein: 6.3, carbs: 0.4, fat: 5 }, category: 'Protein' },
  { id: 'f4', name: 'Greek yogurt (0% fat)', servingGrams: 100, calories: 59, macros: { protein: 10, carbs: 3.6, fat: 0.4 }, category: 'Protein' },
  { id: 'f5', name: 'Cottage cheese', servingGrams: 100, calories: 98, macros: { protein: 11, carbs: 3.4, fat: 4.3 }, category: 'Protein' },
  { id: 'f6', name: 'White rice (cooked)', servingGrams: 100, calories: 130, macros: { protein: 2.7, carbs: 28, fat: 0.3 }, category: 'Carbs' },
  { id: 'f7', name: 'Oats (dry)', servingGrams: 40, calories: 154, macros: { protein: 5.4, carbs: 27, fat: 2.8 }, category: 'Carbs' },
  { id: 'f8', name: 'Sweet potato (baked)', servingGrams: 100, calories: 90, macros: { protein: 2, carbs: 21, fat: 0.1 }, category: 'Carbs' },
  { id: 'f9', name: 'Pasta (cooked)', servingGrams: 100, calories: 157, macros: { protein: 5.8, carbs: 31, fat: 0.9 }, category: 'Carbs' },
  { id: 'f10', name: 'Avocado', servingGrams: 50, calories: 80, macros: { protein: 1, carbs: 4.3, fat: 7.3 }, category: 'Fats' },
  { id: 'f11', name: 'Olive oil (1 tbsp)', servingGrams: 14, calories: 119, macros: { protein: 0, carbs: 0, fat: 13.5 }, category: 'Fats' },
  { id: 'f12', name: 'Almonds', servingGrams: 30, calories: 174, macros: { protein: 6, carbs: 5.4, fat: 15 }, category: 'Fats' },
  { id: 'f13', name: 'Banana (medium)', servingGrams: 120, calories: 107, macros: { protein: 1.3, carbs: 27, fat: 0.4 }, category: 'Fruit' },
  { id: 'f14', name: 'Apple (medium)', servingGrams: 150, calories: 78, macros: { protein: 0.4, carbs: 21, fat: 0.3 }, category: 'Fruit' },
  { id: 'f15', name: 'Broccoli', servingGrams: 100, calories: 34, macros: { protein: 2.8, carbs: 7, fat: 0.4 }, category: 'Veg' },
  { id: 'f16', name: 'Spinach', servingGrams: 100, calories: 23, macros: { protein: 2.9, carbs: 3.6, fat: 0.4 }, category: 'Veg' },
  { id: 'f17', name: 'Whey protein (1 scoop)', servingGrams: 30, calories: 120, macros: { protein: 24, carbs: 3, fat: 1.5 }, category: 'Protein' },
  { id: 'f18', name: 'Protein bar', servingGrams: 60, calories: 220, macros: { protein: 20, carbs: 24, fat: 7 }, category: 'Protein' },
  { id: 'f19', name: 'Skim milk (100ml)', servingGrams: 100, calories: 35, macros: { protein: 3.5, carbs: 5, fat: 0.1 }, category: 'Dairy' },
  { id: 'f20', name: 'Sourdough bread (1 slice)', servingGrams: 50, calories: 120, macros: { protein: 4, carbs: 24, fat: 1 }, category: 'Carbs' },
];

export const WEEKLY_SCHEDULE: Record<number, TrainingType[]> = {
  1: ['Hybrid'], // Monday
  2: ['Pilates', 'Run Z2'], // Tuesday
  3: ['Hybrid'], // Wednesday
  4: ['Run Z2'], // Thursday
  5: ['Hybrid', 'Run Z2'], // Friday — or just Hybrid
  6: ['Walk'], // Saturday
  0: ['Rest'], // Sunday
};
