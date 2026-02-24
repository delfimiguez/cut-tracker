'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context';
import { AppShell, type AppTab } from '@/components/AppShell';
import DashboardView from '@/components/DashboardView';
import LogView from '@/components/LogView';
import InsightsView from '@/components/InsightsView';
import FoodLibraryView from '@/components/FoodLibraryView';
import SettingsView from '@/components/SettingsView';
import { Flame } from 'lucide-react';

export default function Home() {
  const { loading } = useApp();
  const [activeTab, setActiveTab] = useState<AppTab>('today');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground animate-pulse">
            <Flame className="h-5 w-5 text-background" />
          </div>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && <DashboardView />}
      {activeTab === 'log' && <LogView />}
      {activeTab === 'insights' && <InsightsView />}
      {activeTab === 'foods' && <FoodLibraryView />}
      {activeTab === 'settings' && <SettingsView />}
    </AppShell>
  );
}
