'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SelectField, Textarea } from './ui';
import { TrainingEntry, TrainingType } from '@/lib/types';
import { format } from 'date-fns';

interface TrainingFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (training: Omit<TrainingEntry, 'id'>) => void;
  initialTraining?: TrainingEntry;
  date: string;
}

const TRAINING_TYPES: TrainingType[] = ['Hybrid', 'Pilates', 'Run Z2', 'Run', 'Strength', 'Walk', 'Rest'];

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
      setErrors({});
    }
  }, [open, initialTraining]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) errs.duration = 'Enter duration in minutes';
    if (rpe && (Number(rpe) < 1 || Number(rpe) > 10)) errs.rpe = 'RPE must be 1–10';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      type,
      durationMin: Math.round(Number(duration)),
      distanceKm: distance ? parseFloat(distance) : undefined,
      rpe: rpe ? parseFloat(rpe) : undefined,
      caloriesBurned: calories ? Math.round(Number(calories)) : undefined,
      notes: notes || undefined,
    });
    onOpenChange(false);
  }

  const showDistance = type === 'Run Z2' || type === 'Run' || type === 'Walk';

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initialTraining ? 'Edit Training' : 'Log Training'}
      description={`Session on ${date}`}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <SelectField
          label="Type"
          value={type}
          onValueChange={v => setType(v as TrainingType)}
          options={TRAINING_TYPES.map(t => ({ value: t, label: t }))}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (min)"
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            min={1}
            error={errors.duration}
          />
          {showDistance && (
            <Input
              label="Distance (km)"
              type="number"
              value={distance}
              onChange={e => setDistance(e.target.value)}
              min={0}
              step={0.1}
            />
          )}
          <Input
            label="RPE (1–10)"
            type="number"
            value={rpe}
            onChange={e => setRpe(e.target.value)}
            min={1}
            max={10}
            step={0.5}
            error={errors.rpe}
          />
          <Input
            label="Calories burned (optional)"
            type="number"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            min={0}
          />
        </div>

        <Textarea
          label="Notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="How did it feel? Any observations..."
          rows={2}
        />

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">{initialTraining ? 'Save Changes' : 'Log Session'}</Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
