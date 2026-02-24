'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/primitives';
import { DayMetrics } from '@/lib/types';
import { cn } from '@/lib/utils';

const TAGS = ['PMS', 'Sore', 'Hungry', 'Great sleep', 'Tired', 'Stressed', 'Good energy', 'Bloated'];
const MOODS: { v: 1|2|3|4|5; e: string }[] = [
  { v: 1, e: '😞' }, { v: 2, e: '😕' }, { v: 3, e: '😐' }, { v: 4, e: '🙂' }, { v: 5, e: '😄' },
];

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

  function toggleTag(tag: string) {
    setTags(t => t.includes(tag) ? t.filter(x => x !== tag) : [...t, tag]);
  }

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Daily metrics</DialogTitle>
          <DialogDescription>{date}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Weight (kg)</Label>
              <Input type="number" value={weight} onChange={e => setWeight(e.target.value)} step={0.1} min={30} max={200} placeholder="60.0" />
            </div>
            <div className="space-y-1.5">
              <Label>Steps</Label>
              <Input type="number" value={steps} onChange={e => setSteps(e.target.value)} min={0} placeholder="8000" />
            </div>
            <div className="space-y-1.5">
              <Label>Water (L)</Label>
              <Input type="number" value={water} onChange={e => setWater(e.target.value)} step={0.1} min={0} max={10} placeholder="2.0" />
            </div>
            <div className="space-y-1.5">
              <Label>Sleep (h)</Label>
              <Input type="number" value={sleep} onChange={e => setSleep(e.target.value)} step={0.5} min={0} max={24} placeholder="7.5" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mood</Label>
            <div className="flex gap-2">
              {MOODS.map(m => (
                <button
                  key={m.v}
                  type="button"
                  onClick={() => setMood(mood === m.v ? undefined : m.v)}
                  className={cn(
                    'flex-1 rounded-lg py-2.5 text-xl transition-all',
                    mood === m.v ? 'bg-foreground' : 'bg-secondary hover:bg-accent'
                  )}
                >
                  {m.e}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-1.5">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    tags.includes(tag)
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-input bg-background hover:bg-accent'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How are you feeling? Anything to note..." rows={2} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Save metrics</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
