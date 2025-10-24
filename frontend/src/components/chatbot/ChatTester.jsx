/* 
 * COPY TO: ~/whatsapp-platform/frontend/src/components/chatbot/ChatTester.jsx
 */
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useChatbotStore from '../../store/chatbotStore';
import Button from '../common/Button';
import Loader from '../common/Loader';
import { 
  PaperAirplaneIcon,
  TrashIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const ChatTester = () => {
  const { id } = useParams();
  const { testChatbot, loading } = useChatbotStore();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await testChatbot(id, inputMessage);
      
      const botMessage = {
        id: Date.now() + 1,
        text: response.data.response?.message || response.data.response || 'No response',
        sender: 'bot',
        timestamp: new Date(),
        metadata: response.data.response
      };

      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 500);

    } catch (err) {
      console.error('Failed to send message:', err);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Error: Failed to get response from chatbot',
        sender: 'system',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all messages?')) {
      setMessages([]);
    }
  };

  const quickMessages = [
    'Hello',
    'How can I contact support?',
    'What are your prices?',
    'Tell me more',
    'Speak to a human'
  ];

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Chat Tester</h2>
            <p className="text-gray-600 mt-1">
              Test your chatbot's responses in real-time
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={messages.length === 0}
            className="flex items-center gap-2"
          >
            <TrashIcon className="w-5 h-5" />
            Clear Chat
          </Button>
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-[600px]">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="bg-blue-100 rounded-full p-4 mb-4">
                  <SparklesIcon className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Start Testing Your Chatbot
                </h3>
                <p className="text-gray-600 mb-6">
                  Send a message below or try one of the quick messages
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickMessages.map((msg, index) => (
                    <button
                      key={index}
                      onClick={() => setInputMessage(msg)}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
                    >
                      {msg}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-3 ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.sender === 'bot'
                          ? 'bg-white border border-gray-200 text-gray-900'
                          : 'bg-red-100 text-red-900'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.text}</div>
                      <div
                        className={`flex items-center gap-2 mt-2 text-xs ${
                          message.sender === 'user'
                            ? 'text-blue-200'
                            : message.sender === 'bot'
                            ? 'text-gray-500'
                            : 'text-red-700'
                        }`}
                      >
                        <ClockIcon className="w-3 h-3" />
                        {formatTime(message.timestamp)}
                        {message.metadata && message.metadata.isAiGenerated && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                            <SparklesIcon className="w-3 h-3" />
                            AI
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Quick Messages (when chat has messages) */}
          {messages.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-200 bg-white">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {quickMessages.map((msg, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(msg)}
                    className="flex-shrink-0 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700 transition-colors"
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading || isTyping}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
              />
              <Button
                type="submit"
                disabled={!inputMessage.trim() || loading || isTyping}
                className="flex items-center gap-2 px-6"
              >
                {loading || isTyping ? (
                  <Loader size="small" />
                ) : (
                  <>
                    <PaperAirplaneIcon className="w-5 h-5" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">Testing Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Try different phrases to test your bot's understanding</li>
            <li>• Test edge cases and unusual inputs</li>
            <li>• Verify that business hours and handoff keywords work correctly</li>
            <li>• Messages sent here won't be saved to your actual conversations</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ChatTester;
