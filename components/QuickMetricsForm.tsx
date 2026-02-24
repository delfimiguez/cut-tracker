'use client';

import React, { useState } from 'react';
import { Modal, Button, Input, TagPicker } from './ui';
import { DayMetrics } from '@/lib/types';

interface QuickMetricsFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (metrics: Partial<DayMetrics>) => void;
  current: DayMetrics;
  date: string;
}

export function QuickMetricsForm({ open, onOpenChange, onSubmit, current, date }: QuickMetricsFormProps) {
  const [weight, setWeight] = useState(current.weightKg ? String(current.weightKg) : '');
  const [steps, setSteps] = useState(current.steps ? String(current.steps) : '');
  const [water, setWater] = useState(current.waterLiters ? String(current.waterLiters) : '');
  const [sleep, setSleep] = useState(current.sleepHours ? String(current.sleepHours) : '');
  const [notes, setNotes] = useState(current.notes ?? '');
  const [tags, setTags] = useState<string[]>(current.tags ?? []);
  const [mood, setMood] = useState<1|2|3|4|5|undefined>(current.mood);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      weightKg: weight ? parseFloat(weight) : undefined,
      steps: steps ? parseInt(steps) : undefined,
      waterLiters: water ? parseFloat(water) : undefined,
      sleepHours: sleep ? parseFloat(sleep) : undefined,
      notes: notes || undefined,
      tags: tags.length > 0 ? tags : undefined,
      mood,
    });
    onOpenChange(false);
  }

  const moodLabels: Record<number, string> = { 1: '😞', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Daily Metrics" description={date}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Weight (kg)" type="number" value={weight} onChange={e => setWeight(e.target.value)} step={0.1} min={30} max={200} placeholder="60.0" />
          <Input label="Steps" type="number" value={steps} onChange={e => setSteps(e.target.value)} min={0} placeholder="8000" />
          <Input label="Water (L)" type="number" value={water} onChange={e => setWater(e.target.value)} step={0.1} min={0} max={10} placeholder="2.0" />
          <Input label="Sleep (h)" type="number" value={sleep} onChange={e => setSleep(e.target.value)} step={0.5} min={0} max={24} placeholder="7.5" />
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Mood</p>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setMood(mood === m ? undefined : m)}
                className={`flex-1 py-2 rounded-xl text-xl transition-all ${mood === m ? 'bg-zinc-900 shadow-md scale-105' : 'bg-zinc-100 hover:bg-zinc-200'}`}
              >
                {moodLabels[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Tags</p>
          <TagPicker selected={tags} onChange={setTags} />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-zinc-600 uppercase tracking-wide">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 resize-none placeholder:text-zinc-400"
            rows={2}
            placeholder="How are you feeling? Anything to note..."
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1">Save Metrics</Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
