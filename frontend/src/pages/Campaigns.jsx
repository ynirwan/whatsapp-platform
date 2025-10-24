import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignApi } from '../api/campaignApi'
import { templateApi } from '../api/templateApi'
import { contactApi } from '../api/contactApi'
import toast from 'react-hot-toast'
import { Plus, Send, Play, Pause, Trash2, Calendar, Users, CheckCircle } from 'lucide-react'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'

const Campaigns = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    templateId: '',
    targetType: 'all',
    tags: [],
    scheduledAt: '',
    accountId: 'default-account-id'
  })

  const accountId = 'default-account-id'

  // Fetch campaigns
  const { data: campaignsData, isLoading } = useQuery({
    queryKey: ['campaigns', accountId],
    queryFn: () => campaignApi.getCampaigns({ accountId })
  })

  // Fetch templates
  const { data: templatesData } = useQuery({
    queryKey: ['templates', accountId],
    queryFn: () => templateApi.getTemplates({ accountId })
  })

  // Fetch contacts
  const { data: contactsData } = useQuery({
    queryKey: ['contacts', accountId],
    queryFn: () => contactApi.getContacts({ accountId })
  })

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: (data) => campaignApi.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      setIsModalOpen(false)
      resetForm()
      toast.success('Campaign created successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create campaign')
    }
  })

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => campaignApi.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['campaigns'])
      toast.success('Campaign deleted')
    }
  })

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      templateId: '',
      targetType: 'all',
      tags: [],
      scheduledAt: '',
      accountId
    })
    setStep(1)
  }

  const handleNext = () => {
    if (step === 1 && !formData.name) {
      toast.error('Please enter campaign name')
      return
    }
    if (step === 2 && !formData.templateId) {
      toast.error('Please select a template')
      return
    }
    setStep(step + 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const targetContacts = {
      type: formData.targetType,
      tags: formData.tags,
      contactIds: []
    }

    createMutation.mutate({
      ...formData,
      targetContacts,
      scheduledAt: formData.scheduledAt || null
    })
  }

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      running: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      paused: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || colors.draft
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading campaigns..." />
      </div>
    )
  }

  const campaigns = campaignsData?.data?.data?.campaigns || []
  const templates = templatesData?.data?.data?.templates?.filter(t => t.status === 'APPROVED') || []
  const contacts = contactsData?.data?.data?.rows || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-2">Create and manage bulk messaging campaigns</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Campaigns Grid */}
      {campaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Delete this campaign?')) {
                      deleteMutation.mutate(campaign.id)
                    }
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Messages:</span>
                  <span className="font-medium text-gray-900">
                    {campaign.stats?.sent || 0} / {campaign.stats?.total || 0}
                  </span>
                </div>

                {campaign.scheduledAt && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(campaign.scheduledAt).toLocaleString()}</span>
                  </div>
                )}

                {campaign.stats && (
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Delivered:</span>
                      <span className="text-green-600 font-medium">{campaign.stats.delivered || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Read:</span>
                      <span className="text-blue-600 font-medium">{campaign.stats.read || 0}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Failed:</span>
                      <span className="text-red-600 font-medium">{campaign.stats.failed || 0}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Send className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Campaigns Yet</h3>
          <p className="text-gray-600 mb-6">Create your first bulk messaging campaign</p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Campaign
          </Button>
        </div>
      )}

      {/* Create Campaign Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={`Create Campaign - Step ${step} of 4`}
        size="xl"
      >
        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div>
              <Input
                label="Campaign Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Black Friday Sale"
                required
              />
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Campaign description..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                  rows="3"
                />
              </div>
              <Button type="button" onClick={handleNext} className="w-full">
                Next: Select Template
              </Button>
            </div>
          )}

          {/* Step 2: Select Template */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Template <span className="text-red-500">*</span>
              </label>
              {templates.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setFormData({ ...formData, templateId: template.id })}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        formData.templateId === template.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          <p className="text-sm text-gray-600 mt-1">
                            {template.components.find(c => c.type === 'BODY')?.text?.slice(0, 60)}...
                          </p>
                        </div>
                        {formData.templateId === template.id && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No approved templates available</p>
                  <Button type="button" onClick={() => window.location.href = '/templates'}>
                    Create Template First
                  </Button>
                </div>
              )}
              <div className="flex space-x-3 mt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={handleNext} disabled={!formData.templateId}>
                  Next: Select Audience
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Select Audience */}
          {step === 3 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Target Audience <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3 mb-4">
                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="targetType"
                    value="all"
                    checked={formData.targetType === 'all'}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">All Contacts</p>
                    <p className="text-sm text-gray-600">{contacts.length} contacts</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="targetType"
                    value="tags"
                    checked={formData.targetType === 'tags'}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                    className="text-green-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">By Tags</p>
                    <p className="text-sm text-gray-600">Select contacts by tags</p>
                  </div>
                </label>
              </div>

              {formData.targetType === 'tags' && (
                <Input
                  label="Enter Tags (comma separated)"
                  value={formData.tags.join(',')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="vip, customer, leads"
                />
              )}

              <div className="flex space-x-3 mt-4">
                <Button type="button" variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="button" onClick={handleNext}>
                  Next: Schedule
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {step === 4 && (
            <div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When to send?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sendTime"
                      checked={!formData.scheduledAt}
                      onChange={() => setFormData({ ...formData, scheduledAt: '' })}
                      className="text-green-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900">Send Now</p>
                      <p className="text-sm text-gray-600">Start campaign immediately</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      name="sendTime"
                      checked={!!formData.scheduledAt}
                      onChange={() => setFormData({ 
                        ...formData, 
                        scheduledAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16)
                      })}
                      className="text-green-600"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Schedule for Later</p>
                      {formData.scheduledAt && (
                        <input
                          type="datetime-local"
                          value={formData.scheduledAt}
                          onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                          className="mt-2 px-3 py-2 border rounded-lg w-full"
                        />
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-900 mb-3">Campaign Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-medium">{formData.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">
                      {templates.find(t => t.id === formData.templateId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Audience:</span>
                    <span className="font-medium">
                      {formData.targetType === 'all' ? 'All Contacts' : `Tagged: ${formData.tags.join(', ')}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estimated Recipients:</span>
                    <span className="font-medium">{contacts.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button type="button" variant="secondary" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button type="submit" loading={createMutation.isPending} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>
    </div>
  )
}

export default Campaigns
