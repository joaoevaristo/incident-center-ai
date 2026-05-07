import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-destructive-foreground',
    outline: 'border border-input bg-background',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  };

  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  );
}
