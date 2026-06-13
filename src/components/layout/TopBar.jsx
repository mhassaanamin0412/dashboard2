import { Sun, Moon } from 'lucide-react';
import useThemeStore from '@/store/useThemeStore';

export default function TopBar() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      <div>
        <h1 className="text-lg font-semibold text-foreground md:text-xl">
          Leads Management
        </h1>
        <p className="hidden text-xs text-muted-foreground sm:block">
          Manage your client relationships efficiently
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-accent"
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {theme === 'light' ? (
            <Moon className="h-4.5 w-4.5" />
          ) : (
            <Sun className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </header>
  );
}
