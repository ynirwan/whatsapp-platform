import { useState } from 'react'
import { Send, Paperclip, Smile } from 'lucide-react'
import Button from '../common/Button'

const MessageComposer = ({ onSend, loading }) => {
  const [message, setMessage] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (message.trim()) {
      onSend(message)
      setMessage('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
      <div className="flex items-center space-x-2">
        <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
          <Smile className="h-5 w-5 text-gray-600" />
        </button>
        <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
          <Paperclip className="h-5 w-5 text-gray-600" />
        </button>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
        />
        <Button type="submit" disabled={!message.trim()} loading={loading}>
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </form>
  )
}

export default MessageComposer
