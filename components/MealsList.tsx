'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/primitives';
import { MealEntry } from '@/lib/types';
import { Plus, Pencil, Trash2, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MealsListProps {
  meals: MealEntry[];
  onAdd: () => void;
  onEdit: (meal: MealEntry) => void;
  onDelete: (id: string) => void;
}

export function MealsList({ meals, onAdd, onEdit, onDelete }: MealsListProps) {
  const totalCals = meals.reduce((s, m) => s + m.calories, 0);
  const totalProtein = meals.reduce((s, m) => s + m.macros.protein, 0);

  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Meals</CardTitle>
          <Button variant="ghost" size="sm" onClick={onAdd} className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {meals.length === 0 ? (
          <button
            onClick={onAdd}
            className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Utensils className="h-5 w-5" />
            <span className="text-sm">No meals logged yet</span>
            <span className="text-xs">Tap to add your first meal</span>
          </button>
        ) : (
          <div className="space-y-1">
            {meals.map((meal, i) => (
              <div key={meal.id}>
                <div className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">{meal.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {meal.time} · P {Math.round(meal.macros.protein)}g · C {Math.round(meal.macros.carbs)}g · F {Math.round(meal.macros.fat)}g
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums shrink-0">{meal.calories.toLocaleString()}</span>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(meal)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(meal.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {i < meals.length - 1 && <Separator className="mx-2" />}
              </div>
            ))}

            <Separator className="my-2" />
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-xs text-muted-foreground">Total</span>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-muted-foreground">P {Math.round(totalProtein)}g</span>
                <span className="font-semibold tabular-nums">{totalCals.toLocaleString()} kcal</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
