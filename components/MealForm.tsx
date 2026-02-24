'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SelectField } from './ui';
import { MealEntry, FoodItem, MealTemplate, Macros } from '@/lib/types';
import { getCaloriesFromMacros } from '@/lib/calculations';
import { format } from 'date-fns';
import { ChevronDown } from 'lucide-react';

interface MealFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (meal: Omit<MealEntry, 'id'>) => void;
  foods: FoodItem[];
  templates: MealTemplate[];
  initialMeal?: MealEntry;
  date: string;
}

type Mode = 'quick' | 'macros' | 'template' | 'library';

export function MealForm({ open, onOpenChange, onSubmit, foods, templates, initialMeal, date }: MealFormProps) {
  const [mode, setMode] = useState<Mode>('quick');
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFood, setSelectedFood] = useState('');
  const [grams, setGrams] = useState('100');

  useEffect(() => {
    if (initialMeal) {
      setName(initialMeal.name);
      setCalories(String(initialMeal.calories));
      setProtein(String(initialMeal.macros.protein));
      setCarbs(String(initialMeal.macros.carbs));
      setFat(String(initialMeal.macros.fat));
      setTime(initialMeal.time);
      setMode('macros');
    }
  }, [initialMeal]);

  useEffect(() => {
    if (!open) {
      if (!initialMeal) {
        setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
        setTime(format(new Date(), 'HH:mm'));
        setSelectedFood(''); setGrams('100');
      }
      setErrors({});
    }
  }, [open, initialMeal]);

  // Auto-calc calories from macros
  useEffect(() => {
    if (mode === 'macros' && (protein || carbs || fat)) {
      const p = parseFloat(protein) || 0;
      const c = parseFloat(carbs) || 0;
      const f = parseFloat(fat) || 0;
      if (p + c + f > 0) setCalories(String(getCaloriesFromMacros({ protein: p, carbs: c, fat: f })));
    }
  }, [protein, carbs, fat, mode]);

  // Update fields when food selected from library
  useEffect(() => {
    if (selectedFood && mode === 'library') {
      const food = foods.find(f => f.id === selectedFood);
      if (food) {
        const g = parseFloat(grams) || food.servingGrams;
        const ratio = g / food.servingGrams;
        setName(food.name);
        setCalories(String(Math.round(food.calories * ratio)));
        setProtein(String(Math.round(food.macros.protein * ratio * 10) / 10));
        setCarbs(String(Math.round(food.macros.carbs * ratio * 10) / 10));
        setFat(String(Math.round(food.macros.fat * ratio * 10) / 10));
      }
    }
  }, [selectedFood, grams, foods, mode]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!calories || isNaN(Number(calories)) || Number(calories) < 0) errs.calories = 'Enter valid calories';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      time,
      name: name.trim(),
      calories: Math.round(Number(calories)),
      macros: {
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      },
    });
    onOpenChange(false);
  }

  function applyTemplate(template: MealTemplate) {
    const totals = template.items.reduce(
      (s, item) => ({
        cal: s.cal + item.calories,
        p: s.p + item.macros.protein,
        c: s.c + item.macros.carbs,
        f: s.f + item.macros.fat,
      }),
      { cal: 0, p: 0, c: 0, f: 0 }
    );
    setName(template.name);
    setCalories(String(Math.round(totals.cal)));
    setProtein(String(Math.round(totals.p * 10) / 10));
    setCarbs(String(Math.round(totals.c * 10) / 10));
    setFat(String(Math.round(totals.f * 10) / 10));
    setMode('macros');
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={initialMeal ? 'Edit Meal' : 'Add Meal'}
      description={`Logging for ${date}`}
    >
      {/* Mode tabs */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl mb-4">
        {(['quick', 'macros', 'library', 'template'] as Mode[]).map(m => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
              mode === m ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Template list */}
      {mode === 'template' && (
        <div className="space-y-2 mb-4">
          {templates.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">No templates saved yet.</p>}
          {templates.map(tmpl => {
            const total = tmpl.items.reduce((s, i) => s + i.calories, 0);
            const p = tmpl.items.reduce((s, i) => s + i.macros.protein, 0);
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => applyTemplate(tmpl)}
                className="w-full flex items-start justify-between p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-colors text-left"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">{tmpl.name}</p>
                  <p className="text-xs text-zinc-500">{tmpl.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900">{Math.round(total)} kcal</p>
                  <p className="text-xs text-zinc-500">{Math.round(p)}g protein</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Library picker */}
      {mode === 'library' && (
        <div className="space-y-3 mb-4">
          <SelectField
            label="Food"
            value={selectedFood}
            onValueChange={setSelectedFood}
            placeholder="Search food..."
            options={foods.map(f => ({ value: f.id, label: `${f.name} (${f.servingGrams}g)` }))}
          />
          {selectedFood && (
            <Input
              label="Amount (g)"
              type="number"
              value={grams}
              onChange={e => setGrams(e.target.value)}
              min={1}
            />
          )}
          {selectedFood && <p className="text-xs text-zinc-500">Values calculated for {grams}g serving.</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Input
              label="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Chicken & rice"
              error={errors.name}
            />
          </div>
          <Input
            label="Time"
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
          <Input
            label="Calories (kcal)"
            type="number"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            min={0}
            error={errors.calories}
          />
        </div>

        {(mode === 'macros' || mode === 'library') && (
          <div className="grid grid-cols-3 gap-2">
            <Input label="Protein (g)" type="number" value={protein} onChange={e => setProtein(e.target.value)} min={0} step={0.1} />
            <Input label="Carbs (g)" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} min={0} step={0.1} />
            <Input label="Fat (g)" type="number" value={fat} onChange={e => setFat(e.target.value)} min={0} step={0.1} />
          </div>
        )}

        {mode === 'macros' && protein && carbs && fat && (
          <p className="text-xs text-zinc-400">Calories auto-calculated from macros.</p>
        )}

        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1">{initialMeal ? 'Save Changes' : 'Add Meal'}</Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
