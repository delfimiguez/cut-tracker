'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import DashboardView from '@/components/DashboardView';
import LogView from '@/components/LogView';
import InsightsView from '@/components/InsightsView';
import FoodLibraryView from '@/components/FoodLibraryView';
import SettingsView from '@/components/SettingsView';
import { LayoutDashboard, Calendar, TrendingUp, BookOpen, Settings, Flame } from 'lucide-react';
import { format } from 'date-fns';
import { getTotalMealCalories, getCaloriesRemaining, getDayType, getCalorieTarget } from '@/lib/calculations';

type Tab = 'today' | 'log' | 'insights' | 'foods' | 'settings';

const tabs = [
  { id: 'today' as Tab, label: 'Today', icon: <LayoutDashboard size={20} /> },
  { id: 'log' as Tab, label: 'Log', icon: <Calendar size={20} /> },
  { id: 'insights' as Tab, label: 'Insights', icon: <TrendingUp size={20} /> },
  { id: 'foods' as Tab, label: 'Foods', icon: <BookOpen size={20} /> },
  { id: 'settings' as Tab, label: 'Settings', icon: <Settings size={20} /> },
];

const tabTitles: Record<Tab, string> = {
  today: 'Today',
  log: 'Log',
  insights: 'Insights',
  foods: 'Food Library',
  settings: 'Settings',
};

export default function Home() {
  const { state, loading, getDayLog, todayStr } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('today');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
            <Flame size={20} className="text-white" />
          </div>
          <p className="text-sm text-zinc-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!state) return null;

  const log = getDayLog(todayStr);
  const dayType = getDayType(log, todayStr);
  const target = getCalorieTarget(state.profile, dayType);
  const eaten = getTotalMealCalories(log);
  const remaining = getCaloriesRemaining(state.profile, log, todayStr);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <nav className="hidden lg:flex flex-col w-56 bg-white border-r border-zinc-100 shrink-0 sticky top-0 h-screen">
        <div className="p-5 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
              <Flame size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">Cut Tracker</p>
              <p className="text-xs text-zinc-400">{state.profile.name}</p>
            </div>
          </div>
        </div>

        <div className="mx-3 mt-3 p-3 bg-zinc-50 rounded-xl">
          <p className="text-xs text-zinc-500 mb-1">Today remaining</p>
          <p className={"text-lg font-bold " + (remaining < 0 ? 'text-red-500' : 'text-zinc-900')}>
            {remaining < 0 ? '-' : ''}{Math.abs(Math.round(remaining))} kcal
          </p>
          <div className="mt-1.5 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className={"h-full rounded-full transition-all " + (remaining < 0 ? 'bg-red-500' : 'bg-zinc-900')}
              style={{ width: Math.min(100, (eaten / target) * 100) + '%' }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-0.5 p-3 flex-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors " + (activeTab === tab.id ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900')}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-100">
          <p className="text-xs text-zinc-400">{format(new Date(), 'EEEE, MMM d')}</p>
        </div>
      </nav>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between lg:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
              <Flame size={14} className="text-white" />
            </div>
          </div>
          <h1 className="text-base font-semibold text-zinc-900">{tabTitles[activeTab]}</h1>
          <p className="text-xs text-zinc-400 hidden sm:block">{format(new Date(), 'EEE, MMM d yyyy')}</p>
          <div className="w-7 lg:hidden" />
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 pb-24 lg:pb-6 max-w-2xl w-full mx-auto">
          {activeTab === 'today' && <DashboardView />}
          {activeTab === 'log' && <LogView />}
          {activeTab === 'insights' && <InsightsView />}
          {activeTab === 'foods' && <FoodLibraryView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-zinc-100 z-20">
        <div className="flex items-center justify-around px-2 py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={"flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0 " + (activeTab === tab.id ? 'text-zinc-900' : 'text-zinc-400')}
            >
              <div className={"p-1.5 rounded-xl transition-colors " + (activeTab === tab.id ? 'bg-zinc-100' : '')}>
                {tab.icon}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
