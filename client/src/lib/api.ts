import { apiRequest } from './queryClient';

// Dashboard API
export const dashboardApi = {
  getMetrics: () => fetch('/api/dashboard/metrics', { credentials: 'include' }).then(r => r.json())
};

// States API
export const statesApi = {
  getAll: () => fetch('/api/states', { credentials: 'include' }).then(r => r.json()),
  create: (data: any) => apiRequest('POST', '/api/states', data),
  update: (id: string, data: any) => apiRequest('PUT', `/api/states/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/states/${id}`)
};

// Cities API
export const citiesApi = {
  getAll: (stateId?: string) => {
    const url = stateId ? `/api/cities?stateId=${stateId}` : '/api/cities';
    return fetch(url, { credentials: 'include' }).then(r => r.json());
  },
  create: (data: any) => apiRequest('POST', '/api/cities', data),
  update: (id: string, data: any) => apiRequest('PUT', `/api/cities/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/cities/${id}`)
};

// Parties API
export const partiesApi = {
  getAll: () => fetch('/api/parties', { credentials: 'include' }).then(r => r.json()),
  getWithBalance: () => fetch('/api/parties/with-balance', { credentials: 'include' }).then(r => r.json()),
  create: (data: any) => apiRequest('POST', '/api/parties', data),
  update: (id: string, data: any) => apiRequest('PUT', `/api/parties/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/parties/${id}`)
};

// Crops API
export const cropsApi = {
  getAll: () => fetch('/api/crops', { credentials: 'include' }).then(r => r.json()),
  create: (data: any) => apiRequest('POST', '/api/crops', data),
  update: (id: string, data: any) => apiRequest('PUT', `/api/crops/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/crops/${id}`)
};

// Transactions API
export const transactionsApi = {
  getAll: (params?: { type?: string; partyId?: string; cropId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append('type', params.type);
    if (params?.partyId) searchParams.append('partyId', params.partyId);
    if (params?.cropId) searchParams.append('cropId', params.cropId);
    
    const url = `/api/transactions${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    return fetch(url, { credentials: 'include' }).then(r => r.json());
  },
  getDeleted: () => fetch('/api/transactions/deleted/all', { credentials: 'include' }).then(r => r.json()),
  create: (data: any) => apiRequest('POST', '/api/transactions', data),
  update: (id: string, data: any) => apiRequest('PUT', `/api/transactions/${id}`, data),
  delete: (id: string) => apiRequest('DELETE', `/api/transactions/${id}`),
  restore: (id: string) => apiRequest('POST', `/api/transactions/${id}/restore`, {}),
  permanentDelete: (id: string) => apiRequest('DELETE', `/api/transactions/${id}/permanent`)
};

// Inventory API
export const inventoryApi = {
  getAll: () => fetch('/api/inventory', { credentials: 'include' }).then(r => r.json())
};

// Cash Register API
export const cashRegisterApi = {
  getAll: () => fetch('/api/cash-register', { credentials: 'include' }).then(r => r.json()),
  getBalance: () => fetch('/api/cash-register/balance', { credentials: 'include' }).then(r => r.json()),
  create: (data: any) => apiRequest('POST', '/api/cash-register', data),
  update: (id: string, data: any) => apiRequest('PUT', `/api/cash-register/${id}`, data)
};

// Ledger API
export const ledgerApi = {
  getPartyLedger: (partyId: string) => fetch(`/api/ledger/${partyId}`, { credentials: 'include' }).then(r => r.json()),
  getAllLedgerEntries: () => fetch('/api/ledger/all/entries', { credentials: 'include' }).then(r => r.json())
};
