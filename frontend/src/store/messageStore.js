import { create } from 'zustand'

export const useMessageStore = create((set) => ({
  messages: [],
  selectedContact: null,
  isTyping: false,

  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),

  updateMessageStatus: (messageId, status) => set((state) => ({
    messages: state.messages.map(msg =>
      msg.id === messageId ? { ...msg, status } : msg
    )
  })),

  setSelectedContact: (contact) => set({ selectedContact: contact }),

  setIsTyping: (isTyping) => set({ isTyping }),

  clearMessages: () => set({ messages: [], selectedContact: null })
}))

