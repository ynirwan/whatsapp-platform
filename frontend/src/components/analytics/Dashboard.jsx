const Dashboard = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-sm text-gray-600">Total Messages</h3>
        <p className="text-3xl font-bold mt-2">{stats?.totalMessages || 0}</p>
      </div>
    </div>
  )
}

export default Dashboard
