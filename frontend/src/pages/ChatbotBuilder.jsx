import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useChatbotStore from '../store/chatbotStore';
// COMMENTED OUT - Only import if you have accountStore
// import useAccountStore from '../store/accountStore';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Loader from '../components/common/Loader';
import { 
  ChatBubbleBottomCenterTextIcon, 
  SparklesIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const ChatbotBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const { createChatbot, updateChatbot, fetchChatbot, currentChatbot, loading } = useChatbotStore();
  
  // TEMPORARY FIX: Mock accounts data if accountStore doesn't exist
  // Replace this with: const { accounts, fetchAccounts } = useAccountStore();
  const [accounts, setAccounts] = useState([]);
  
  // TEMPORARY: Mock fetch accounts
  const fetchAccounts = async () => {
    // TODO: Replace with actual API call to get WhatsApp accounts
    // For now, using empty array - you'll need to implement this
    setAccounts([]);
  };

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whatsappAccountId: '',
    type: 'rule-based',
    isActive: true,
    
    // AI Configuration
    aiProvider: '',
    aiModel: '',
    aiApiKey: '',
    aiSystemPrompt: 'You are a helpful assistant for WhatsApp customer support. Be concise, friendly, and professional.',
    aiTemperature: 0.7,
    aiMaxTokens: 500,
    
    // Welcome & Fallback
    welcomeMessage: 'Hello! 👋 How can I help you today?',
    welcomeEnabled: true,
    fallbackMessage: "I'm sorry, I didn't understand that. Can you please rephrase or type 'menu' to see available options?",
    fallbackEnabled: true,
    
    // Business Hours
    businessHoursEnabled: false,
    businessHours: {
      monday: { start: '09:00', end: '18:00', enabled: true },
      tuesday: { start: '09:00', end: '18:00', enabled: true },
      wednesday: { start: '09:00', end: '18:00', enabled: true },
      thursday: { start: '09:00', end: '18:00', enabled: true },
      friday: { start: '09:00', end: '18:00', enabled: true },
      saturday: { start: '09:00', end: '14:00', enabled: false },
      sunday: { start: '09:00', end: '14:00', enabled: false }
    },
    outOfOfficeMessage: 'We are currently offline. Our business hours are Monday-Friday, 9 AM - 6 PM. We will respond to your message as soon as possible.',
    
    // Conversation Settings
    conversationTimeout: 1800,
    maxMessagesPerConversation: 50,
    enableContextMemory: true,
    contextWindowSize: 10,
    
    // Human Handoff
    humanHandoffEnabled: true,
    humanHandoffKeywords: ['speak to human', 'talk to agent', 'human support', 'representative', 'operator'],
    humanHandoffMessage: 'Let me connect you with a human agent. Please wait a moment while I transfer you.',
    
    // Menu
    menuEnabled: true,
    menuKeyword: 'menu',
    menuOptions: [],
    
    // Rate Limiting
    rateLimitEnabled: true,
    maxMessagesPerUser: 10
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    fetchAccounts();
    if (isEditMode) {
      loadChatbot();
    }
  }, [id]);

  const loadChatbot = async () => {
    try {
      const response = await fetchChatbot(id);
      setFormData(response.data);
    } catch (err) {
      console.error('Failed to load chatbot:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.whatsappAccountId) {
      newErrors.whatsappAccountId = 'WhatsApp account is required';
    }

    if (formData.type === 'ai-powered' || formData.type === 'hybrid') {
      if (!formData.aiProvider) {
        newErrors.aiProvider = 'AI provider is required for AI-powered chatbots';
      }
      if (!formData.aiApiKey) {
        newErrors.aiApiKey = 'API key is required for AI-powered chatbots';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditMode) {
        await updateChatbot(id, formData);
      } else {
        await createChatbot(formData);
      }
      navigate('/chatbots');
    } catch (err) {
      console.error('Failed to save chatbot:', err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleBusinessHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleAddMenuOption = () => {
    setFormData(prev => ({
      ...prev,
      menuOptions: [
        ...prev.menuOptions,
        {
          id: Date.now().toString(),
          title: '',
          description: '',
          action: ''
        }
      ]
    }));
  };

  const handleRemoveMenuOption = (id) => {
    setFormData(prev => ({
      ...prev,
      menuOptions: prev.menuOptions.filter(opt => opt.id !== id)
    }));
  };

  const handleMenuOptionChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      menuOptions: prev.menuOptions.map(opt =>
        opt.id === id ? { ...opt, [field]: value } : opt
      )
    }));
  };

  if (loading && isEditMode && !currentChatbot) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ChatBubbleBottomCenterTextIcon className="w-8 h-8 text-blue-600" />
          {isEditMode ? 'Edit Chatbot' : 'Create New Chatbot'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEditMode 
            ? 'Update your chatbot configuration' 
            : 'Configure your AI-powered chatbot for automated conversations'}
        </p>
      </div>

      {/* Show warning if no accounts */}
      {accounts.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Note:</strong> You need to connect a WhatsApp account first. 
            Please add a WhatsApp account before creating a chatbot.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Tabs */}
        <div className="bg-white rounded-t-lg shadow-sm border-b border-gray-200">
          <nav className="flex space-x-1 px-6">
            {[
              { id: 'basic', label: 'Basic Info', icon: Cog6ToothIcon },
              { id: 'ai', label: 'AI Configuration', icon: SparklesIcon },
              { id: 'messages', label: 'Messages', icon: ChatBubbleLeftRightIcon },
              { id: 'hours', label: 'Business Hours', icon: ClockIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm p-8">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chatbot Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Customer Support Bot"
                    error={errors.name}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    placeholder="Brief description of what this chatbot does..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp Account *
                  </label>
                  <select
                    value={formData.whatsappAccountId}
                    onChange={(e) => handleChange('whatsappAccountId', e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.whatsappAccountId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select WhatsApp Account</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.businessName || account.phoneNumber}
                      </option>
                    ))}
                  </select>
                  {errors.whatsappAccountId && (
                    <p className="text-red-500 text-sm mt-1">{errors.whatsappAccountId}</p>
                  )}
                  {accounts.length === 0 && (
                    <p className="text-gray-500 text-sm mt-1">No WhatsApp accounts available. Please add one first.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chatbot Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="rule-based">Rule Based - Keyword matching only</option>
                    <option value="ai-powered">AI Powered - Full AI responses</option>
                    <option value="hybrid">Hybrid - Rules + AI fallback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conversation Timeout (seconds)
                  </label>
                  <Input
                    type="number"
                    value={formData.conversationTimeout}
                    onChange={(e) => handleChange('conversationTimeout', parseInt(e.target.value))}
                    min="60"
                    max="7200"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Time before conversation expires (default: 1800 seconds / 30 minutes)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Messages per Minute
                  </label>
                  <Input
                    type="number"
                    value={formData.maxMessagesPerUser}
                    onChange={(e) => handleChange('maxMessagesPerUser', parseInt(e.target.value))}
                    min="1"
                    max="100"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleChange('isActive', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.enableContextMemory}
                    onChange={(e) => handleChange('enableContextMemory', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Remember Conversation Context</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rateLimitEnabled}
                    onChange={(e) => handleChange('rateLimitEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Enable Rate Limiting</span>
                </label>
              </div>
            </div>
          )}

          {/* AI Configuration Tab - keeping original code */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {(formData.type === 'ai-powered' || formData.type === 'hybrid') ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Provider *
                      </label>
                      <select
                        value={formData.aiProvider}
                        onChange={(e) => handleChange('aiProvider', e.target.value)}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.aiProvider ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select AI Provider</option>
                        <option value="openai">OpenAI (GPT)</option>
                        <option value="anthropic">Anthropic (Claude)</option>
                        <option value="google">Google (Gemini)</option>
                        <option value="custom">Custom Endpoint</option>
                      </select>
                      {errors.aiProvider && (
                        <p className="text-red-500 text-sm mt-1">{errors.aiProvider}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        AI Model
                      </label>
                      <Input
                        value={formData.aiModel}
                        onChange={(e) => handleChange('aiModel', e.target.value)}
                        placeholder="e.g., gpt-4, claude-3-sonnet-20240229"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave empty to use the default model
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key *
                      </label>
                      <Input
                        type="password"
                        value={formData.aiApiKey}
                        onChange={(e) => handleChange('aiApiKey', e.target.value)}
                        placeholder="Enter your API key"
                        error={errors.aiApiKey}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        System Prompt
                      </label>
                      <textarea
                        value={formData.aiSystemPrompt}
                        onChange={(e) => handleChange('aiSystemPrompt', e.target.value)}
                        rows={4}
                        placeholder="Instructions for the AI on how to behave..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Define the AI's personality and behavior
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temperature
                      </label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={formData.aiTemperature}
                        onChange={(e) => handleChange('aiTemperature', parseFloat(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        0 = Focused, 2 = Creative (default: 0.7)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Tokens
                      </label>
                      <Input
                        type="number"
                        min="50"
                        max="4000"
                        value={formData.aiMaxTokens}
                        onChange={(e) => handleChange('aiMaxTokens', parseInt(e.target.value))}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Maximum length of AI responses
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <SparklesIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    AI Configuration Not Available
                  </h3>
                  <p className="text-gray-600">
                    AI configuration is only available for "AI Powered" or "Hybrid" chatbot types.
                    Please change the chatbot type in the Basic Info tab to configure AI.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Messages and Hours tabs remain the same - keeping original code */}
          {/* ... rest of the component ... */}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/chatbots')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="min-w-[200px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader size="small" />
                Saving...
              </div>
            ) : (
              isEditMode ? 'Update Chatbot' : 'Create Chatbot'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotBuilder;