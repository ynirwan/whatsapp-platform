import { useState, useEffect } from 'react'
import { useSocket } from './useSocket'
import { useMessageStore } from '../store/messageStore'

export const useMessages = (accountId, contactId) => {
  const { messages, addMessage, setMessages } = useMessageStore()
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !contactId) return

    socket.emit('join:account', accountId)

    socket.on('message:new', (data) => {
      if (data.contactId === contactId) {
        addMessage(data.message)
      }
    })

    return () => {
      socket.off('message:new')
      socket.emit('leave:account', accountId)
    }
  }, [socket, accountId, contactId, addMessage])

  return { messages }
}
