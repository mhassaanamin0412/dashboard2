import { useEffect } from 'react';
import StatsCards from '@/components/dashboard/StatsCards';
import LeadForm from '@/components/forms/LeadForm';
import LeadsTable from '@/components/table/LeadsTable';
import EditLeadModal from '@/components/modals/EditLeadModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import useClientStore from '@/store/useClientStore';

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
      {/* Statistics */}
      <StatsCards stats={stats} loading={false} />

      {/* Lead Form */}
      <LeadForm />

      {/* Leads Table */}
      <LeadsTable />

      {/* Modals */}
      <EditLeadModal />
      <DeleteConfirmModal />
    </div>
  );
}
