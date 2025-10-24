import { create } from 'zustand'

export const useContactStore = create((set) => ({
  contacts: [],
  selectedContact: null,
  
  setContacts: (contacts) => set({ contacts }),
  
  addContact: (contact) => set((state) => ({
    contacts: [...state.contacts, contact]
  })),
  
  updateContact: (id, updates) => set((state) => ({
    contacts: state.contacts.map(c => c.id === id ? { ...c, ...updates } : c)
  })),
  
  deleteContact: (id) => set((state) => ({
    contacts: state.contacts.filter(c => c.id !== id)
  })),
  
  setSelectedContact: (contact) => set({ selectedContact: contact })
}))
