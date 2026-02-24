'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard, Calendar, TrendingUp, BookOpen,
  Settings, Flame, ChevronRight,
} from 'lucide-react';
import { useApp } from '@/lib/context';
import {
  getTotalMealCalories, getCaloriesRemaining, getDayType, getCalorieTarget,
} from '@/lib/calculations';

export type AppTab = 'today' | 'log' | 'insights' | 'foods' | 'settings';

const NAV_ITEMS: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'today', label: 'Today', icon: LayoutDashboard },
  { id: 'log', label: 'Log', icon: Calendar },
  { id: 'insights', label: 'Insights', icon: TrendingUp },
  { id: 'foods', label: 'Foods', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const TAB_TITLES: Record<AppTab, string> = {
  today: 'Today',
  log: 'Daily Log',
  insights: 'Insights',
  foods: 'Food Library',
  settings: 'Settings',
};

interface AppShellProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export function AppShell({ children, activeTab, onTabChange }: AppShellProps) {
  const { state, getDayLog, todayStr } = useApp();

  const log = state ? getDayLog(todayStr) : null;
  const dayType = state && log ? getDayType(log, todayStr) : 'rest';
  const target = state ? getCalorieTarget(state.profile, dayType) : 1700;
  const eaten = log ? getTotalMealCalories(log) : 0;
  const remaining = state && log ? getCaloriesRemaining(state.profile, log, todayStr) : target;
  const pct = Math.min(100, (eaten / target) * 100);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[220px] border-r bg-card shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 h-14 px-5 border-b">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
            <Flame className="h-3.5 w-3.5 text-background" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Cut Tracker</span>
        </div>

        {/* Inline calorie mini-indicator */}
        {state && (
          <div className="mx-4 mt-4 rounded-lg border bg-background p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Remaining today</span>
              <span className={cn('text-xs font-semibold tabular-nums', remaining < 0 ? 'text-destructive' : 'text-foreground')}>
                {remaining < 0 ? '–' : ''}{Math.abs(Math.round(remaining))} kcal
              </span>
            </div>
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', remaining < 0 ? 'bg-destructive' : 'bg-foreground')}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{Math.round(eaten)} / {target} kcal</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom info */}
        <div className="px-5 py-4 border-t">
          <p className="text-xs text-muted-foreground">{state?.profile.name ?? 'User'}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(), 'EEE, MMM d')}</p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center justify-between border-b bg-card px-6 shrink-0">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-foreground">
              <Flame className="h-3.5 w-3.5 text-background" />
            </div>
          </div>

          <h1 className="text-sm font-semibold hidden lg:block">{TAB_TITLES[activeTab]}</h1>
          <h1 className="text-sm font-semibold lg:hidden">{TAB_TITLES[activeTab]}</h1>

          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-5xl px-4 py-6 lg:px-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-card pb-safe">
        <div className="flex items-center">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  'flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-foreground' : 'text-muted-foreground')} />
                {item.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
