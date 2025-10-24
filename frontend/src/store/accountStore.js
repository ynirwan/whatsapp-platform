/* 
 * COPY TO: frontend/src/store/accountStore.js
 * 
 * This version keeps all your existing functionality
 * AND adds the fetchAccounts function needed by ChatbotBuilder
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

export const useAccountStore = create(
  persist(
    (set) => ({
      selectedAccount: null,
      accounts: [],
      loading: false,
      error: null,

      setSelectedAccount: (account) => set({ selectedAccount: account }),

      setAccounts: (accounts) => set({ accounts }),

      // NEW: Fetch accounts from API
      fetchAccounts: async () => {
        set({ loading: true, error: null });
        try {
          const response = await axios.get('/api/whatsapp-accounts');
          set({
            accounts: response.data.data || [],
            loading: false
          });
          return response;
        } catch (error) {
          console.error('Failed to fetch accounts:', error);
          set({
            error: error.message,
            loading: false,
            accounts: []
          });
          throw error;
        }
      },

      clearAccount: () => set({ selectedAccount: null }),

      clearError: () => set({ error: null }),

      reset: () => set({
        selectedAccount: null,
        accounts: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'account-storage',
      partialize: (state) => ({
        selectedAccount: state.selectedAccount
      })
    }
  )
)