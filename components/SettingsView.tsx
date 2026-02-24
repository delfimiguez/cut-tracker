'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/primitives';
import { Separator } from '@/components/ui/primitives';
import { useApp } from '@/lib/context';
import { UserProfile } from '@/lib/types';
import { Download, Upload, Trash2, Check } from 'lucide-react';

export default function SettingsView() {
  const { state, updateProfile, exportData, importData, resetData } = useApp();
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!state) return null;
  const [form, setForm] = useState<UserProfile>({ ...state.profile });

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    await updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function set(key: keyof UserProfile, value: unknown) {
    setForm(f => ({ ...f, [key]: value }));
  }

  function setTarget(key: keyof UserProfile['calorieTargets'], value: number) {
    setForm(f => ({ ...f, calorieTargets: { ...f.calorieTargets, [key]: value } }));
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
    try { await importData(await file.text()); alert('Data imported successfully!'); }
    catch { alert('Failed to import. Please check the file format.'); }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information and plan details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Age</Label>
                <Input type="number" value={form.age} onChange={e => set('age', Number(e.target.value))} min={10} max={120} />
              </div>
              <div className="space-y-1.5">
                <Label>Height (cm)</Label>
                <Input type="number" value={form.heightCm} onChange={e => set('heightCm', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Start weight (kg)</Label>
                <Input type="number" value={form.weightKg} onChange={e => set('weightKg', Number(e.target.value))} step={0.1} />
              </div>
              <div className="space-y-1.5">
                <Label>Plan start date</Label>
                <Input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Goal date</Label>
                <Input type="date" value={form.goalDate} onChange={e => set('goalDate', e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Goal fat loss (kg)</Label>
              <Input type="number" value={form.goalFatLossKg} onChange={e => set('goalFatLossKg', Number(e.target.value))} step={0.1} min={0.1} max={20} className="max-w-xs" />
            </div>
          </CardContent>
        </Card>

        {/* Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Calorie Targets</CardTitle>
            <CardDescription>Daily targets by training day type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Hybrid day</Label>
                <Input type="number" value={form.calorieTargets.hybrid} onChange={e => setTarget('hybrid', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Running day</Label>
                <Input type="number" value={form.calorieTargets.running} onChange={e => setTarget('running', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Pilates day</Label>
                <Input type="number" value={form.calorieTargets.pilates} onChange={e => setTarget('pilates', Number(e.target.value))} />
              </div>
              <div className="space-y-1.5">
                <Label>Rest day</Label>
                <Input type="number" value={form.calorieTargets.rest} onChange={e => setTarget('rest', Number(e.target.value))} />
              </div>
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label>Protein target (g/day)</Label>
              <Input type="number" value={form.proteinTargetG} onChange={e => set('proteinTargetG', Number(e.target.value))} min={50} max={400} className="max-w-xs" />
            </div>
            <div className="space-y-1.5">
              <Label>Maintenance TDEE (kcal)</Label>
              <Input type="number" value={form.maintenanceTdee} onChange={e => set('maintenanceTdee', Number(e.target.value))} min={1000} max={5000} className="max-w-xs" />
              <p className="text-xs text-muted-foreground">Baseline used to calculate daily deficit. Default: 2150 kcal.</p>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="exercise-toggle" className="text-sm font-medium cursor-pointer">Count exercise calories</Label>
                <p className="text-xs text-muted-foreground">Add burned calories back to daily budget</p>
              </div>
              <Switch
                id="exercise-toggle"
                checked={form.countExerciseCalories}
                onCheckedChange={v => set('countExerciseCalories', v)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full gap-2">
          {saved ? <><Check className="h-4 w-4" /> Saved</> : 'Save settings'}
        </Button>
      </form>

      {/* Data management */}
      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
          <CardDescription>Export, import, or reset your data. All data is stored locally in your browser.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2" onClick={handleExportJSON}>
              <Download className="h-4 w-4" /> Export JSON
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportCSV}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" className="gap-2 col-span-2" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import JSON
            </Button>
          </div>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Separator />
          <Button
            variant="destructive"
            className="w-full gap-2"
            onClick={() => { if (confirm('Reset all data? This cannot be undone.')) resetData(); }}
          >
            <Trash2 className="h-4 w-4" /> Reset all data
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Data stored in IndexedDB (localStorage fallback). Nothing leaves your device.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-5">
          <p className="text-xs text-muted-foreground">Cut Tracker · v1.0 · 7700 kcal ≈ 1 kg fat (estimate only)</p>
        </CardContent>
      </Card>
    </div>
  );
}
