import { create } from 'zustand';
import { toast } from 'react-hot-toast';
import { clientService } from '@/lib/supabase';

const getPersistedState = () => {
  try {
    const persisted = localStorage.getItem('crm-dashboard-state');
    if (persisted) {
      return JSON.parse(persisted);
    }
  } catch {
    // ignore parse errors
  }
  return null;
};

const persistedState = getPersistedState();

const useClientStore = create((set, get) => ({
  // Data
  clients: [],
  stats: { total: 0, newLeads: 0, contacted: 0, won: 0, lost: 0 },

  // Loading states
  loading: false,
  error: null,

  // Pagination
  page: persistedState?.page || 1,
  pageSize: persistedState?.pageSize || 25,
  totalCount: 0,
  totalPages: 1,

  // Search & Filter
  searchQuery: persistedState?.searchQuery || '',
  statusFilter: persistedState?.statusFilter || '',

  // Sorting
  sortField: persistedState?.sortField || 'created_at',
  sortDirection: persistedState?.sortDirection || 'desc',

  // Edit modal
  editingClient: null,
  isEditModalOpen: false,

  // Delete modal
  deletingClient: null,
  isDeleteModalOpen: false,

  // Realtime subscription
  subscription: null,

  // Actions
  setSearchQuery: (query) => {
    set({ searchQuery: query, page: 1 });
    get().persistState();
  },

  setStatusFilter: (status) => {
    set({ statusFilter: status, page: 1 });
    get().persistState();
  },

  setPage: (page) => {
    set({ page });
    get().persistState();
  },

  setPageSize: (size) => {
    set({ pageSize: size, page: 1 });
    get().persistState();
  },

  setSortField: (field) => {
    const currentField = get().sortField;
    const currentDirection = get().sortDirection;
    const newDirection = currentField === field && currentDirection === 'asc' ? 'desc' : 'asc';
    set({ sortField: field, sortDirection: newDirection });
    get().persistState();
  },

  setEditingClient: (client) => {
    set({ editingClient: client, isEditModalOpen: !!client });
  },

  setDeletingClient: (client) => {
    set({ deletingClient: client, isDeleteModalOpen: !!client });
  },

  closeEditModal: () => {
    set({ editingClient: null, isEditModalOpen: false });
  },

  closeDeleteModal: () => {
    set({ deletingClient: null, isDeleteModalOpen: false });
  },

  persistState: () => {
    const state = get();
    const toPersist = {
      page: state.page,
      pageSize: state.pageSize,
      searchQuery: state.searchQuery,
      statusFilter: state.statusFilter,
      sortField: state.sortField,
      sortDirection: state.sortDirection,
    };
    localStorage.setItem('crm-dashboard-state', JSON.stringify(toPersist));
  },

  // Fetch clients
  fetchClients: async () => {
    const { page, pageSize, searchQuery, statusFilter, sortField, sortDirection } = get();

    set({ loading: true, error: null });

    try {
      const { data, count } = await clientService.getClients({
        page,
        pageSize,
        search: searchQuery,
        status: statusFilter,
        sortField,
        sortDirection,
      });

      const totalPages = Math.ceil(count / pageSize) || 1;

      set({
        clients: data,
        totalCount: count,
        totalPages,
        loading: false,
      });
    } catch (error) {
      const msg = error?.message || String(error);
      set({ error: msg, loading: false });
      if (msg.includes('Unauthorized')) {
        toast.error('Supabase Unauthorized (401). Check VITE_SUPABASE_ANON_KEY and RLS policies.');
      } else {
        toast.error('Failed to fetch clients');
      }
    }
  },

  // Fetch statistics
  fetchStats: async () => {
    try {
      const stats = await clientService.getStatistics();
      set({ stats });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  },

  // Create client
  createClient: async (clientData) => {
    try {
      await clientService.createClient(clientData);
      await get().fetchClients();
      await get().fetchStats();
      return true;
    } catch (error) {
      const msg = error?.message || String(error);
      set({ error: msg });
      if (msg.includes('Unauthorized')) {
        toast.error('Supabase Unauthorized (401). Check VITE_SUPABASE_ANON_KEY and RLS policies.');
      } else {
        toast.error('Failed to create lead');
      }
      return false;
    }
  },

  // Update client
  updateClient: async (id, updates) => {
    try {
      await clientService.updateClient(id, updates);
      await get().fetchClients();
      await get().fetchStats();
      get().closeEditModal();
      return true;
    } catch (error) {
      const msg = error?.message || String(error);
      set({ error: msg });
      if (msg.includes('Unauthorized')) {
        toast.error('Supabase Unauthorized (401). Check VITE_SUPABASE_ANON_KEY and RLS policies.');
      } else {
        toast.error('Failed to update lead');
      }
      return false;
    }
  },

  // Soft delete client
  softDeleteClient: async (id) => {
    try {
      await clientService.softDeleteClient(id);
      await get().fetchClients();
      await get().fetchStats();
      get().closeDeleteModal();
      return true;
    } catch (error) {
      const msg = error?.message || String(error);
      set({ error: msg });
      if (msg.includes('Unauthorized')) {
        toast.error('Supabase Unauthorized (401). Check VITE_SUPABASE_ANON_KEY and RLS policies.');
      } else {
        toast.error('Failed to delete lead');
      }
      return false;
    }
  },

  // Handle realtime updates
  handleRealtimeUpdate: (payload) => {
    const { eventType, new: newRecord, old: oldRecord } = payload;

    // Only process non-deleted records
    if (eventType === 'DELETE') {
      get().fetchClients();
      get().fetchStats();
      return;
    }

    // If record is soft-deleted, treat as delete
    if (newRecord?.deleted_at !== null && newRecord?.deleted_at !== undefined) {
      get().fetchClients();
      get().fetchStats();
      return;
    }

    // For inserts and updates, refresh data
    get().fetchClients();
    get().fetchStats();
  },

  // Setup realtime subscription
  setupRealtimeSubscription: () => {
    const existingSubscription = get().subscription;
    if (existingSubscription) {
      existingSubscription.unsubscribe();
    }

    const subscription = clientService.subscribeToClients((payload) => {
      get().handleRealtimeUpdate(payload);
    });

    set({ subscription });
  },

  // Cleanup subscription
  cleanupSubscription: () => {
    const subscription = get().subscription;
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  // Reset all filters
  resetFilters: () => {
    set({
      searchQuery: '',
      statusFilter: '',
      page: 1,
      pageSize: 25,
      sortField: 'created_at',
      sortDirection: 'desc',
    });
    get().persistState();
  },
}));

export default useClientStore;
