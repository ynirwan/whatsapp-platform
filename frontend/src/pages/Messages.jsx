import { useState, useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactApi } from '../api/contactApi'
import { messageApi } from '../api/messageApi'
import { useMessageStore } from '../store/messageStore'
import { useSocket } from '../hooks/useSocket'
import toast from 'react-hot-toast'
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile,
  Phone,
  MoreVertical,
  Check,
  CheckCheck
} from 'lucide-react'
import Button from '../components/common/Button'

const MessageBubble = ({ message, isOwn }) => {
  const getStatusIcon = () => {
    if (message.direction === 'inbound') return null
    
    switch (message.status) {
      case 'sent':
        return <Check className="h-4 w-4 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="h-4 w-4 text-gray-400" />
      case 'read':
        return <CheckCheck className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-green-500 text-white' 
          : 'bg-white border border-gray-200 text-gray-900'
      }`}>
        <p className="text-sm">{message.content?.text || `${message.type} message`}</p>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  )
}

const Messages = () => {
  const queryClient = useQueryClient()
  const { selectedContact, setSelectedContact, messages, setMessages } = useMessageStore()
  const { emitTypingStart, emitTypingStop, emitMessageRead } = useSocket()
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Fetch contacts
  const { data: contactsData } = useQuery({
    queryKey: ['contacts', { search: searchQuery }],
    queryFn: () => contactApi.getContacts({ search: searchQuery })
  })

  // Fetch messages for selected contact
  const { data: messagesData } = useQuery({
    queryKey: ['messages', selectedContact?.id],
    queryFn: () => messageApi.getContactMessages(selectedContact.id, { 
      accountId: 'your-account-id' // Replace with actual account ID
    }),
    enabled: !!selectedContact
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (data) => messageApi.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['messages', selectedContact?.id])
      setMessageText('')
      toast.success('Message sent!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message')
    }
  })

  useEffect(() => {
    if (messagesData?.data?.rows) {
      setMessages(messagesData.data.rows)
    }
  }, [messagesData, setMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedContact) return

    sendMessageMutation.mutate({
      accountId: 'your-account-id', // Replace with actual account ID
      contactId: selectedContact.id,
      type: 'text',
      text: messageText
    })
  }

  const handleTyping = (e) => {
    setMessageText(e.target.value)

    if (!isTyping) {
      setIsTyping(true)
      emitTypingStart('your-account-id', selectedContact?.id)
    }

    clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      emitTypingStop('your-account-id', selectedContact?.id)
    }, 1000)
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-white rounded-lg shadow">
      {/* Contacts List */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {contactsData?.data?.rows?.map((contact) => (
            <div
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedContact?.id === contact.id ? 'bg-green-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {contact.name?.charAt(0) || contact.phoneNumber?.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contact.name || contact.phoneNumber}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {contact.phoneNumber}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {selectedContact.name?.charAt(0) || selectedContact.phoneNumber?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedContact.name || selectedContact.phoneNumber}
                </p>
                <p className="text-xs text-gray-500">{selectedContact.phoneNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Phone className="h-5 w-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.direction === 'outbound'}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Smile className="h-5 w-5 text-gray-600" />
              </button>
              <button
                type="button"
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Paperclip className="h-5 w-5 text-gray-600" />
              </button>
              <input
                type="text"
                value={messageText}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!messageText.trim()}
                loading={sendMessageMutation.isPending}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <Send className="h-12 w-12 text-green-600" />
            </div>
            <p className="text-xl font-medium text-gray-900 mb-2">
              Select a contact to start messaging
            </p>
            <p className="text-gray-500">
              Choose from your contacts on the left
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Messages
