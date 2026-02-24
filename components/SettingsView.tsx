'use client';

import React, { useState, useRef } from 'react';
import { Card, Button, Input, SwitchField } from '@/components/ui';
import { useApp } from '@/lib/context';
import { UserProfile, BREAKFAST_TEMPLATE } from '@/lib/types';
import { Download, Upload, Trash2, RefreshCw } from 'lucide-react';

export default function SettingsView() {
  const { state, updateProfile, exportData, importData, resetData } = useApp();
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!state) return null;
  const { profile } = state;

  const [form, setForm] = useState<UserProfile>({ ...profile });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleExportJSON() {
    const { json } = await exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cut-tracker-data.json'; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportCSV() {
    const { csv } = await exportData();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cut-tracker-log.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      await importData(text);
      alert('Data imported successfully!');
    } catch {
      alert('Failed to import. Please check the file format.');
    }
  }

  function set(key: keyof UserProfile, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function setTarget(key: keyof UserProfile['calorieTargets'], value: number) {
    setForm(f => ({ ...f, calorieTargets: { ...f.calorieTargets, [key]: value } }));
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile */}
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Profile</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Name" value={form.name} onChange={e => set('name', e.target.value)} />
            <Input label="Age" type="number" value={form.age} onChange={e => set('age', Number(e.target.value))} min={10} max={120} />
            <Input label="Height (cm)" type="number" value={form.heightCm} onChange={e => set('heightCm', Number(e.target.value))} min={100} max={250} />
            <Input label="Start Weight (kg)" type="number" value={form.weightKg} onChange={e => set('weightKg', Number(e.target.value))} step={0.1} min={30} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            <Input label="Goal Date" type="date" value={form.goalDate} onChange={e => set('goalDate', e.target.value)} />
          </div>
          <Input label="Goal Fat Loss (kg)" type="number" value={form.goalFatLossKg} onChange={e => set('goalFatLossKg', Number(e.target.value))} step={0.1} min={0.1} max={20} />
        </Card>

        {/* Calorie Targets */}
        <Card className="p-4 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">Daily Calorie Targets</h3>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Hybrid day (kcal)" type="number" value={form.calorieTargets.hybrid} onChange={e => setTarget('hybrid', Number(e.target.value))} min={500} max={5000} />
            <Input label="Running day (kcal)" type="number" value={form.calorieTargets.running} onChange={e => setTarget('running', Number(e.target.value))} min={500} max={5000} />
            <Input label="Pilates day (kcal)" type="number" value={form.calorieTargets.pilates} onChange={e => setTarget('pilates', Number(e.target.value))} min={500} max={5000} />
            <Input label="Rest day (kcal)" type="number" value={form.calorieTargets.rest} onChange={e => setTarget('rest', Number(e.target.value))} min={500} max={5000} />
          </div>
          <Input
            label="Protein Target (g/day)"
            type="number"
            value={form.proteinTargetG}
            onChange={e => set('proteinTargetG', Number(e.target.value))}
            min={50} max={400}
          />
          <Input
            label="Maintenance TDEE (kcal)"
            type="number"
            value={form.maintenanceTdee}
            onChange={e => set('maintenanceTdee', Number(e.target.value))}
            min={1000} max={5000}
            hint="Baseline used to calculate daily deficit. Default: 2150 kcal."
          />
        </Card>

        {/* Preferences */}
        <Card className="p-4 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-900">Preferences</h3>
          <SwitchField
            id="count-exercise"
            label="Count exercise calories"
            description="Add burned calories back to daily budget"
            checked={form.countExerciseCalories}
            onCheckedChange={v => set('countExerciseCalories', v)}
          />
        </Card>

        <Button type="submit" className="w-full" size="lg">
          {saved ? '✓ Saved' : 'Save Settings'}
        </Button>
      </form>

      {/* Data management */}
      <Card className="p-4 space-y-3">
        <h3 className="text-sm font-semibold text-zinc-900">Data</h3>
        <div className="space-y-2">
          <Button variant="secondary" className="w-full" onClick={handleExportJSON}>
            <Download size={16} /> Export JSON
          </Button>
          <Button variant="secondary" className="w-full" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </Button>
          <Button variant="secondary" className="w-full" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Import JSON
          </Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        <div className="border-t border-zinc-100 pt-3">
          <Button
            variant="danger"
            className="w-full"
            onClick={() => {
              if (confirm('Reset all data? This cannot be undone.')) resetData();
            }}
          >
            <Trash2 size={16} /> Reset All Data
          </Button>
        </div>

        <p className="text-xs text-zinc-400">
          Data stored locally in IndexedDB (falls back to localStorage). No data leaves your device.
        </p>
      </Card>

      {/* About */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-1">About</h3>
        <p className="text-xs text-zinc-500">Cut Tracker · Local-first calorie deficit app · v1.0</p>
        <p className="text-xs text-zinc-400 mt-1">7700 kcal ≈ 1 kg fat. Projected fat loss is an estimate only.</p>
      </Card>
    </div>
  );
}
