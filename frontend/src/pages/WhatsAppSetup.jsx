import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { whatsappAccountApi } from '../api/whatsappAccountApi'
import toast from 'react-hot-toast'
import { Plus, Trash2, CheckCircle, XCircle, Settings, ExternalLink } from 'lucide-react'
import Button from '../components/common/Button'
import Modal from '../components/common/Modal'
import Input from '../components/common/Input'
import Loader from '../components/common/Loader'

const WhatsAppSetup = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [formData, setFormData] = useState({
    phoneNumberId: '',
    businessAccountId: '',
    phoneNumber: '',
    displayName: '',
    accessToken: ''
  })

  // Fetch accounts
  const { data: accountsData, isLoading } = useQuery({
    queryKey: ['whatsapp-accounts'],
    queryFn: () => whatsappAccountApi.getAccounts()
  })

  // Create account mutation
  const createMutation = useMutation({
    mutationFn: (data) => whatsappAccountApi.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['whatsapp-accounts'])
      setIsModalOpen(false)
      resetForm()
      toast.success('WhatsApp account connected successfully!')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to connect account')
    }
  })

  // Delete account mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => whatsappAccountApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['whatsapp-accounts'])
      toast.success('Account disconnected successfully')
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete account')
    }
  })

  // Test connection
  const testConnection = async () => {
    if (!formData.phoneNumberId || !formData.accessToken) {
      toast.error('Please enter Phone Number ID and Access Token')
      return
    }

    setTestingConnection(true)
    try {
      const response = await whatsappAccountApi.testConnection({
        phoneNumberId: formData.phoneNumberId,
        accessToken: formData.accessToken
      })
      
      toast.success('Connection successful!')
      
      // Auto-fill phone number if available
      if (response.data?.data?.phoneInfo?.display_phone_number) {
        setFormData(prev => ({
          ...prev,
          phoneNumber: response.data.data.phoneInfo.display_phone_number,
          displayName: response.data.data.businessProfile?.about || prev.displayName
        }))
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Connection test failed')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const resetForm = () => {
    setFormData({
      phoneNumberId: '',
      businessAccountId: '',
      phoneNumber: '',
      displayName: '',
      accessToken: ''
    })
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to disconnect this WhatsApp account?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading WhatsApp accounts..." />
      </div>
    )
  }

  const accounts = accountsData?.data?.data?.accounts || []

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Accounts</h1>
          <p className="text-gray-600 mt-2">Connect your WhatsApp Business accounts to start messaging</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Account
        </Button>
      </div>

      {/* Setup Guide */}
      {accounts.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            How to get WhatsApp API credentials?
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">Meta for Developers</a></li>
            <li>Create a new app or select existing one</li>
            <li>Add "WhatsApp" product to your app</li>
            <li>Go to "API Setup" section</li>
            <li>Copy your Phone Number ID, Business Account ID, and Access Token</li>
            <li>Come back here and connect your account</li>
          </ol>
          <a
            href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            View Complete Documentation
            <ExternalLink className="h-4 w-4 ml-1" />
          </a>
        </div>
      )}

      {/* Accounts List */}
      {accounts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {accounts.map((account) => (
            <div key={account.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Settings className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {account.displayName || 'WhatsApp Business'}
                    </h3>
                    <p className="text-sm text-gray-600">{account.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {account.status === 'active' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number ID:</span>
                  <span className="font-mono text-gray-900">{account.phoneNumberId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Business Account ID:</span>
                  <span className="font-mono text-gray-900">{account.businessAccountId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {account.status}
                  </span>
                </div>
                {account.qualityRating && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quality Rating:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      account.qualityRating === 'GREEN' ? 'bg-green-100 text-green-800' :
                      account.qualityRating === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {account.qualityRating}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Webhook Verify Token: <code className="bg-gray-100 px-2 py-1 rounded">{account.webhookVerifyToken}</code>
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Settings className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No WhatsApp Accounts Connected
          </h3>
          <p className="text-gray-600 mb-6">
            Connect your first WhatsApp Business account to start sending messages
          </p>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Connect Your First Account
          </Button>
        </div>
      )}

      {/* Add Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title="Connect WhatsApp Account"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Phone Number ID"
            value={formData.phoneNumberId}
            onChange={(e) => setFormData({ ...formData, phoneNumberId: e.target.value })}
            placeholder="Enter your Phone Number ID"
            required
          />

          <Input
            label="Business Account ID"
            value={formData.businessAccountId}
            onChange={(e) => setFormData({ ...formData, businessAccountId: e.target.value })}
            placeholder="Enter your Business Account ID"
            required
          />

          <Input
            label="Access Token"
            type="password"
            value={formData.accessToken}
            onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
            placeholder="Enter your Access Token"
            required
          />

          <Button
            type="button"
            variant="outline"
            onClick={testConnection}
            loading={testingConnection}
            className="w-full mb-4"
          >
            Test Connection
          </Button>

          <Input
            label="Phone Number (Optional)"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="+1234567890"
          />

          <Input
            label="Display Name (Optional)"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="My Business"
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Keep your Access Token secure. Never share it publicly.
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
              loading={createMutation.isPending}
            >
              Connect Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default WhatsAppSetup
