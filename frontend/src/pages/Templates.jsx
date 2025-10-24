import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { templateApi } from '../api/templateApi'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, FileText, CheckCircle, XCircle, Clock } from 'lucide-react'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'

const Templates = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'UTILITY',
    language: 'en',
    headerText: '',
    bodyText: '',
    footerText: '',
    buttons: []
  })

  const accountId = 'default-account-id' // Get from user's selected account

  // Fetch templates
  const { data: templatesData, isLoading } = useQuery({
    queryKey: ['templates', accountId],
    queryFn: () => templateApi.getTemplates({ accountId })
  })

  // Create template mutation
  const createMutation = useMutation({
    mutationFn: (data) => templateApi.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates'])
      setIsModalOpen(false)
      resetForm()
      toast.success('Template created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create template')
    }
  })

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => templateApi.deleteTemplate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['templates'])
      toast.success('Template deleted successfully')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'UTILITY',
      language: 'en',
      headerText: '',
      bodyText: '',
      footerText: '',
      buttons: []
    })
    setEditingTemplate(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const components = []

    if (formData.headerText) {
      components.push({
        type: 'HEADER',
        format: 'TEXT',
        text: formData.headerText
      })
    }

    components.push({
      type: 'BODY',
      text: formData.bodyText
    })

    if (formData.footerText) {
      components.push({
        type: 'FOOTER',
        text: formData.footerText
      })
    }

    if (formData.buttons.length > 0) {
      components.push({
        type: 'BUTTONS',
        buttons: formData.buttons
      })
    }

    createMutation.mutate({
      accountId,
      name: formData.name,
      category: formData.category,
      language: formData.language,
      components
    })
  }

  const addButton = () => {
    if (formData.buttons.length < 3) {
      setFormData({
        ...formData,
        buttons: [...formData.buttons, { type: 'QUICK_REPLY', text: '' }]
      })
    }
  }

  const updateButton = (index, text) => {
    const newButtons = [...formData.buttons]
    newButtons[index].text = text
    setFormData({ ...formData, buttons: newButtons })
  }

  const removeButton = (index) => {
    setFormData({
      ...formData,
      buttons: formData.buttons.filter((_, i) => i !== index)
    })
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading templates..." />
      </div>
    )
  }

  const templates = templatesData?.data?.data?.templates || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Message Templates</h1>
          <p className="text-gray-600 mt-2">Create and manage WhatsApp message templates</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Template Guide */}
      {templates.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            About WhatsApp Message Templates
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-800">
            <li>Templates must be approved by WhatsApp before use</li>
            <li>Use templates for sending notifications and updates</li>
            <li>Templates can include variables (e.g., customer name, order ID)</li>
            <li>Choose the right category for faster approval</li>
            <li>Follow WhatsApp's template guidelines</li>
          </ul>
        </div>
      )}

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-sm text-gray-600">{template.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(template.status)}
                  <button
                    onClick={() => {
                      if (confirm('Delete this template?')) {
                        deleteMutation.mutate(template.id)
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    {template.components.find(c => c.type === 'BODY')?.text || 'No body text'}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                    {template.status}
                  </span>
                  <span className="text-xs text-gray-500">{template.language}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Templates Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first message template to get started
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Template
          </Button>
        </div>
      )}

      {/* Create Template Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title="Create Message Template"
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Template Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="order_confirmation"
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="UTILITY">Utility</option>
                <option value="MARKETING">Marketing</option>
                <option value="AUTHENTICATION">Authentication</option>
              </select>
            </div>
          </div>

          <Input
            label="Header Text (Optional)"
            value={formData.headerText}
            onChange={(e) => setFormData({ ...formData, headerText: e.target.value })}
            placeholder="Welcome to our service!"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.bodyText}
              onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
              placeholder="Your order {{1}} has been confirmed. Delivery on {{2}}."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows="4"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Use {`{{1}}, {{2}}`} for variables
            </p>
          </div>

          <Input
            label="Footer Text (Optional)"
            value={formData.footerText}
            onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
            placeholder="Thank you for your business"
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buttons (Optional, max 3)
            </label>
            {formData.buttons.map((button, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={button.text}
                  onChange={(e) => updateButton(index, e.target.value)}
                  placeholder="Button text"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeButton(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  Remove
                </button>
              </div>
            ))}
            {formData.buttons.length < 3 && (
              <button
                type="button"
                onClick={addButton}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                + Add Button
              </button>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Templates must be approved by WhatsApp before use. This typically takes 24-48 hours.
            </p>
          </div>

          <div className="flex justify-end space-x-3">
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
            <Button type="submit" loading={createMutation.isPending}>
              Create Template
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Templates
