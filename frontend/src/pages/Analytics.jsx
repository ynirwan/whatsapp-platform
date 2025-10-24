import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { messageApi } from '../api/messageApi'
import { BarChart3, TrendingUp, Users, MessageSquare, Send, CheckCircle, Clock, XCircle } from 'lucide-react'
import Loader from '../components/common/Loader'

const StatCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{trend}</span>
          </div>
        )}
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
)

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7')
  const accountId = 'default-account-id'

  // Fetch analytics data
  const { data: statsData, isLoading } = useQuery({
    queryKey: ['analytics', accountId, dateRange],
    queryFn: () => messageApi.getStats({ accountId, days: dateRange })
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader size="lg" text="Loading analytics..." />
      </div>
    )
  }

  const stats = statsData?.data?.data?.stats || []

  // Calculate metrics
  const totalMessages = stats.reduce((sum, s) => sum + parseInt(s.count), 0)
  const sentMessages = stats.filter(s => s.direction === 'outbound').reduce((sum, s) => sum + parseInt(s.count), 0)
  const receivedMessages = stats.filter(s => s.direction === 'inbound').reduce((sum, s) => sum + parseInt(s.count), 0)
  const deliveredMessages = stats.filter(s => s.status === 'delivered').reduce((sum, s) => sum + parseInt(s.count), 0)
  const readMessages = stats.filter(s => s.status === 'read').reduce((sum, s) => sum + parseInt(s.count), 0)
  const failedMessages = stats.filter(s => s.status === 'failed').reduce((sum, s) => sum + parseInt(s.count), 0)

  const deliveryRate = sentMessages > 0 ? ((deliveredMessages / sentMessages) * 100).toFixed(1) : 0
  const readRate = deliveredMessages > 0 ? ((readMessages / deliveredMessages) * 100).toFixed(1) : 0

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-2">Track your messaging performance and insights</p>
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
        >
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Messages"
          value={totalMessages}
          icon={MessageSquare}
          color="bg-blue-500"
          trend="+12% from last period"
        />
        <StatCard
          title="Messages Sent"
          value={sentMessages}
          icon={Send}
          color="bg-purple-500"
          subtitle={`${receivedMessages} received`}
        />
        <StatCard
          title="Delivery Rate"
          value={`${deliveryRate}%`}
          icon={CheckCircle}
          color="bg-green-500"
          subtitle={`${deliveredMessages} delivered`}
        />
        <StatCard
          title="Read Rate"
          value={`${readRate}%`}
          icon={BarChart3}
          color="bg-teal-500"
          subtitle={`${readMessages} read`}
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Status Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Message Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Delivered</p>
                  <p className="text-sm text-gray-600">{deliveryRate}% success rate</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{deliveredMessages}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Read</p>
                  <p className="text-sm text-gray-600">{readRate}% read rate</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{readMessages}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Pending</p>
                  <p className="text-sm text-gray-600">In queue</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.filter(s => s.status === 'pending').reduce((sum, s) => sum + parseInt(s.count), 0)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Failed</p>
                  <p className="text-sm text-gray-600">Delivery failed</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">{failedMessages}</span>
            </div>
          </div>
        </div>

        {/* Message Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Message Types</h2>
          <div className="space-y-3">
            {['text', 'image', 'video', 'document', 'template'].map((type) => {
              const count = stats.filter(s => s.type === type).reduce((sum, s) => sum + parseInt(s.count), 0)
              const percentage = totalMessages > 0 ? ((count / totalMessages) * 100).toFixed(1) : 0
              
              return (
                <div key={type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize text-gray-700">{type}</span>
                    <span className="font-medium text-gray-900">{count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Engagement Overview */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{sentMessages}</p>
              <p className="text-sm text-gray-600 mt-1">Sent</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{deliveredMessages}</p>
              <p className="text-sm text-gray-600 mt-1">Delivered</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{readMessages}</p>
              <p className="text-sm text-gray-600 mt-1">Read</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{failedMessages}</p>
              <p className="text-sm text-gray-600 mt-1">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">🚀 Coming Soon</h3>
        <p className="text-gray-700">
          Advanced analytics features including time-series charts, peak hours heatmap, 
          contact engagement contact engagement scoring, and exportable reports are in development.
        </p>
      </div>
    </div>
  )
}

export default Analytics
