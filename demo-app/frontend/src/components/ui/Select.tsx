import { cn } from '@/lib/utils';

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, label, placeholder, className }: SelectProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {label && <label className="text-sm font-medium leading-none">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
