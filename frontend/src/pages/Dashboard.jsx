import { useQuery } from '@tanstack/react-query'
import { messageApi } from '../api/messageApi'
import { contactApi } from '../api/contactApi'
import { 
  MessageSquare, 
  Users, 
  Send, 
  CheckCircle,
  TrendingUp,
  Clock
} from 'lucide-react'

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

const Dashboard = () => {
  // Fetch stats
  const { data: messageStats } = useQuery({
    queryKey: ['messageStats'],
    queryFn: () => messageApi.getStats()
  })

  const { data: contactsData } = useQuery({
    queryKey: ['contacts', { limit: 10 }],
    queryFn: () => contactApi.getContacts({ limit: 10 })
  })

  const { data: recentMessages } = useQuery({
    queryKey: ['recentMessages'],
    queryFn: () => messageApi.getMessages({ limit: 10 })
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Messages"
          value="1,234"
          icon={MessageSquare}
          color="bg-blue-500"
          trend="+12% from last week"
        />
        <StatCard
          title="Total Contacts"
          value={contactsData?.data?.count || 0}
          icon={Users}
          color="bg-green-500"
          trend="+5% from last week"
        />
        <StatCard
          title="Messages Sent"
          value="856"
          icon={Send}
          color="bg-purple-500"
        />
        <StatCard
          title="Delivered"
          value="789"
          icon={CheckCircle}
          color="bg-teal-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Messages</h2>
          </div>
          <div className="p-6">
            {recentMessages?.data?.rows?.length > 0 ? (
              <div className="space-y-4">
                {recentMessages.data.rows.slice(0, 5).map((message) => (
                  <div key={message.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {message.contact?.name || message.contact?.phoneNumber}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {message.content?.text || `${message.type} message`}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      message.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      message.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      message.status === 'read' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No messages yet</p>
            )}
          </div>
        </div>

        {/* Recent Contacts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Contacts</h2>
          </div>
          <div className="p-6">
            {contactsData?.data?.rows?.length > 0 ? (
              <div className="space-y-4">
                {contactsData.data.rows.slice(0, 5).map((contact) => (
                  <div key={contact.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {contact.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">{contact.phoneNumber}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {contact.tags?.length > 0 && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                          {contact.tags[0]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No contacts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
