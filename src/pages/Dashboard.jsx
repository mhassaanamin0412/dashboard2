import { useEffect } from 'react';
import useClientStore from '@/store/useClientStore';
import EmailDispatcherButton from "./asd.jsx";

export default function Dashboard() {
  const { stats, fetchStats, setupRealtimeSubscription, cleanupSubscription } = useClientStore();

  useEffect(() => {
    fetchStats();
    setupRealtimeSubscription();

    return () => {
      cleanupSubscription();
    };
  }, [fetchStats, setupRealtimeSubscription, cleanupSubscription]);

  return (
    <div className="space-y-6">
    </div>
  );
}
