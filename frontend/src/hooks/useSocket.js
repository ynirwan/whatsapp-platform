import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuthStore } from '../store/authStore'
import { useMessageStore } from '../store/messageStore'
import toast from 'react-hot-toast'

export const useSocket = () => {
  const socketRef = useRef(null)
  const { token } = useAuthStore()
  const { addMessage, updateMessageStatus } = useMessageStore()

  useEffect(() => {
    if (!token) return

    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token }
    })

    // Connection events
    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id)
    })

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      toast.error('Real-time connection failed')
    })

    // Message events
    socketRef.current.on('message:new', (data) => {
      console.log('New message received:', data)
      addMessage(data.message)
      
      // Show notification
      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: data.message.content.text || 'You have a new message',
          icon: '/whatsapp-icon.png'
        })
      }
    })

    socketRef.current.on('message:status', (data) => {
      console.log('Message status updated:', data)
      updateMessageStatus(data.messageId, data.status)
    })

    socketRef.current.on('typing:start', (data) => {
      console.log('User typing:', data)
    })

    socketRef.current.on('typing:stop', (data) => {
      console.log('User stopped typing:', data)
    })

    // Cleanup
    return () => {
      socketRef.current?.disconnect()
    }
  }, [token, addMessage, updateMessageStatus])

  // Helper functions
  const joinAccount = (accountId) => {
    socketRef.current?.emit('join:account', accountId)
  }

  const leaveAccount = (accountId) => {
    socketRef.current?.emit('leave:account', accountId)
  }

  const emitTypingStart = (accountId, contactId) => {
    socketRef.current?.emit('typing:start', { accountId, contactId })
  }

  const emitTypingStop = (accountId, contactId) => {
    socketRef.current?.emit('typing:stop', { accountId, contactId })
  }

  const emitMessageRead = (messageId, accountId) => {
    socketRef.current?.emit('message:read', { messageId, accountId })
  }

  return {
    socket: socketRef.current,
    joinAccount,
    leaveAccount,
    emitTypingStart,
    emitTypingStop,
    emitMessageRead
  }
}

