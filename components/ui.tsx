'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Progress from '@radix-ui/react-progress';
import * as Select from '@radix-ui/react-select';
import * as Label from '@radix-ui/react-label';
import * as Switch from '@radix-ui/react-switch';
import { X, ChevronDown, Check } from 'lucide-react';

// ── Button ──────────────────────────────────────────────────────────────
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-zinc-900 text-white hover:bg-zinc-700 focus-visible:ring-zinc-900',
  secondary: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus-visible:ring-zinc-400',
  ghost: 'bg-transparent text-zinc-700 hover:bg-zinc-100 focus-visible:ring-zinc-400',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ label, error, hint, id, className = '', ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label.Root htmlFor={inputId} className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
          {label}
        </Label.Root>
      )}
      <input
        id={inputId}
        className={`h-10 px-3 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all placeholder:text-zinc-400 ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
        {...props}
      />
      {hint && !error && <p className="text-xs text-zinc-400">{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, id, className = '', ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <Label.Root htmlFor={inputId} className="text-xs font-medium text-zinc-600 uppercase tracking-wide">
          {label}
        </Label.Root>
      )}
      <textarea
        id={inputId}
        className={`px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all resize-none placeholder:text-zinc-400 ${error ? 'border-red-400' : ''} ${className}`}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ open, onOpenChange, title, description, children, size = 'md' }: ModalProps) {
  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] ${sizeClass} bg-white rounded-2xl shadow-2xl z-50 p-6 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-zinc-900">{title}</Dialog.Title>
              {description && <Dialog.Description className="text-sm text-zinc-500 mt-0.5">{description}</Dialog.Description>}
            </div>
            <Dialog.Close asChild>
              <button className="p-1 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400">
                <X size={18} />
              </button>
            </Dialog.Close>
          </div>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Card ──────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-zinc-100 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────
interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  className?: string;
}

export function ProgressBar({ value, max, color = 'bg-zinc-900', className = '' }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0));
  const over = value > max && max > 0;
  return (
    <Progress.Root
      className={`relative overflow-hidden bg-zinc-100 rounded-full h-2 ${className}`}
      value={pct}
    >
      <Progress.Indicator
        className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-red-500' : color}`}
        style={{ width: `${pct}%` }}
      />
    </Progress.Root>
  );
}

// ── Calorie Ring ──────────────────────────────────────────────────────
interface CalorieRingProps {
  eaten: number;
  target: number;
  size?: number;
}

export function CalorieRing({ eaten, target, size = 120 }: CalorieRingProps) {
  const pct = target > 0 ? Math.min(1, eaten / target) : 0;
  const over = eaten > target;
  const r = (size - 16) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rotate-[-90deg]">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f4f4f5" strokeWidth={8} />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke={over ? '#ef4444' : '#18181b'}
        strokeWidth={8}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.4s ease' }}
      />
    </svg>
  );
}

// ── SelectField ──────────────────────────────────────────────────────
interface SelectOption { value: string; label: string }
interface SelectFieldProps {
  label?: string;
  value: string;
  onValueChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function SelectField({ label, value, onValueChange, options, placeholder }: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-zinc-600 uppercase tracking-wide">{label}</span>}
      <Select.Root value={value} onValueChange={onValueChange}>
        <Select.Trigger className="flex items-center justify-between h-10 px-3 text-sm bg-white border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 transition-all">
          <Select.Value placeholder={placeholder} />
          <Select.Icon><ChevronDown size={14} className="text-zinc-400" /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden">
            <Select.Viewport className="p-1">
              {options.map(o => (
                <Select.Item
                  key={o.value}
                  value={o.value}
                  className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-zinc-50 focus:bg-zinc-50 outline-none"
                >
                  <Select.ItemIndicator><Check size={12} /></Select.ItemIndicator>
                  <Select.ItemText>{o.label}</Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

// ── SwitchField ──────────────────────────────────────────────────────
interface SwitchFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  id: string;
}

export function SwitchField({ label, description, checked, onCheckedChange, id }: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <Label.Root htmlFor={id} className="text-sm font-medium text-zinc-900 cursor-pointer">{label}</Label.Root>
        {description && <p className="text-xs text-zinc-500">{description}</p>}
      </div>
      <Switch.Root
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="w-10 h-6 rounded-full bg-zinc-200 data-[state=checked]:bg-zinc-900 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 cursor-pointer"
      >
        <Switch.Thumb className="block w-4 h-4 bg-white rounded-full shadow transition-transform data-[state=checked]:translate-x-5 translate-x-1" />
      </Switch.Root>
    </div>
  );
}

// ── MacroBar ──────────────────────────────────────────────────────────
interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  color: string;
}

export function MacroBar({ label, current, target, unit = 'g', color }: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const over = current > target;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-zinc-600">{label}</span>
        <span className="text-xs text-zinc-500">
          <span className={`font-semibold ${over ? 'text-red-500' : 'text-zinc-900'}`}>{Math.round(current)}</span>
          {' / '}{Math.round(target)}{unit}
        </span>
      </div>
      <Progress.Root className="relative overflow-hidden bg-zinc-100 rounded-full h-1.5">
        <Progress.Indicator
          className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-red-400' : color}`}
          style={{ width: `${pct}%` }}
        />
      </Progress.Root>
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────────────────────
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-zinc-100 text-zinc-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
};

export function Badge({ children, variant = 'default' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${badgeVariants[variant]}`}>
      {children}
    </span>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, accent }: {
  label: string; value: string | number; sub?: string; icon?: React.ReactNode; accent?: boolean;
}) {
  return (
    <Card className={`p-4 ${accent ? 'bg-zinc-900 text-white border-zinc-900' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${accent ? 'text-zinc-400' : 'text-zinc-500'}`}>{label}</p>
          <p className={`text-2xl font-bold mt-1 ${accent ? 'text-white' : 'text-zinc-900'}`}>{value}</p>
          {sub && <p className={`text-xs mt-0.5 ${accent ? 'text-zinc-400' : 'text-zinc-500'}`}>{sub}</p>}
        </div>
        {icon && <div className={`p-2 rounded-xl ${accent ? 'bg-zinc-800' : 'bg-zinc-50'}`}>{icon}</div>}
      </div>
    </Card>
  );
}

// ── Empty State ──────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="p-4 bg-zinc-50 rounded-2xl mb-4 text-zinc-400">{icon}</div>}
      <p className="font-medium text-zinc-900">{title}</p>
      {description && <p className="text-sm text-zinc-500 mt-1 max-w-xs">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── TagPill ──────────────────────────────────────────────────────────
const AVAILABLE_TAGS = ['PMS', 'Sore', 'Hungry', 'Great sleep', 'Tired', 'Stressed', 'Good energy', 'Bloated'];

export function TagPicker({ selected, onChange }: { selected: string[]; onChange: (tags: string[]) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {AVAILABLE_TAGS.map(tag => {
        const active = selected.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onChange(active ? selected.filter(t => t !== tag) : [...selected, tag])}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              active ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
            }`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
