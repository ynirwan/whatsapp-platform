import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { automationApi } from '../api/automationApi'
import toast from 'react-hot-toast'
import { Plus, Trash2, Power, MessageCircle, Zap, Edit } from 'lucide-react'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'

const Automation = () => {
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState(null)
  const [formData, setFormData] = useState({
    trigger: '',
    response: '',
    enabled: true
  })

  const accountId = 'default-account-id'

  // Fetch auto-replies
  const { data: autoRepliesData, isLoading } = useQuery({
    queryKey: ['auto-replies', accountId],
    queryFn: () => automationApi.getAutoReplies({ accountId })
  })

  // Create auto-reply mutation
  const createMutation = useMutation({
    mutationFn: (data) => automationApi.createAutoReply({ ...data, accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-replies'])
      setIsModalOpen(false)
      resetForm()
      toast.success('Auto-reply rule created!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create rule')
    }
  })

  // Update auto-reply mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => automationApi.updateAutoReply(id, { ...data, accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-replies'])
      toast.success('Rule updated!')
    }
  })

  // Delete auto-reply mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => automationApi.deleteAutoReply(id, { accountId }),
    onSuccess: () => {
      queryClient.invalidateQueries(['auto-replies'])
      toast.success('Rule deleted')
    }
  })

  const resetForm = () => {
    setFormData({
      trigger: '',
      response: '',
      enabled: true
    })
    setEditingRule(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingRule) {
      updateMutation.mutate({ id: editingRule.id, ...formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (rule) => {
    setEditingRule(rule)
    setFormData({
      trigger: rule.trigger,
      response: rule.response,
      enabled: rule.enabled
    })
    setIsModalOpen(true)
  }

  const toggleRule = (rule) => {
    updateMutation.mutate({
      id: rule.id,
      enabled: !rule.enabled
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading automation rules..." />
      </div>
    )
  }

  const autoReplies = autoRepliesData?.data?.data?.autoReplies || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Automation & Chatbot</h1>
          <p className="text-gray-600 mt-2">Set up auto-replies and automated workflows</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Auto-Reply Rule
        </Button>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
          <MessageCircle className="h-10 w-10 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Replies</h3>
          <p className="text-sm text-gray-700">
            Automatically respond to messages based on keywords
          </p>
          <div className="mt-4">
            <span className="text-2xl font-bold text-blue-600">{autoReplies.length}</span>
            <span className="text-sm text-gray-600 ml-2">active rules</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
          <Zap className="h-10 w-10 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Replies</h3>
          <p className="text-sm text-gray-700">
            Save and reuse common responses
          </p>
          <div className="mt-4">
            <span className="text-sm text-purple-600 font-medium">Coming Soon</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
          <Power className="h-10 w-10 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflows</h3>
          <p className="text-sm text-gray-700">
            Create complex automation flows
          </p>
          <div className="mt-4">
            <span className="text-sm text-green-600 font-medium">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Auto-Reply Rules */}
      {autoReplies.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Auto-Reply Rules</h2>
          {autoReplies.map((rule) => (
            <div key={rule.id} className="bg-white border rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <button
                      onClick={() => toggleRule(rule)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        rule.enabled ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {rule.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Trigger Keyword:</p>
                    <p className="text-lg font-semibold text-gray-900">{rule.trigger}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Auto Response:</p>
                    <p className="text-gray-700">{rule.response}</p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(rule)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this rule?')) {
                        deleteMutation.mutate(rule.id)
                      }
                    }}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MessageCircle className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No Auto-Reply Rules Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first auto-reply rule to automate responses
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Rule
          </Button>
        </div>
      )}

      {/* Add/Edit Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingRule ? 'Edit Auto-Reply Rule' : 'Add Auto-Reply Rule'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Trigger Keyword"
            value={formData.trigger}
            onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
            placeholder="hello, hi, pricing, support"
            required
          />
          <p className="text-xs text-gray-500 -mt-2 mb-4">
            When a message contains this keyword, the auto-reply will be sent
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auto Response <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.response}
              onChange={(e) => setFormData({ ...formData, response: e.target.value })}
              placeholder="Thank you for your message! We'll get back to you soon."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              rows="4"
              required
            />
          </div>

          <label className="flex items-center space-x-3 mb-6">
            <input
              type="checkbox"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">Enable this rule immediately</span>
          </label>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Keep your triggers specific to avoid false matches. 
              The system will check if the incoming message contains your trigger keyword.
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
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editingRule ? 'Update Rule' : 'Create Rule'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Automation
