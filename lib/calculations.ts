import { DayLog, DayType, TrainingType, UserProfile, Macros, KCAL_PER_KG_FAT, WEEKLY_SCHEDULE } from './types';
import { format, eachDayOfInterval, parseISO, differenceInDays, isAfter, isBefore, isToday } from 'date-fns';

export function getDayType(log: DayLog | undefined, date: string): DayType {
  if (log?.metrics.dayTypeOverride) return log.metrics.dayTypeOverride;
  
  const dayOfWeek = new Date(date + 'T12:00:00').getDay();
  const scheduled = WEEKLY_SCHEDULE[dayOfWeek] ?? ['Rest'];
  
  const loggedTypes = log?.training.map(t => t.type) ?? [];
  const allTypes = [...scheduled, ...loggedTypes];

  if (allTypes.includes('Hybrid')) return 'hybrid';
  if (allTypes.includes('Run Z2') || allTypes.includes('Run')) return 'running';
  if (allTypes.includes('Pilates')) return 'pilates';
  return 'rest';
}

export function getCalorieTarget(profile: UserProfile, dayType: DayType): number {
  return profile.calorieTargets[dayType];
}

export function getTotalMealCalories(log: DayLog | undefined): number {
  if (!log) return 0;
  return log.meals.reduce((sum, m) => sum + m.calories, 0);
}

export function getTotalMacros(log: DayLog | undefined): Macros {
  if (!log) return { protein: 0, carbs: 0, fat: 0 };
  return log.meals.reduce(
    (sum, m) => ({
      protein: sum.protein + m.macros.protein,
      carbs: sum.carbs + m.macros.carbs,
      fat: sum.fat + m.macros.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 }
  );
}

export function getExerciseCalories(log: DayLog | undefined): number {
  if (!log) return 0;
  return log.training.reduce((sum, t) => sum + (t.caloriesBurned ?? 0), 0);
}

export function getCaloriesRemaining(
  profile: UserProfile,
  log: DayLog | undefined,
  date: string
): number {
  const dayType = getDayType(log, date);
  const target = getCalorieTarget(profile, dayType);
  const eaten = getTotalMealCalories(log);
  const exercise = profile.countExerciseCalories ? getExerciseCalories(log) : 0;
  return target - eaten + exercise;
}

export function getDayDeficit(
  profile: UserProfile,
  log: DayLog | undefined,
  date: string
): number {
  const dayType = getDayType(log, date);
  const eaten = getTotalMealCalories(log);
  const exercise = getExerciseCalories(log);
  
  // TDEE multiplier based on day type
  const multipliers: Record<DayType, number> = {
    hybrid: 1.0,
    running: 1.0,
    pilates: 0.97,
    rest: 0.90,
  };
  
  const tdee = profile.maintenanceTdee * multipliers[dayType];
  const netCalories = eaten - (profile.countExerciseCalories ? 0 : exercise);
  return tdee - netCalories;
}

export function getAccumulatedDeficit(
  profile: UserProfile,
  logs: Record<string, DayLog>,
  fromDate: string,
  toDate: string
): number {
  const start = parseISO(fromDate);
  const end = parseISO(toDate);
  if (isAfter(start, end)) return 0;
  
  const days = eachDayOfInterval({ start, end });
  let total = 0;
  for (const day of days) {
    const dateStr = format(day, 'yyyy-MM-dd');
    // Only count days up to today
    if (isAfter(day, new Date())) break;
    const log = logs[dateStr];
    if (log && log.meals.length > 0) {
      total += getDayDeficit(profile, log, dateStr);
    }
  }
  return total;
}

export function getProjectedFatLoss(accumulatedDeficitKcal: number): number {
  return accumulatedDeficitKcal / KCAL_PER_KG_FAT;
}

export function getDaysRemaining(goalDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const goal = parseISO(goalDate);
  return differenceInDays(goal, today);
}

export function getDaysElapsed(startDate: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = parseISO(startDate);
  return Math.max(0, differenceInDays(today, start));
}

export function getRollingAverage(
  profile: UserProfile,
  logs: Record<string, DayLog>,
  days: number = 7
): { avgCalories: number; avgProtein: number; avgDeficit: number } {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(format(d, 'yyyy-MM-dd'));
  }
  
  const loggedDays = dates.filter(d => logs[d] && logs[d].meals.length > 0);
  if (loggedDays.length === 0) return { avgCalories: 0, avgProtein: 0, avgDeficit: 0 };
  
  const avgCalories = loggedDays.reduce((s, d) => s + getTotalMealCalories(logs[d]), 0) / loggedDays.length;
  const avgProtein = loggedDays.reduce((s, d) => s + getTotalMacros(logs[d]).protein, 0) / loggedDays.length;
  const avgDeficit = loggedDays.reduce((s, d) => s + getDayDeficit(profile, logs[d], d), 0) / loggedDays.length;
  
  return { avgCalories, avgProtein, avgDeficit };
}

export function getProjectedOutcome(
  profile: UserProfile,
  logs: Record<string, DayLog>
): { low: number; mid: number; high: number } {
  const { avgDeficit } = getRollingAverage(profile, logs, 7);
  const daysLeft = getDaysRemaining(profile.goalDate);
  const alreadyLost = getProjectedFatLoss(
    getAccumulatedDeficit(profile, logs, profile.startDate, format(new Date(), 'yyyy-MM-dd'))
  );
  
  const projectedExtra = (avgDeficit * daysLeft) / KCAL_PER_KG_FAT;
  return {
    low: alreadyLost + projectedExtra * 0.85,
    mid: alreadyLost + projectedExtra,
    high: alreadyLost + projectedExtra * 1.15,
  };
}

export function getTrainingStreak(logs: Record<string, DayLog>): number {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs[dateStr];
    if (log && log.training.length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getAdherenceStreak(
  profile: UserProfile,
  logs: Record<string, DayLog>
): number {
  let streak = 0;
  const today = new Date();
  for (let i = 1; i <= 60; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = format(d, 'yyyy-MM-dd');
    const log = logs[dateStr];
    if (!log || log.meals.length === 0) break;
    const remaining = getCaloriesRemaining(profile, log, dateStr);
    if (remaining >= -100) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export function getWeeklyData(
  profile: UserProfile,
  logs: Record<string, DayLog>,
  weeksBack: number = 0
) {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay() + 1 - weeksBack * 7);
  weekStart.setHours(0, 0, 0, 0);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const data = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const log = logs[dateStr];
    const dayType = getDayType(log, dateStr);
    const target = getCalorieTarget(profile, dayType);
    const calories = getTotalMealCalories(log);
    const protein = getTotalMacros(log).protein;
    const deficit = log && log.meals.length > 0 ? getDayDeficit(profile, log, dateStr) : null;
    return {
      date: dateStr,
      label: format(day, 'EEE'),
      calories,
      target,
      protein,
      deficit,
      hasLog: !!log && log.meals.length > 0,
      training: log?.training ?? [],
    };
  });
  
  return data;
}

export function getCaloriesFromMacros(macros: Macros): number {
  return Math.round(macros.protein * 4 + macros.carbs * 4 + macros.fat * 9);
}

export function formatCalories(n: number): string {
  return Math.round(n).toLocaleString();
}

export function formatMacro(n: number): string {
  return Math.round(n).toString();
}
