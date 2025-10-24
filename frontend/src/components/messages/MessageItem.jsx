import MessageStatus from './MessageStatus'

const MessageItem = ({ message }) => {
  const isOwn = message.direction === 'outbound'

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn ? 'bg-green-500 text-white' : 'bg-white border text-gray-900'
      }`}>
        <p className="text-sm">{message.content?.text || `${message.type} message`}</p>
        <div className="flex items-center justify-end space-x-1 mt-1">
          <span className="text-xs opacity-70">
            {new Date(message.createdAt).toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
          {isOwn && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  )
}

export default MessageItem
