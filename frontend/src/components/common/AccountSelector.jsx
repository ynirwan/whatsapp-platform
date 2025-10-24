import { useQuery } from '@tanstack/react-query'
import { whatsappAccountApi } from '../../api/whatsappAccountApi'
import { useAccountStore } from '../../store/accountStore'
import { ChevronDown, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AccountSelector = () => {
  const navigate = useNavigate()
  const { selectedAccount, setSelectedAccount, setAccounts } = useAccountStore()

  const { data: accountsData } = useQuery({
    queryKey: ['whatsapp-accounts'],
    queryFn: () => whatsappAccountApi.getAccounts(),
    onSuccess: (data) => {
      const accounts = data?.data?.data?.accounts || []
      setAccounts(accounts)
      
      // Auto-select first account if none selected
      if (!selectedAccount && accounts.length > 0) {
        setSelectedAccount(accounts[0])
      }
    }
  })

  const accounts = accountsData?.data?.data?.accounts || []

  if (accounts.length === 0) {
    return (
      <button
        onClick={() => navigate('/whatsapp-setup')}
        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm">Connect WhatsApp</span>
      </button>
    )
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 font-semibold text-sm">
              {selectedAccount?.displayName?.charAt(0) || selectedAccount?.phoneNumber?.charAt(0)}
            </span>
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900">
              {selectedAccount?.displayName || 'WhatsApp Account'}
            </p>
            <p className="text-xs text-gray-500">{selectedAccount?.phoneNumber}</p>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-50">
        <div className="p-2">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedAccount(account)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors ${
                selectedAccount?.id === account.id ? 'bg-green-50' : ''
              }`}
            >
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-600 font-semibold">
                  {account.displayName?.charAt(0) || account.phoneNumber?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">
                  {account.displayName || 'WhatsApp'}
                </p>
                <p className="text-xs text-gray-500">{account.phoneNumber}</p>
              </div>
              {selectedAccount?.id === account.id && (
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
              )}
            </button>
          ))}
        </div>
        <div className="border-t border-gray-200 p-2">
          <button
            onClick={() => navigate('/whatsapp-setup')}
            className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg"
          >
            <Plus className="h-4 w-4" />
            <span>Add Account</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountSelector
