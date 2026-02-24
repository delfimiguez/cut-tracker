'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/primitives';
import { Separator } from '@/components/ui/primitives';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useApp } from '@/lib/context';
import { FoodItem } from '@/lib/types';
import { getCaloriesFromMacros } from '@/lib/calculations';
import { Plus, Trash2, Pencil, Search, Package } from 'lucide-react';

export default function FoodLibraryView() {
  const { state, addFood, updateFood, removeFood } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editFood, setEditFood] = useState<FoodItem | undefined>();

  if (!state) return null;
  const { foods } = state;

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (f.category ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, FoodItem[]>>((acc, f) => {
    const cat = f.category ?? 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search foods..." className="pl-9"
          />
        </div>
        <Button onClick={() => { setEditFood(undefined); setShowForm(true); }} className="gap-1.5 shrink-0">
          <Plus className="h-4 w-4" /> Add food
        </Button>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">{search ? 'No results found' : 'No foods yet'}</p>
            <p className="text-xs text-muted-foreground">{search ? 'Try a different search term' : 'Add your first food to the library'}</p>
            {!search && (
              <Button size="sm" className="mt-1" onClick={() => { setEditFood(undefined); setShowForm(true); }}>
                <Plus className="h-4 w-4" /> Add food
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        Object.entries(grouped).sort().map(([category, items]) => (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-0 pt-4">
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">{category}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2 pb-0">
              <div>
                {items.map((food, i) => (
                  <div key={food.id}>
                    <div className="group flex items-center gap-3 py-3 hover:bg-accent -mx-5 px-5 rounded-lg transition-colors">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{food.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {food.servingGrams}g · P {food.macros.protein}g · C {food.macros.carbs}g · F {food.macros.fat}g
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums shrink-0">{food.calories} kcal</span>
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditFood(food); setShowForm(true); }}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeFood(food.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                    {i < items.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <FoodFormDialog
        open={showForm} onOpenChange={setShowForm}
        onSubmit={food => editFood ? updateFood({ ...food, id: editFood.id }) : addFood(food)}
        initialFood={editFood}
      />
    </div>
  );
}

interface FoodFormDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (food: Omit<FoodItem, 'id'>) => void;
  initialFood?: FoodItem;
}

function FoodFormDialog({ open, onOpenChange, onSubmit, initialFood }: FoodFormDialogProps) {
  const [name, setName] = useState(initialFood?.name ?? '');
  const [category, setCategory] = useState(initialFood?.category ?? '');
  const [grams, setGrams] = useState(initialFood ? String(initialFood.servingGrams) : '100');
  const [calories, setCalories] = useState(initialFood ? String(initialFood.calories) : '');
  const [protein, setProtein] = useState(initialFood ? String(initialFood.macros.protein) : '');
  const [carbs, setCarbs] = useState(initialFood ? String(initialFood.macros.carbs) : '');
  const [fat, setFat] = useState(initialFood ? String(initialFood.macros.fat) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open && initialFood) {
      setName(initialFood.name); setCategory(initialFood.category ?? '');
      setGrams(String(initialFood.servingGrams)); setCalories(String(initialFood.calories));
      setProtein(String(initialFood.macros.protein)); setCarbs(String(initialFood.macros.carbs)); setFat(String(initialFood.macros.fat));
    } else if (!open) {
      setName(''); setCategory(''); setGrams('100'); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      setErrors({});
    }
  }, [open, initialFood]);

  React.useEffect(() => {
    const p = parseFloat(protein) || 0, c = parseFloat(carbs) || 0, f = parseFloat(fat) || 0;
    if (p + c + f > 0) setCalories(String(getCaloriesFromMacros({ protein: p, carbs: c, fat: f })));
  }, [protein, carbs, fat]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Required';
    if (!grams || Number(grams) <= 0) errs.grams = 'Required';
    if (!calories || Number(calories) < 0) errs.calories = 'Required';
    setErrors(errs); return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), category: category || undefined, servingGrams: parseFloat(grams), calories: Math.round(Number(calories)), macros: { protein: parseFloat(protein) || 0, carbs: parseFloat(carbs) || 0, fat: parseFloat(fat) || 0 } });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{initialFood ? 'Edit food' : 'Add food'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Chicken breast" />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="Protein, Carbs..." />
            </div>
            <div className="space-y-1.5">
              <Label>Serving size (g)</Label>
              <Input type="number" value={grams} onChange={e => setGrams(e.target.value)} min={1} />
              {errors.grams && <p className="text-xs text-destructive">{errors.grams}</p>}
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Calories (auto from macros)</Label>
              <Input type="number" value={calories} onChange={e => setCalories(e.target.value)} />
              {errors.calories && <p className="text-xs text-destructive">{errors.calories}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1.5">
              <Label>Protein (g)</Label>
              <Input type="number" value={protein} onChange={e => setProtein(e.target.value)} step={0.1} min={0} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Carbs (g)</Label>
              <Input type="number" value={carbs} onChange={e => setCarbs(e.target.value)} step={0.1} min={0} placeholder="0" />
            </div>
            <div className="space-y-1.5">
              <Label>Fat (g)</Label>
              <Input type="number" value={fat} onChange={e => setFat(e.target.value)} step={0.1} min={0} placeholder="0" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="submit" className="flex-1">{initialFood ? 'Save' : 'Add food'}</Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
