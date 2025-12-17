// src/bot.js - Discord to AnythingLLM Passthrough Bot
import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import { MessageHandler } from './handlers/messageHandler.js';
import { logger } from './utils/logger.js';
import './utils/config.js'; // Validates environment on import

config();

class DiscordAnythingLLMBot {
  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
      ]
    });

    this.messageHandler = new MessageHandler();
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.client.once('ready', async () => {
      logger.info(`🤖 ${this.client.user.tag} is online!`);
      logger.info(`📡 Connected to ${this.client.guilds.cache.size} server(s)`);
      logger.info(`🔗 Ready to bridge Discord to AnythingLLM workspaces`);

      // Log channel mappings
      for (const guild of this.client.guilds.cache.values()) {
        logger.info(`\n📋 ${guild.name} channels:`);
        guild.channels.cache
          .filter(ch => ch.type === 0) // Text channels only
          .forEach(channel => {
            const workspace = this.messageHandler.llmService.getWorkspaceFromChannel(channel.name);
            logger.info(`  #${channel.name} → ${workspace}`);
          });
      }
    });

    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      await this.messageHandler.handleMessage(message);
    });

    this.client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) return;
      await this.messageHandler.handleReaction(reaction, user);
    });

    this.client.on('error', (error) => {
      logger.error('Discord client error:', error);
    });
  }

  async start() {
    try {
      logger.info('🚀 Starting Discord to AnythingLLM bridge...');
      await this.client.login(process.env.DISCORD_TOKEN);
    } catch (error) {
      logger.error('Failed to start bot:', error);
      process.exit(1);
    }
  }

  async shutdown() {
    logger.info('🛑 Shutting down bot...');
    await this.client.destroy();
    logger.info('✅ Bot shutdown complete');
  }
}

// Error handling
process.on('unhandledRejection', error => {
  logger.error('Unhandled promise rejection:', error);
});

process.on('SIGINT', async () => {
  if (global.bot) {
    await global.bot.shutdown();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  if (global.bot) {
    await global.bot.shutdown();
  }
  process.exit(0);
});

// Start the bot
const bot = new DiscordAnythingLLMBot();
global.bot = bot;
bot.start();
