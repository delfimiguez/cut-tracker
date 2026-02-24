'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/primitives';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MealEntry, FoodItem, MealTemplate } from '@/lib/types';
import { getCaloriesFromMacros } from '@/lib/calculations';

interface MealFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (meal: Omit<MealEntry, 'id'>) => void;
  foods: FoodItem[];
  templates: MealTemplate[];
  initialMeal?: MealEntry;
  date: string;
}

export function MealForm({ open, onOpenChange, onSubmit, foods, templates, initialMeal, date }: MealFormProps) {
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFood, setSelectedFood] = useState('');
  const [grams, setGrams] = useState('100');
  const [activeTab, setActiveTab] = useState(initialMeal ? 'macros' : 'quick');

  useEffect(() => {
    if (initialMeal) {
      setName(initialMeal.name); setCalories(String(initialMeal.calories));
      setProtein(String(initialMeal.macros.protein)); setCarbs(String(initialMeal.macros.carbs));
      setFat(String(initialMeal.macros.fat)); setTime(initialMeal.time);
      setActiveTab('macros');
    }
  }, [initialMeal]);

  useEffect(() => {
    if (!open && !initialMeal) {
      setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      setTime(format(new Date(), 'HH:mm')); setSelectedFood(''); setGrams('100');
      setActiveTab('quick');
    }
    setErrors({});
  }, [open, initialMeal]);

  useEffect(() => {
    if (activeTab === 'macros') {
      const p = parseFloat(protein) || 0, c = parseFloat(carbs) || 0, f = parseFloat(fat) || 0;
      if (p + c + f > 0) setCalories(String(getCaloriesFromMacros({ protein: p, carbs: c, fat: f })));
    }
  }, [protein, carbs, fat, activeTab]);

  useEffect(() => {
    if (!selectedFood || activeTab !== 'library') return;
    const food = foods.find(f => f.id === selectedFood);
    if (!food) return;
    const g = parseFloat(grams) || food.servingGrams;
    const r = g / food.servingGrams;
    setName(food.name);
    setCalories(String(Math.round(food.calories * r)));
    setProtein(String(Math.round(food.macros.protein * r * 10) / 10));
    setCarbs(String(Math.round(food.macros.carbs * r * 10) / 10));
    setFat(String(Math.round(food.macros.fat * r * 10) / 10));
  }, [selectedFood, grams, foods, activeTab]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!calories || isNaN(Number(calories)) || Number(calories) < 0) errs.calories = 'Enter valid calories';
    setErrors(errs); return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ time, name: name.trim(), calories: Math.round(Number(calories)), macros: { protein: parseFloat(protein) || 0, carbs: parseFloat(carbs) || 0, fat: parseFloat(fat) || 0 } });
    onOpenChange(false);
  }

  function applyTemplate(tmpl: MealTemplate) {
    const t = tmpl.items.reduce((s, i) => ({ cal: s.cal + i.calories, p: s.p + i.macros.protein, c: s.c + i.macros.carbs, f: s.f + i.macros.fat }), { cal: 0, p: 0, c: 0, f: 0 });
    setName(tmpl.name); setCalories(String(Math.round(t.cal)));
    setProtein(String(Math.round(t.p * 10) / 10)); setCarbs(String(Math.round(t.c * 10) / 10)); setFat(String(Math.round(t.f * 10) / 10));
    setActiveTab('macros');
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialMeal ? 'Edit meal' : 'Add meal'}</DialogTitle>
          <DialogDescription>{date}</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="quick">Quick</TabsTrigger>
            <TabsTrigger value="macros">Macros</TabsTrigger>
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="template">Templates</TabsTrigger>
          </TabsList>

          <TabsContent value="template">
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {templates.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No templates saved.</p>}
              {templates.map(tmpl => {
                const totalCal = tmpl.items.reduce((s, i) => s + i.calories, 0);
                const totalP = tmpl.items.reduce((s, i) => s + i.macros.protein, 0);
                return (
                  <button key={tmpl.id} type="button" onClick={() => applyTemplate(tmpl)}
                    className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors text-left">
                    <div>
                      <p className="text-sm font-medium">{tmpl.name}</p>
                      <p className="text-xs text-muted-foreground">{tmpl.items.length} items · P {Math.round(totalP)}g</p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums">{Math.round(totalCal)} kcal</p>
                  </button>
                );
              })}
            </div>
          </TabsContent>

          <form onSubmit={handleSubmit}>
            <TabsContent value="quick" className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="qn">Name</Label>
                <Input id="qn" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Chicken & rice" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Calories</Label>
                  <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="350" min={0} />
                  {errors.calories && <p className="text-xs text-destructive">{errors.calories}</p>}
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" className="flex-1">{initialMeal ? 'Save' : 'Add meal'}</Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              </div>
            </TabsContent>

            <TabsContent value="macros" className="space-y-3">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Salmon & veg" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label>Protein (g)</Label>
                  <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} min={0} step={0.1} placeholder="30" />
                </div>
                <div className="space-y-1.5">
                  <Label>Carbs (g)</Label>
                  <Input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} min={0} step={0.1} placeholder="40" />
                </div>
                <div className="space-y-1.5">
                  <Label>Fat (g)</Label>
                  <Input type="number" value={fat} onChange={e => setFat(e.target.value)} min={0} step={0.1} placeholder="10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Calories (auto)</Label>
                  <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} min={0} />
                  {errors.calories && <p className="text-xs text-destructive">{errors.calories}</p>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Calories auto-calculated from macros.</p>
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="flex-1">{initialMeal ? 'Save' : 'Add meal'}</Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              </div>
            </TabsContent>

            <TabsContent value="library" className="space-y-3">
              <div className="space-y-1.5">
                <Label>Food item</Label>
                <Select value={selectedFood} onValueChange={setSelectedFood}>
                  <SelectTrigger><SelectValue placeholder="Select a food..." /></SelectTrigger>
                  <SelectContent>
                    {foods.map(f => <SelectItem key={f.id} value={f.id}>{f.name} ({f.servingGrams}g)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {selectedFood && (
                <div className="space-y-1.5">
                  <Label>Amount (g)</Label>
                  <Input type="number" value={grams} onChange={e => setGrams(e.target.value)} min={1} />
                </div>
              )}
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={e => setTime(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Calories</Label>
                  <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} min={0} />
                  {errors.calories && <p className="text-xs text-destructive">{errors.calories}</p>}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button type="submit" className="flex-1">{initialMeal ? 'Save' : 'Add meal'}</Button>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
