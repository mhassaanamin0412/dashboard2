import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useClientStore from '@/store/useClientStore';
import toast from 'react-hot-toast';

export default function DeleteConfirmModal() {
  const {
    deletingClient,
    isDeleteModalOpen,
    softDeleteClient,
    closeDeleteModal,
  } = useClientStore();

  const handleDelete = async () => {
    if (!deletingClient) return;

    try {
      const success = await softDeleteClient(deletingClient.id);

      if (success) {
        toast.success('Lead removed successfully!');
      } else {
        toast.error('Failed to remove lead. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'An unexpected error occurred');
    }
  };

  if (!isDeleteModalOpen || !deletingClient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-foreground">Delete Lead</h2>
          </div>
          <button
            onClick={closeDeleteModal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-sm text-foreground">
            Are you sure you want to delete this lead?
          </p>
          <div className="mt-3 rounded-lg bg-muted p-3">
            <p className="text-sm font-medium text-foreground">{deletingClient.name}</p>
            <p className="text-xs text-muted-foreground">{deletingClient.email}</p>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            This action will hide the lead from the dashboard but keep it stored in
            Supabase. This lead can be recovered later.
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <Button variant="outline" onClick={closeDeleteModal}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} className="gap-2">
            <Loader2 className="hidden h-4 w-4" />
            Delete Lead
          </Button>
        </div>
      </div>
    </div>
  );
}
