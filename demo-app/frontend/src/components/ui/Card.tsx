import { Badge } from './Badge';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export function Card({ children, className, title, description, action }: CardProps) {
  return (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>
      {(title || description || action) && (
        <div className="flex flex-col space-y-1.5 p-6">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold leading-none tracking-tight">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="p-6 pt-0">{children}</div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </Card>
  );
}
