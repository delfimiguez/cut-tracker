'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/primitives';
import { Separator } from '@/components/ui/primitives';
import { TrainingEntry } from '@/lib/types';
import { Plus, Pencil, Trash2, Dumbbell, Timer, MapPin } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  Hybrid: 'bg-blue-100 text-blue-700',
  Pilates: 'bg-purple-100 text-purple-700',
  'Run Z2': 'bg-green-100 text-green-700',
  Run: 'bg-emerald-100 text-emerald-700',
  Strength: 'bg-orange-100 text-orange-700',
  Walk: 'bg-sky-100 text-sky-700',
  Rest: 'bg-gray-100 text-gray-500',
};

interface TrainingListProps {
  training: TrainingEntry[];
  onAdd: () => void;
  onEdit: (t: TrainingEntry) => void;
  onDelete: (id: string) => void;
}

export function TrainingList({ training, onAdd, onEdit, onDelete }: TrainingListProps) {
  return (
    <Card>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <CardTitle>Training</CardTitle>
          <Button variant="ghost" size="sm" onClick={onAdd} className="h-8 gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" />
            Log
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {training.length === 0 ? (
          <button
            onClick={onAdd}
            className="flex w-full flex-col items-center gap-2 rounded-lg border border-dashed py-8 text-center text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Dumbbell className="h-5 w-5" />
            <span className="text-sm">No training logged</span>
            <span className="text-xs">Log a session to track activity</span>
          </button>
        ) : (
          <div className="space-y-1">
            {training.map((t, i) => (
              <div key={t.id}>
                <div className="group flex items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-accent">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold ${TYPE_COLORS[t.type] ?? 'bg-secondary text-secondary-foreground'}`}>
                    {t.type.slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none">{t.type}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Timer className="h-3 w-3" />{t.durationMin}min
                      </span>
                      {t.distanceKm && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />{t.distanceKm}km
                        </span>
                      )}
                      {t.rpe && <span className="text-xs text-muted-foreground">RPE {t.rpe}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(t)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(t.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {i < training.length - 1 && <Separator className="mx-2" />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
