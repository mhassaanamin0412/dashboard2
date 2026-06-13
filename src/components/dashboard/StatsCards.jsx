import { Users, UserPlus, MailCheck, Trophy, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const statsConfig = [
  {
    key: 'total',
    label: 'Total Leads',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  {
    key: 'newLeads',
    label: 'New Leads',
    icon: UserPlus,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800',
  },
  {
    key: 'contacted',
    label: 'Contacted',
    icon: MailCheck,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  {
    key: 'won',
    label: 'Won Clients',
    icon: Trophy,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  {
    key: 'lost',
    label: 'Lost Clients',
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
];

export default function StatsCards({ stats, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
        {statsConfig.map((_, index) => (
          <div key={index} className="rounded-xl border border-border bg-card p-4">
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {statsConfig.map((config) => {
        const Icon = config.icon;
        const value = stats[config.key] || 0;

        return (
          <div
            key={config.key}
            className={`relative overflow-hidden rounded-xl border ${config.borderColor} bg-card p-4 transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {config.label}
                </p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {value}
                </p>
              </div>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${config.bgColor}`}>
                <Icon className={`h-4.5 w-4.5 ${config.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
