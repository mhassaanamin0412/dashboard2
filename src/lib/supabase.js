import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon')
);

if (!isConfigured) {
  console.warn(
    'Supabase credentials not configured or are using placeholders. Realtime and REST requests will be disabled until VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.'
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
  : null;

const SUPABASE_TABLE = import.meta.env.VITE_SUPABASE_TABLE || 'clients';

// Client/Lead Services
export const clientService = {
  // Get all active clients (not soft-deleted)
  async getClients({ page = 1, pageSize = 25, search = '', status = '', sortField = 'created_at', sortDirection = 'desc' } = {}) {
    if (!isConfigured || !supabase) {
      console.warn('getClients called but Supabase is not configured. Returning empty result set.');
      return { data: [], count: 0 };
    }

    let query = supabase
      .from(SUPABASE_TABLE)
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply search
    if (search) {
      const searchTerm = search.trim();
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%`);
    }

    // Apply sorting
    query = query.order(sortField, { ascending: sortDirection === 'asc' });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      if (error.status === 401 || error.statusCode === 401) {
        const err = new Error(
          'Supabase Unauthorized (401) while fetching clients. Check VITE_SUPABASE_ANON_KEY and RLS policies.'
        );
        throw err;
      }
      throw error;
    }

    return { data: data || [], count: count || 0 };
  },

  // Get a single client by ID
  async getClientById(id) {
    if (!isConfigured || !supabase) {
      console.warn('getClientById called but Supabase is not configured.');
      return null;
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },

  // Create a new client
  async createClient(clientData) {
    if (!isConfigured || !supabase) {
      console.warn('createClient called but Supabase is not configured.');
      return null;
    }

    const now = new Date().toISOString();
    try {
      // Ensure an `id` is provided for databases that require it.
      // Prefer server-side defaults; this is a safe client-side fallback for quick fixes.
      const insertPayload = {
        ...clientData,
        id: clientData.id ?? `c${Date.now()}`,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      };

      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        // Log full error and payload for debugging
        console.error('Supabase createClient error', { error, payload: clientData });
        if (error.status === 401 || error.statusCode === 401) {
          const err = new Error(
            'Supabase Unauthorized (401). Check VITE_SUPABASE_ANON_KEY and Row Level Security (RLS) policies for the table.'
          );
          throw err;
        }
        throw error;
      }

      return data;
    } catch (err) {
      // Ensure any thrown error is logged with full details
      console.error('createClient caught error', { err, payload: clientData });
      throw err;
    }
  },

  // Update a client
  async updateClient(id, updates) {
    if (!isConfigured || !supabase) {
      console.warn('updateClient called but Supabase is not configured.');
      return null;
    }

    const payload = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase
        .from(SUPABASE_TABLE)
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Supabase updateClient error', { error, id, payload });
        if (error.status === 401 || error.statusCode === 401) {
          const err = new Error(
            'Supabase Unauthorized (401). Check VITE_SUPABASE_ANON_KEY and Row Level Security (RLS) policies for the table.'
          );
          throw err;
        }
        throw error;
      }

      return data;
    } catch (err) {
      console.error('updateClient caught error', { err, id, payload });
      throw err;
    }
  },

  // Soft delete a client (set deleted_at)
  async softDeleteClient(id) {
    if (!isConfigured || !supabase) {
      console.warn('softDeleteClient called but Supabase is not configured.');
      return null;
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .update({
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Subscribe to realtime changes
  subscribeToClients(callback) {
    if (!isConfigured || !supabase) {
      console.warn('subscribeToClients called but Supabase is not configured.');
      return null;
    }

    const subscription = supabase
      .channel(`${SUPABASE_TABLE}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: SUPABASE_TABLE,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  // Get statistics
  async getStatistics() {
    if (!isConfigured || !supabase) {
      console.warn('getStatistics called but Supabase is not configured. Returning zeroed stats.');
      return {
        total: 0,
        newLeads: 0,
        contacted: 0,
        won: 0,
        lost: 0,
      };
    }

    const { data, error } = await supabase
      .from(SUPABASE_TABLE)
      .select('status')
      .is('deleted_at', null);

    if (error) {
      if (error.status === 401 || error.statusCode === 401) {
        const err = new Error(
          'Supabase Unauthorized (401) while fetching statistics. Check VITE_SUPABASE_ANON_KEY and RLS policies.'
        );
        throw err;
      }
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      newLeads: data?.filter((c) => c.status === 'New Lead').length || 0,
      contacted: data?.filter((c) => c.status === 'Contacted').length || 0,
      won: data?.filter((c) => c.status === 'Won').length || 0,
      lost: data?.filter((c) => c.status === 'Lost').length || 0,
    };

    return stats;
  },

  // Export all visible leads to CSV
  async exportLeads(search = '', status = '') {
    if (!isConfigured || !supabase) {
      console.warn('exportLeads called but Supabase is not configured. Returning empty array.');
      return [];
    }

    let query = supabase.from(SUPABASE_TABLE).select('*').is('deleted_at', null);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      const searchTerm = search.trim();
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,profession.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      if (error.status === 401 || error.statusCode === 401) {
        const err = new Error(
          'Supabase Unauthorized (401) while exporting leads. Check VITE_SUPABASE_ANON_KEY and RLS policies.'
        );
        throw err;
      }
      throw error;
    }
    return data || [];
  }
};
