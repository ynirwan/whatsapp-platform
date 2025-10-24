/* 
 * COPY TO: ~/whatsapp-platform/frontend/src/pages/Chatbots.jsx
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChatbotStore from '../store/chatbotStore';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';
import { 
  PlusIcon, 
  TrashIcon, 
  ChatBubbleBottomCenterTextIcon, 
  PencilIcon,
  PowerIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Chatbots = () => {
  const navigate = useNavigate();
  const {
    chatbots,
    loading,
    error,
    fetchChatbots,
    deleteChatbot,
    toggleChatbotStatus,
    clearError
  } = useChatbotStore();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedChatbot, setSelectedChatbot] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadChatbots();
  }, []);

  const loadChatbots = async () => {
    try {
      await fetchChatbots();
    } catch (err) {
      console.error('Failed to load chatbots:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChatbot(selectedChatbot.id);
      setShowDeleteModal(false);
      setSelectedChatbot(null);
    } catch (err) {
      console.error('Failed to delete chatbot:', err);
    }
  };

  const handleToggleStatus = async (chatbot) => {
    try {
      await toggleChatbotStatus(chatbot.id);
    } catch (err) {
      console.error('Failed to toggle chatbot status:', err);
    }
  };

  const filteredChatbots = chatbots.filter((chatbot) => {
    const matchesSearch = chatbot.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || chatbot.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && chatbot.isActive) ||
      (filterStatus === 'inactive' && !chatbot.isActive);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getChatbotTypeColor = (type) => {
    switch (type) {
      case 'rule-based':
        return 'bg-blue-100 text-blue-800';
      case 'ai-powered':
        return 'bg-purple-100 text-purple-800';
      case 'hybrid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getChatbotTypeLabel = (type) => {
    switch (type) {
      case 'rule-based':
        return 'Rule Based';
      case 'ai-powered':
        return 'AI Powered';
      case 'hybrid':
        return 'Hybrid';
      default:
        return type;
    }
  };

  if (loading && chatbots.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-blue-600" />
            Chatbots
          </h1>
          <p className="text-gray-600 mt-2">
            Create and manage AI-powered chatbots for automated conversations
          </p>
        </div>
        <Button
          onClick={() => navigate('/chatbots/create')}
          className="flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Create Chatbot
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-500 hover:text-red-700">
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search chatbots..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="rule-based">Rule Based</option>
              <option value="ai-powered">AI Powered</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chatbots Grid */}
      {filteredChatbots.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <ChatBubbleBottomCenterTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No chatbots found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first chatbot to get started'}
          </p>
          {!searchTerm && filterType === 'all' && filterStatus === 'all' && (
            <Button onClick={() => navigate('/chatbots/create')}>
              Create Your First Chatbot
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChatbots.map((chatbot) => (
            <div
              key={chatbot.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {chatbot.name}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getChatbotTypeColor(
                        chatbot.type
                      )}`}
                    >
                      {getChatbotTypeLabel(chatbot.type)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        chatbot.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {chatbot.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleToggleStatus(chatbot)}
                  className={`p-2 rounded-lg transition-colors ${
                    chatbot.isActive
                      ? 'bg-green-100 text-green-600 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title={chatbot.isActive ? 'Deactivate' : 'Activate'}
                >
                  <PowerIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Description */}
              {chatbot.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {chatbot.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-gray-200">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {chatbot.totalConversations || 0}
                  </div>
                  <div className="text-xs text-gray-600">Conversations</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {chatbot.totalMessages || 0}
                  </div>
                  <div className="text-xs text-gray-600">Messages</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/chatbots/${chatbot.id}/conversations`)}
                  className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Chats
                </button>
                <button
                  onClick={() => navigate(`/chatbots/${chatbot.id}/analytics`)}
                  className="flex-1 px-3 py-2 text-sm bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  Analytics
                </button>
                <button
                  onClick={() => navigate(`/chatbots/${chatbot.id}/settings`)}
                  className="px-3 py-2 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Settings"
                >
                  <Cog6ToothIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedChatbot(chatbot);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedChatbot(null);
        }}
        title="Delete Chatbot"
      >
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete "{selectedChatbot?.name}"? This action cannot be undone
            and will delete all conversations and messages associated with this chatbot.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedChatbot(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Chatbot
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Chatbots;
