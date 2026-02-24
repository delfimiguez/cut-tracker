'use client';

import React, { useState } from 'react';
import { Card, Button, Input, EmptyState, Modal, Badge } from '@/components/ui';
import { useApp } from '@/lib/context';
import { FoodItem } from '@/lib/types';
import { Plus, Trash2, Pencil, Search, UtensilsCrossed } from 'lucide-react';
import { getCaloriesFromMacros } from '@/lib/calculations';

export default function FoodLibraryView() {
  const { state, addFood, updateFood, removeFood } = useApp();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editFood, setEditFood] = useState<FoodItem | undefined>();

  if (!state) return null;
  const { foods } = state;

  const filtered = foods.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category?.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(foods.map(f => f.category ?? 'Other'))].sort();

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search foods..."
            className="w-full h-10 pl-9 pr-3 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all"
          />
        </div>
        <Button onClick={() => { setEditFood(undefined); setShowForm(true); }}>
          <Plus size={16} /> Add Food
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed size={20} />}
          title="No foods found"
          description={search ? 'Try a different search' : 'Add your first food item'}
          action={<Button onClick={() => { setEditFood(undefined); setShowForm(true); }}><Plus size={16} /> Add Food</Button>}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-zinc-50">
            {filtered.map(food => (
              <div key={food.id} className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-zinc-900 truncate">{food.name}</p>
                    {food.category && <Badge>{food.category}</Badge>}
                  </div>
                  <p className="text-xs text-zinc-500">
                    {food.servingGrams}g · P {food.macros.protein}g · C {food.macros.carbs}g · F {food.macros.fat}g
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-zinc-900">{food.calories} kcal</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => { setEditFood(food); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => removeFood(food.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <FoodForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={food => editFood ? updateFood({ ...food, id: editFood.id }) : addFood(food)}
        initialFood={editFood}
      />
    </div>
  );
}

interface FoodFormProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (food: Omit<FoodItem, 'id'>) => void;
  initialFood?: FoodItem;
}

function FoodForm({ open, onOpenChange, onSubmit, initialFood }: FoodFormProps) {
  const [name, setName] = useState(initialFood?.name ?? '');
  const [category, setCategory] = useState(initialFood?.category ?? '');
  const [grams, setGrams] = useState(initialFood?.servingGrams ? String(initialFood.servingGrams) : '100');
  const [calories, setCalories] = useState(initialFood?.calories ? String(initialFood.calories) : '');
  const [protein, setProtein] = useState(initialFood?.macros.protein ? String(initialFood.macros.protein) : '');
  const [carbs, setCarbs] = useState(initialFood?.macros.carbs ? String(initialFood.macros.carbs) : '');
  const [fat, setFat] = useState(initialFood?.macros.fat ? String(initialFood.macros.fat) : '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open && initialFood) {
      setName(initialFood.name);
      setCategory(initialFood.category ?? '');
      setGrams(String(initialFood.servingGrams));
      setCalories(String(initialFood.calories));
      setProtein(String(initialFood.macros.protein));
      setCarbs(String(initialFood.macros.carbs));
      setFat(String(initialFood.macros.fat));
    } else if (!open) {
      setName(''); setCategory(''); setGrams('100'); setCalories('');
      setProtein(''); setCarbs(''); setFat(''); setErrors({});
    }
  }, [open, initialFood]);

  React.useEffect(() => {
    const p = parseFloat(protein) || 0;
    const c = parseFloat(carbs) || 0;
    const f = parseFloat(fat) || 0;
    if (p + c + f > 0) setCalories(String(getCaloriesFromMacros({ protein: p, carbs: c, fat: f })));
  }, [protein, carbs, fat]);

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Required';
    if (!grams || Number(grams) <= 0) errs.grams = 'Required';
    if (!calories || Number(calories) < 0) errs.calories = 'Required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: name.trim(),
      category: category || undefined,
      servingGrams: parseFloat(grams),
      calories: Math.round(Number(calories)),
      macros: {
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      },
    });
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title={initialFood ? 'Edit Food' : 'Add Food'}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input label="Name" value={name} onChange={e => setName(e.target.value)} error={errors.name} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Category" value={category} onChange={e => setCategory(e.target.value)} placeholder="Protein, Carbs..." />
          <Input label="Serving size (g)" type="number" value={grams} onChange={e => setGrams(e.target.value)} min={1} error={errors.grams} />
        </div>
        <Input label="Calories (kcal)" type="number" value={calories} onChange={e => setCalories(e.target.value)} error={errors.calories} />
        <div className="grid grid-cols-3 gap-2">
          <Input label="Protein (g)" type="number" value={protein} onChange={e => setProtein(e.target.value)} step={0.1} min={0} />
          <Input label="Carbs (g)" type="number" value={carbs} onChange={e => setCarbs(e.target.value)} step={0.1} min={0} />
          <Input label="Fat (g)" type="number" value={fat} onChange={e => setFat(e.target.value)} step={0.1} min={0} />
        </div>
        <p className="text-xs text-zinc-400">Calories auto-calculated from macros if provided.</p>
        <div className="flex gap-2 pt-1">
          <Button type="submit" className="flex-1">{initialFood ? 'Save' : 'Add Food'}</Button>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
        </div>
      </form>
    </Modal>
  );
}
