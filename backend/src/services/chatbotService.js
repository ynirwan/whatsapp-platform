const Chatbot = require('../models/Chatbot');
const ChatbotConversation = require('../models/ChatbotConversation');
const ChatbotMessage = require('../models/ChatbotMessage');
const Contact = require('../models/Contact');
const whatsappService = require('./whatsappService');
const cacheService = require('./cacheService');
const logger = require('../utils/logger');
const axios = require('axios');

class ChatbotService {
  
  /**
   * Process incoming message through chatbot
   */
  async processMessage(chatbotId, whatsappPhoneNumber, messageContent, messageType = 'text') {
    try {
      const startTime = Date.now();
      
      // Get chatbot configuration
      const chatbot = await this.getChatbotConfig(chatbotId);
      
      if (!chatbot || !chatbot.isActive) {
        logger.warn(`Chatbot ${chatbotId} is not active`);
        return null;
      }
      
      // Check business hours
      if (chatbot.businessHoursEnabled && !this.isWithinBusinessHours(chatbot.businessHours)) {
        return await this.sendResponse(
          chatbot,
          whatsappPhoneNumber,
          chatbot.outOfOfficeMessage,
          null,
          'out-of-office'
        );
      }
      
      // Get or create conversation
      const conversation = await this.getOrCreateConversation(chatbot, whatsappPhoneNumber);
      
      // Check rate limiting
      if (chatbot.rateLimitEnabled) {
        const isRateLimited = await this.checkRateLimit(chatbot, whatsappPhoneNumber);
        if (isRateLimited) {
          logger.warn(`Rate limit exceeded for ${whatsappPhoneNumber}`);
          return null;
        }
      }
      
      // Save incoming message
      await this.saveMessage(conversation.id, chatbot.id, 'incoming', messageContent, messageType);
      
      // Check for human handoff keywords
      if (chatbot.humanHandoffEnabled && this.containsHandoffKeyword(messageContent, chatbot.humanHandoffKeywords)) {
        return await this.initiateHumanHandoff(chatbot, conversation, whatsappPhoneNumber);
      }
      
      // Check for menu keyword
      if (chatbot.menuEnabled && messageContent.toLowerCase().trim() === chatbot.menuKeyword.toLowerCase()) {
        return await this.sendMenu(chatbot, whatsappPhoneNumber, conversation);
      }
      
      // Generate response based on chatbot type
      let response;
      let metadata = {};
      
      switch (chatbot.type) {
        case 'rule-based':
          response = await this.processRuleBased(chatbot, messageContent, conversation);
          break;
        
        case 'ai-powered':
          const aiResult = await this.processAIPowered(chatbot, messageContent, conversation);
          response = aiResult.response;
          metadata = aiResult.metadata;
          break;
        
        case 'hybrid':
          // Try rule-based first, fallback to AI
          response = await this.processRuleBased(chatbot, messageContent, conversation);
          if (!response && chatbot.aiProvider) {
            const aiResult = await this.processAIPowered(chatbot, messageContent, conversation);
            response = aiResult.response;
            metadata = aiResult.metadata;
          }
          break;
        
        default:
          response = chatbot.fallbackMessage;
      }
      
      // Use fallback if no response generated
      if (!response && chatbot.fallbackEnabled) {
        response = chatbot.fallbackMessage;
      }
      
      // Send response
      if (response) {
        const responseTime = Date.now() - startTime;
        return await this.sendResponse(
          chatbot,
          whatsappPhoneNumber,
          response,
          conversation,
          'bot-response',
          { ...metadata, responseTime }
        );
      }
      
      return null;
      
    } catch (error) {
      logger.error('Error processing chatbot message:', error);
      throw error;
    }
  }
  
  /**
   * Process rule-based response
   */
  async processRuleBased(chatbot, messageContent, conversation) {
    try {
      const rules = chatbot.rules || [];
      const normalizedMessage = messageContent.toLowerCase().trim();
      
      // Sort rules by priority (higher priority first)
      const sortedRules = rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      for (const rule of sortedRules) {
        let isMatch = false;
        
        switch (rule.type) {
          case 'exact':
            isMatch = normalizedMessage === rule.trigger.toLowerCase();
            break;
          
          case 'contains':
            isMatch = normalizedMessage.includes(rule.trigger.toLowerCase());
            break;
          
          case 'regex':
            try {
              const regex = new RegExp(rule.trigger, 'i');
              isMatch = regex.test(messageContent);
            } catch (e) {
              logger.error(`Invalid regex pattern: ${rule.trigger}`, e);
            }
            break;
          
          case 'starts-with':
            isMatch = normalizedMessage.startsWith(rule.trigger.toLowerCase());
            break;
          
          case 'ends-with':
            isMatch = normalizedMessage.endsWith(rule.trigger.toLowerCase());
            break;
          
          default:
            isMatch = normalizedMessage.includes(rule.trigger.toLowerCase());
        }
        
        if (isMatch) {
          // Save matched rule for analytics
          await this.saveMessage(
            conversation.id,
            chatbot.id,
            'outgoing',
            rule.response,
            'text',
            { matchedRule: rule }
          );
          
          return this.processTemplate(rule.response, conversation);
        }
      }
      
      return null;
      
    } catch (error) {
      logger.error('Error in rule-based processing:', error);
      return null;
    }
  }
  
  /**
   * Process AI-powered response
   */
  async processAIPowered(chatbot, messageContent, conversation) {
    try {
      const startTime = Date.now();
      
      // Get conversation history for context
      const context = await this.getConversationContext(conversation.id, chatbot.contextWindowSize);
      
      // Build messages array for AI
      const messages = [
        { role: 'system', content: chatbot.aiSystemPrompt }
      ];
      
      // Add conversation context
      if (chatbot.enableContextMemory && context.length > 0) {
        context.forEach(msg => {
          messages.push({
            role: msg.direction === 'incoming' ? 'user' : 'assistant',
            content: msg.content
          });
        });
      }
      
      // Add current message
      messages.push({ role: 'user', content: messageContent });
      
      // Generate AI response based on provider
      let aiResponse;
      let tokensUsed = 0;
      
      switch (chatbot.aiProvider) {
        case 'openai':
          const openaiResult = await this.callOpenAI(chatbot, messages);
          aiResponse = openaiResult.response;
          tokensUsed = openaiResult.tokensUsed;
          break;
        
        case 'anthropic':
          const anthropicResult = await this.callAnthropic(chatbot, messages);
          aiResponse = anthropicResult.response;
          tokensUsed = anthropicResult.tokensUsed;
          break;
        
        case 'google':
          const googleResult = await this.callGoogleAI(chatbot, messages);
          aiResponse = googleResult.response;
          tokensUsed = googleResult.tokensUsed;
          break;
        
        case 'custom':
          aiResponse = await this.callCustomAI(chatbot, messages);
          break;
        
        default:
          throw new Error(`Unsupported AI provider: ${chatbot.aiProvider}`);
      }
      
      const latency = Date.now() - startTime;
      
      // Save AI response details
      await this.saveMessage(
        conversation.id,
        chatbot.id,
        'outgoing',
        aiResponse,
        'text',
        {
          isAiGenerated: true,
          aiProvider: chatbot.aiProvider,
          aiModel: chatbot.aiModel,
          aiTokensUsed: tokensUsed,
          aiLatency: latency
        }
      );
      
      return {
        response: aiResponse,
        metadata: {
          isAiGenerated: true,
          aiProvider: chatbot.aiProvider,
          aiModel: chatbot.aiModel,
          tokensUsed,
          latency
        }
      };
      
    } catch (error) {
      logger.error('Error in AI-powered processing:', error);
      return { response: chatbot.fallbackMessage, metadata: { error: error.message } };
    }
  }
  
  /**
   * Call OpenAI API
   */
  async callOpenAI(chatbot, messages) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: chatbot.aiModel || 'gpt-4',
          messages: messages,
          temperature: chatbot.aiTemperature || 0.7,
          max_tokens: chatbot.aiMaxTokens || 500
        },
        {
          headers: {
            'Authorization': `Bearer ${chatbot.aiApiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        response: response.data.choices[0].message.content,
        tokensUsed: response.data.usage.total_tokens
      };
      
    } catch (error) {
      logger.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to get AI response from OpenAI');
    }
  }
  
  /**
   * Call Anthropic Claude API
   */
  async callAnthropic(chatbot, messages) {
    try {
      // Remove system message and format for Anthropic
      const systemMessage = messages.find(m => m.role === 'system')?.content || '';
      const conversationMessages = messages.filter(m => m.role !== 'system');
      
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: chatbot.aiModel || 'claude-3-sonnet-20240229',
          system: systemMessage,
          messages: conversationMessages,
          max_tokens: chatbot.aiMaxTokens || 500,
          temperature: chatbot.aiTemperature || 0.7
        },
        {
          headers: {
            'x-api-key': chatbot.aiApiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      );
      
      return {
        response: response.data.content[0].text,
        tokensUsed: response.data.usage.input_tokens + response.data.usage.output_tokens
      };
      
    } catch (error) {
      logger.error('Anthropic API error:', error.response?.data || error.message);
      throw new Error('Failed to get AI response from Anthropic');
    }
  }
  
  /**
   * Call Google AI (Gemini) API
   */
  async callGoogleAI(chatbot, messages) {
    try {
      // Format messages for Google AI
      const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));
      
      const systemInstruction = messages.find(m => m.role === 'system')?.content;
      
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${chatbot.aiModel || 'gemini-pro'}:generateContent`,
        {
          contents: contents,
          systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
          generationConfig: {
            temperature: chatbot.aiTemperature || 0.7,
            maxOutputTokens: chatbot.aiMaxTokens || 500
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          params: {
            key: chatbot.aiApiKey
          }
        }
      );
      
      return {
        response: response.data.candidates[0].content.parts[0].text,
        tokensUsed: response.data.usageMetadata?.totalTokenCount || 0
      };
      
    } catch (error) {
      logger.error('Google AI API error:', error.response?.data || error.message);
      throw new Error('Failed to get AI response from Google AI');
    }
  }
  
  /**
   * Call custom AI endpoint
   */
  async callCustomAI(chatbot, messages) {
    try {
      if (!chatbot.webhookUrl) {
        throw new Error('Custom AI endpoint not configured');
      }
      
      const response = await axios.post(
        chatbot.webhookUrl,
        {
          messages: messages,
          config: {
            temperature: chatbot.aiTemperature,
            maxTokens: chatbot.aiMaxTokens
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            ...chatbot.webhookHeaders
          }
        }
      );
      
      return response.data.response || response.data.message || response.data;
      
    } catch (error) {
      logger.error('Custom AI API error:', error.response?.data || error.message);
      throw new Error('Failed to get AI response from custom endpoint');
    }
  }
  
  /**
   * Send menu options
   */
  async sendMenu(chatbot, whatsappPhoneNumber, conversation) {
    try {
      const menuOptions = chatbot.menuOptions || [];
      
      if (menuOptions.length === 0) {
        return null;
      }
      
      let menuText = '📋 *Menu Options*\n\n';
      menuOptions.forEach((option, index) => {
        menuText += `${index + 1}. *${option.title}*\n`;
        if (option.description) {
          menuText += `   ${option.description}\n`;
        }
        menuText += '\n';
      });
      menuText += 'Please type the number of your choice.';
      
      return await this.sendResponse(chatbot, whatsappPhoneNumber, menuText, conversation, 'menu');
    } catch (error) {
      logger.error('Error sending menu:', error);
      return null;
    }
  }
  
  /**
   * Initiate human handoff
   */
  async initiateHumanHandoff(chatbot, conversation, whatsappPhoneNumber) {
    try {
      // Update conversation status
      conversation.status = 'handed-off';
      conversation.handedOffAt = new Date();
      await conversation.save();
      
      // Send handoff message
      await this.sendResponse(
        chatbot,
        whatsappPhoneNumber,
        chatbot.humanHandoffMessage,
        conversation,
        'handoff'
      );
      
      // Notify team members (implement your notification logic)
      // await this.notifyTeam(chatbot, conversation);
      
      logger.info(`Conversation ${conversation.id} handed off to human`);
      
      return true;
    } catch (error) {
      logger.error('Error initiating human handoff:', error);
      return false;
    }
  }
  
  /**
   * Send response via WhatsApp
   */
  async sendResponse(chatbot, phoneNumber, message, conversation, type = 'bot-response', metadata = {}) {
    try {
      // Send via WhatsApp API
      const result = await whatsappService.sendMessage(
        chatbot.whatsappAccountId,
        phoneNumber,
        message
      );
      
      // Save outgoing message
      if (conversation) {
        await this.saveMessage(
          conversation.id,
          chatbot.id,
          'outgoing',
          message,
          'text',
          {
            ...metadata,
            type,
            whatsappMessageId: result.messageId,
            status: 'sent'
          }
        );
        
        // Update conversation
        conversation.messageCount += 1;
        await conversation.save();
      }
      
      return result;
      
    } catch (error) {
      logger.error('Error sending response:', error);
      throw error;
    }
  }
  
  /**
   * Get or create conversation
   */
  async getOrCreateConversation(chatbot, whatsappPhoneNumber) {
    try {
      // Check for active conversation
      let conversation = await ChatbotConversation.findOne({
        where: {
          chatbotId: chatbot.id,
          whatsappPhoneNumber: whatsappPhoneNumber,
          status: 'active'
        }
      });
      
      // Check if conversation expired
      if (conversation) {
        const timeSinceStart = Date.now() - new Date(conversation.startedAt).getTime();
        if (timeSinceStart > chatbot.conversationTimeout * 1000) {
          conversation.status = 'expired';
          conversation.endedAt = new Date();
          await conversation.save();
          conversation = null;
        }
      }
      
      // Create new conversation if needed
      if (!conversation) {
        // Get or create contact
        let contact = await Contact.findOne({
          where: { whatsappPhoneNumber: whatsappPhoneNumber }
        });
        
        if (!contact) {
          contact = await Contact.create({
            whatsappPhoneNumber: whatsappPhoneNumber,
            name: whatsappPhoneNumber,
            userId: chatbot.userId
          });
        }
        
        conversation = await ChatbotConversation.create({
          chatbotId: chatbot.id,
          contactId: contact.id,
          whatsappPhoneNumber: whatsappPhoneNumber,
          status: 'active',
          startedAt: new Date()
        });
        
        // Send welcome message if enabled
        if (chatbot.welcomeEnabled && chatbot.welcomeMessage) {
          await this.sendResponse(chatbot, whatsappPhoneNumber, chatbot.welcomeMessage, conversation, 'welcome');
        }
      }
      
      return conversation;
      
    } catch (error) {
      logger.error('Error getting or creating conversation:', error);
      throw error;
    }
  }
  
  /**
   * Save chatbot message
   */
  async saveMessage(conversationId, chatbotId, direction, content, type = 'text', metadata = {}) {
    try {
      return await ChatbotMessage.create({
        conversationId,
        chatbotId,
        direction,
        content,
        type,
        ...metadata,
        timestamp: new Date()
      });
    } catch (error) {
      logger.error('Error saving message:', error);
      throw error;
    }
  }
  
  /**
   * Get conversation context
   */
  async getConversationContext(conversationId, limit = 10) {
    try {
      return await ChatbotMessage.findAll({
        where: { conversationId },
        order: [['timestamp', 'DESC']],
        limit: limit
      });
    } catch (error) {
      logger.error('Error getting conversation context:', error);
      return [];
    }
  }
  
  /**
   * Get chatbot configuration with caching
   */
  async getChatbotConfig(chatbotId) {
    try {
      const cacheKey = `chatbot:${chatbotId}`;
      let chatbot = await cacheService.get(cacheKey);
      
      if (!chatbot) {
        chatbot = await Chatbot.findByPk(chatbotId);
        if (chatbot) {
          await cacheService.set(cacheKey, chatbot, 300); // Cache for 5 minutes
        }
      }
      
      return chatbot;
    } catch (error) {
      logger.error('Error getting chatbot config:', error);
      return null;
    }
  }
  
  /**
   * Check if within business hours
   */
  isWithinBusinessHours(businessHours) {
    const now = new Date();
    const dayName = now.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const dayConfig = businessHours[dayName];
    if (!dayConfig || !dayConfig.enabled) {
      return false;
    }
    
    return currentTime >= dayConfig.start && currentTime <= dayConfig.end;
  }
  
  /**
   * Check for human handoff keywords
   */
  containsHandoffKeyword(message, keywords) {
    const normalizedMessage = message.toLowerCase();
    return keywords.some(keyword => normalizedMessage.includes(keyword.toLowerCase()));
  }
  
  /**
   * Check rate limit
   */
  async checkRateLimit(chatbot, phoneNumber) {
    try {
      const key = `ratelimit:${chatbot.id}:${phoneNumber}`;
      const count = await cacheService.get(key) || 0;
      
      if (count >= chatbot.maxMessagesPerUser) {
        return true; // Rate limited
      }
      
      await cacheService.set(key, count + 1, 60); // 1 minute window
      return false;
    } catch (error) {
      logger.error('Error checking rate limit:', error);
      return false;
    }
  }
  
  /**
   * Process template variables
   */
  processTemplate(template, conversation) {
    try {
      let processed = template;
      
      // Replace variables
      const variables = {
        '{{contact_name}}': conversation.context?.name || 'there',
        '{{contact_phone}}': conversation.whatsappPhoneNumber,
        '{{date}}': new Date().toLocaleDateString(),
        '{{time}}': new Date().toLocaleTimeString()
      };
      
      Object.keys(variables).forEach(key => {
        processed = processed.replace(new RegExp(key, 'g'), variables[key]);
      });
      
      return processed;
    } catch (error) {
      logger.error('Error processing template:', error);
      return template;
    }
  }
  
  /**
   * Get chatbot analytics
   */
  async getAnalytics(chatbotId, startDate, endDate) {
    try {
      const conversations = await ChatbotConversation.findAll({
        where: {
          chatbotId,
          startedAt: {
            [Op.between]: [startDate, endDate]
          }
        },
        include: [
          {
            model: ChatbotMessage,
            as: 'messages'
          }
        ]
      });
      
      const totalConversations = conversations.length;
      const totalMessages = conversations.reduce((sum, conv) => sum + conv.messageCount, 0);
      const handedOff = conversations.filter(c => c.status === 'handed-off').length;
      const avgRating = conversations
        .filter(c => c.rating)
        .reduce((sum, c, i, arr) => sum + c.rating / arr.length, 0);
      
      return {
        totalConversations,
        totalMessages,
        handedOff,
        handoffRate: totalConversations > 0 ? (handedOff / totalConversations) * 100 : 0,
        averageRating: avgRating || 0,
        averageMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0
      };
      
    } catch (error) {
      logger.error('Error getting chatbot analytics:', error);
      throw error;
    }
  }
}

module.exports = new ChatbotService();
