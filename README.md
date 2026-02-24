# Cut Tracker

A local-first calorie deficit tracking app. Next.js 15 + TypeScript + Tailwind CSS.

## Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## Build & Deploy

```bash
npm run build && npm start
# Or: npx vercel
```

## Features
- Dashboard: calorie ring, macro bars, deficit stats, projected fat loss, adherence streaks
- Calendar log: browse any day, add/edit meals + training + metrics
- Insights: weekly charts (calories, protein, weight trend, deficit accumulation)
- Food library: 20 seed foods, add custom foods
- Settings: edit all targets, export/import JSON+CSV

## Data Storage
All data stored locally in IndexedDB (falls back to localStorage). Nothing leaves your device. Export/Import in Settings tab.

## Calculation Logic
- Day type auto-detected from logged/scheduled training (Hybrid > Running > Pilates > Rest)
- Deficit = TDEE × dayMultiplier − netCalories
- Fat loss ≈ accumulatedDeficit ÷ 7700 kcal/kg (±15% estimate)
- Projected outcome based on 7-day rolling average deficit

## Default Profile (Delfi)
- Start: 2026-02-25 | Goal: 2026-04-13 | Target: −2kg fat
- Targets: Hybrid 1900 kcal | Run/Pilates 1800 kcal | Rest 1700 kcal
- Protein: 120g/day | TDEE baseline: 2150 kcal
