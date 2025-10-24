import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactApi } from '../api/contactApi'
import toast from 'react-hot-toast'
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  Tag,
  Mail,
  Phone
} from 'lucide-react'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'

const ContactCard = ({ contact, onEdit, onDelete }) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
          {contact.name?.charAt(0) || contact.phoneNumber?.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {contact.name || 'Unknown'}
          </h3>
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
        <button
          onClick={() => onEdit(contact)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <Edit className="h-4 w-4 text-gray-600" />
        </button>
        <button
          onClick={() => onDelete(contact.id)}
          className="p-2 hover:bg-red-50 rounded-lg"
        >
          <Trash2 className="h-4 w-4 text-red-600" />
        </button>
      </div>
    </div>

    {contact.tags?.length > 0 && (
      <div className="flex flex-wrap gap-2 mt-4">
        {contact.tags.map((tag, index) => (
          <span
            key={index}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full flex items-center"
          >
            <Tag className="h-3 w-3 mr-1" />
            {tag}
          </span>
        ))}
      </div>
    )}

    <div className="mt-4 pt-4 border-t border-gray-200">
      <p className="text-xs text-gray-500">
        Added {new Date(contact.createdAt).toLocaleDateString()}
      </p>
    </div>
  </div>
)

const Contacts = () => {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    tags: []
  })

  // Fetch contacts
  const { data, isLoading } = useQuery({
    queryKey: ['contacts', { search: searchQuery }],
    queryFn: () => contactApi.getContacts({ 
      accountId: 'your-account-id', // Replace with actual
      search: searchQuery 
    })
  })

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: (data) => 
      editingContact 
        ? contactApi.updateContact(editingContact.id, { accountId: 'your-account-id', ...data })
        : contactApi.createContact({ accountId: 'your-account-id', ...data }),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts'])
      setIsModalOpen(false)
      resetForm()
      toast.success(editingContact ? 'Contact updated!' : 'Contact created!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Operation failed')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => contactApi.deleteContact(id, { accountId: 'your-account-id' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['contacts'])
      toast.success('Contact deleted!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Delete failed')
    }
  })

  const resetForm = () => {
    setFormData({ name: '', phoneNumber: '', email: '', tags: [] })
    setEditingContact(null)
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setFormData({
      name: contact.name || '',
      phoneNumber: contact.phoneNumber,
      email: contact.email || '',
      tags: contact.tags || []
    })
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    saveMutation.mutate(formData)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
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

      {/* Contacts Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.rows?.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={handleEdit}
              onDelete={(id) => {
                if (confirm('Are you sure you want to delete this contact?')) {
                  deleteMutation.mutate(id)
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            name="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="John Doe"
            required
          />
          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+1234567890"
            required
          />
          <Input
            label="Email (Optional)"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="john@example.com"
          />

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false)
                resetForm()
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saveMutation.isPending}
            >
              {editingContact ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Contacts
