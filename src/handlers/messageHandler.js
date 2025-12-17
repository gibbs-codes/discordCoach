// src/handlers/messageHandler.js - Simple Discord to AnythingLLM Passthrough
import { AnythingLLMService } from '../services/AnythingLLMService.js';
import { logger } from '../utils/logger.js';

export class MessageHandler {
  constructor() {
    this.llmService = new AnythingLLMService();
  }

  async handleMessage(message) {
    try {
      // Get workspace from channel name
      const workspace = this.llmService.getWorkspaceFromChannel(message.channel.name);

      logger.info(`Message in #${message.channel.name} → ${workspace}: ${message.content.substring(0, 50)}...`);

      // Show typing indicator
      await message.channel.sendTyping();

      // Send message to AnythingLLM
      const result = await this.llmService.chat(workspace, message.content);

      // Send response back to Discord
      await message.reply(result.response);

      logger.info(`✅ Response sent to #${message.channel.name}`);

    } catch (error) {
      logger.error('Error handling message:', error);

      // User-friendly error messages
      let errorMessage = 'Something went wrong processing your message.';

      if (error.message.includes('not running')) {
        errorMessage = '⚠️ AnythingLLM is not running. Make sure the service is started.';
      } else if (error.message.includes('not found')) {
        errorMessage = `⚠️ ${error.message}`;
      } else if (error.message.includes('timed out')) {
        errorMessage = '⏱️ Request timed out. The model might be processing something complex.';
      }

      await message.reply(errorMessage);
    }
  }

  async handleReaction(reaction, user) {
    // Placeholder for future reaction handling
    logger.info(`Reaction ${reaction.emoji.name} by ${user.displayName}`);
  }
}
