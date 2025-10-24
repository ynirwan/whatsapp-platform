import { Check, CheckCheck, Clock } from 'lucide-react'

const MessageStatus = ({ status }) => {
  switch (status) {
    case 'sent':
      return <Check className="h-4 w-4" />
    case 'delivered':
      return <CheckCheck className="h-4 w-4" />
    case 'read':
      return <CheckCheck className="h-4 w-4 text-blue-500" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export default MessageStatus
