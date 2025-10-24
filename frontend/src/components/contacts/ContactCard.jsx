import { Edit, Trash2, Phone, Mail } from 'lucide-react'

const ContactCard = ({ contact, onEdit, onDelete }) => {
  return (
    <div className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
            {contact.name?.charAt(0) || contact.phoneNumber?.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-semibold">{contact.name || 'Unknown'}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <Phone className="h-4 w-4" />
              <span>{contact.phoneNumber}</span>
            </div>
            {contact.email && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <Mail className="h-4 w-4" />
                <span>{contact.email}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button onClick={() => onEdit(contact)} className="p-2 hover:bg-gray-100 rounded-lg">
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button onClick={() => onDelete(contact.id)} className="p-2 hover:bg-red-50 rounded-lg">
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ContactCard
