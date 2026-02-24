'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/primitives';
import { TrainingEntry, TrainingType } from '@/lib/types';
import { cn } from '@/lib/utils';

const TRAINING_TYPES: { value: TrainingType; label: string; emoji: string }[] = [
  { value: 'Hybrid', label: 'Hybrid', emoji: '⚡' },
  { value: 'Pilates', label: 'Pilates', emoji: '🤸' },
  { value: 'Run Z2', label: 'Run Z2', emoji: '🏃' },
  { value: 'Run', label: 'Run', emoji: '🏃' },
  { value: 'Strength', label: 'Strength', emoji: '🏋️' },
  { value: 'Walk', label: 'Walk', emoji: '🚶' },
  { value: 'Rest', label: 'Rest', emoji: '😴' },
];

interface TrainingFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (training: Omit<TrainingEntry, 'id'>) => void;
  initialTraining?: TrainingEntry;
  date: string;
}

export function TrainingForm({ open, onOpenChange, onSubmit, initialTraining, date }: TrainingFormProps) {
  const [type, setType] = useState<TrainingType>('Hybrid');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [rpe, setRpe] = useState('');
  const [calories, setCalories] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialTraining) {
      setType(initialTraining.type);
      setDuration(String(initialTraining.durationMin));
      setDistance(initialTraining.distanceKm ? String(initialTraining.distanceKm) : '');
      setRpe(initialTraining.rpe ? String(initialTraining.rpe) : '');
      setCalories(initialTraining.caloriesBurned ? String(initialTraining.caloriesBurned) : '');
      setNotes(initialTraining.notes ?? '');
    }
  }, [initialTraining]);

  useEffect(() => {
    if (!open && !initialTraining) {
      setType('Hybrid'); setDuration(''); setDistance(''); setRpe(''); setCalories(''); setNotes('');
    }
    setErrors({});
  }, [open, initialTraining]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) errs.duration = 'Enter duration in minutes';
    if (rpe && (Number(rpe) < 1 || Number(rpe) > 10)) errs.rpe = 'RPE must be 1–10';
    setErrors(errs); return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      type, durationMin: Math.round(Number(duration)),
      distanceKm: distance ? parseFloat(distance) : undefined,
      rpe: rpe ? parseFloat(rpe) : undefined,
      caloriesBurned: calories ? Math.round(Number(calories)) : undefined,
      notes: notes || undefined,
    });
    onOpenChange(false);
  }

  const showDistance = type === 'Run Z2' || type === 'Run' || type === 'Walk';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialTraining ? 'Edit session' : 'Log training'}</DialogTitle>
          <DialogDescription>{date}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented type selector */}
          <div className="space-y-1.5">
            <Label>Type</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {TRAINING_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-lg border p-2 text-xs font-medium transition-colors',
                    type === t.value
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-input bg-background hover:bg-accent'
                  )}
                >
                  <span className="text-base leading-none">{t.emoji}</span>
                  <span className="leading-none">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Duration (min)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} placeholder="45" min={1} />
              {errors.duration && <p className="text-xs text-destructive">{errors.duration}</p>}
            </div>
            {showDistance ? (
              <div className="space-y-1.5">
                <Label>Distance (km)</Label>
                <Input type="number" value={distance} onChange={e => setDistance(e.target.value)} placeholder="5.0" min={0} step={0.1} />
              </div>
            ) : (
              <div className="space-y-1.5">
                <Label>Calories burned (opt)</Label>
                <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="300" min={0} />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>RPE (1–10)</Label>
              <Input type="number" value={rpe} onChange={e => setRpe(e.target.value)} placeholder="7" min={1} max={10} step={0.5} />
              {errors.rpe && <p className="text-xs text-destructive">{errors.rpe}</p>}
            </div>
            {showDistance && (
              <div className="space-y-1.5">
                <Label>Calories burned (opt)</Label>
                <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="300" min={0} />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it feel? Any observations..." rows={2} />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">{initialTraining ? 'Save changes' : 'Log session'}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
