import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Trash2,
  AlertTriangle,
  Moon,
  Sun,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import useThemeStore from '@/store/useThemeStore';
import useClientStore from '@/store/useClientStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const { theme, toggleTheme } = useThemeStore();
  const resetFilters = useClientStore((state) => state.resetFilters);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetFilters = () => {
    resetFilters();
    toast.success('All filters and preferences have been reset');
    setShowResetConfirm(false);
  };

  const handleClearStorage = () => {
    localStorage.removeItem('crm-dashboard-state');
    localStorage.removeItem('crm-theme');
    toast.success('Local storage cleared. Refresh the page to see changes.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <SettingsIcon className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your CRM dashboard preferences
        </p>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-foreground">Appearance</h2>
          <p className="text-sm text-muted-foreground">
            Customize how the dashboard looks
          </p>

          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="h-5 w-5 text-primary" />
                ) : (
                  <Sun className="h-5 w-5 text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Dark Mode
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
          <p className="text-sm text-muted-foreground">
            Manage your local data and preferences
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Reset Filters & Preferences
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clear all saved search, filters, and sorting
                  </p>
                </div>
                {!showResetConfirm ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResetConfirm(true)}
                    className="gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResetConfirm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleResetFilters}
                    >
                      Confirm
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                    Clear Local Storage
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-400">
                    This will remove all locally stored preferences including theme and
                    filter settings.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearStorage}
                    className="mt-2 gap-2 border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear Storage
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Configuration */}
        <div className="rounded-xl border border-border bg-card p-5 md:col-span-2">
          <h2 className="text-lg font-semibold text-foreground">
            Supabase Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Your Supabase project connection details
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Supabase URL
              </p>
              <p className="mt-1 break-all font-mono text-sm text-foreground">
                {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Anon Key
              </p>
              <p className="mt-1 break-all font-mono text-sm text-foreground">
                {import.meta.env.VITE_SUPABASE_ANON_KEY
                  ? `${import.meta.env.VITE_SUPABASE_ANON_KEY.slice(0, 20)}...`
                  : 'Not configured'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              To configure your Supabase connection, set the{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                VITE_SUPABASE_URL
              </code>{' '}
              and{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                VITE_SUPABASE_ANON_KEY
              </code>{' '}
              environment variables in your{' '}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">.env</code> file.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
