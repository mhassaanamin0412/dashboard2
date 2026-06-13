import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useSidebar } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Leads', icon: Users, path: '/leads' },
  { label: 'Settings', icon: Settings, path: '/settings' },
];

export default function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { open, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        'relative flex h-screen flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out',
        open ? 'w-64' : 'w-16'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Users className="h-5 w-5 text-primary-foreground" />
          </div>
          {open && (
            <span className="truncate text-lg font-bold tracking-tight text-sidebar-foreground">
              CRM Pro
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )}
              title={!open ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {open && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-accent"
      >
        {open ? (
          <ChevronLeft className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Footer */}
      {open && (
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">
            CRM Pro v1.0
          </p>
        </div>
      )}
    </aside>
  );
}
