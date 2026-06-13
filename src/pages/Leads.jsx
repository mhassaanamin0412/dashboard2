import { useEffect } from 'react';
import { Users } from 'lucide-react';
import LeadsTable from '@/components/table/LeadsTable';
import EditLeadModal from '@/components/modals/EditLeadModal';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import useClientStore from '@/store/useClientStore';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Leads() {
  const { fetchClients, setupRealtimeSubscription, cleanupSubscription } = useClientStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    setupRealtimeSubscription();

    return () => {
      cleanupSubscription();
    };
  }, [fetchClients, setupRealtimeSubscription, cleanupSubscription]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Leads</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            View and manage all your client leads
          </p>
        </div>
        <Button onClick={() => navigate('/')}>
          <Users className="mr-2 h-4 w-4" />
          Create New Lead
        </Button>
      </div>

      {/* Leads Table */}
      <LeadsTable />

      {/* Modals */}
      <EditLeadModal />
      <DeleteConfirmModal />
    </div>
  );
}
