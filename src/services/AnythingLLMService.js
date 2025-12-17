// src/services/AnythingLLMService.js - AnythingLLM Integration
import axios from 'axios';
import { logger } from '../utils/logger.js';

export class AnythingLLMService {
  constructor() {
    this.baseUrl = process.env.ANYTHINGLLM_URL || 'http://localhost:3009';
    this.apiKey = process.env.ANYTHINGLLM_API_KEY || null;
    this.timeout = 30000; // 30 second timeout for LLM responses

    // Workspace mapping
    this.workspaceMap = {
      'fitness': 'fitness-coach',
      'finance': 'Finance',
      'code': 'Code',
      'home-assistant': 'home-ass',
      'general': 'General Q&A'
    };
  }

  // Send message to specific workspace
  async chat(workspaceSlug, message, mode = 'chat') {
    try {
      logger.info(`Sending message to workspace: ${workspaceSlug}`);

      const endpoint = `${this.baseUrl}/api/v1/workspace/${workspaceSlug}/chat`;

      const config = {
        timeout: this.timeout,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      // Add Authorization header if API key is configured
      if (this.apiKey) {
        config.headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.post(endpoint, {
        message,
        mode
      }, config);

      logger.info(`✅ Response received from ${workspaceSlug}`);

      return {
        success: true,
        response: response.data.textResponse || response.data.response,
        workspace: workspaceSlug,
        raw: response.data
      };

    } catch (error) {
      logger.error(`❌ AnythingLLM chat error for workspace ${workspaceSlug}:`, error.message);

      if (error.code === 'ECONNREFUSED') {
        throw new Error('AnythingLLM is not running. Start the service first.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('AnythingLLM request timed out. The model may be processing a complex query.');
      } else if (error.response?.status === 401) {
        throw new Error('Invalid API key. Check your ANYTHINGLLM_API_KEY environment variable.');
      } else if (error.response?.status === 404) {
        throw new Error(`Workspace "${workspaceSlug}" not found. Check your workspace configuration.`);
      } else {
        throw new Error(`AnythingLLM error: ${error.message}`);
      }
    }
  }

  // Get workspace slug from channel name
  getWorkspaceFromChannel(channelName) {
    // Remove # if present
    const cleanName = channelName.replace(/^#/, '').toLowerCase();

    // Direct mapping lookup
    if (this.workspaceMap[cleanName]) {
      return this.workspaceMap[cleanName];
    }

    // Fuzzy matching for variations
    for (const [key, value] of Object.entries(this.workspaceMap)) {
      if (cleanName.includes(key) || key.includes(cleanName)) {
        return value;
      }
    }

    // Default to general Q&A
    logger.warn(`No workspace mapping found for channel: ${channelName}, using General Q&A`);
    return this.workspaceMap['general'];
  }

  // Test connection to AnythingLLM
  async testConnection() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/health`, {
        timeout: 5000
      });

      if (response.status === 200) {
        logger.info('✅ AnythingLLM connection successful');
        return true;
      }

      return false;
    } catch (error) {
      logger.error('❌ AnythingLLM connection failed:', error.message);
      return false;
    }
  }

  // List available workspaces (for validation)
  async listWorkspaces() {
    try {
      const endpoint = `${this.baseUrl}/api/v1/workspaces`;

      const config = {
        timeout: 5000,
        headers: {}
      };

      if (this.apiKey) {
        config.headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await axios.get(endpoint, config);

      logger.info(`Found ${response.data.workspaces?.length || 0} workspaces`);
      return response.data.workspaces || [];

    } catch (error) {
      logger.error('Failed to list workspaces:', error.message);
      return [];
    }
  }

  // Get service configuration
  getConfig() {
    return {
      baseUrl: this.baseUrl,
      hasApiKey: !!this.apiKey,
      timeout: this.timeout,
      workspaceMap: this.workspaceMap,
      endpoints: {
        chat: (workspace) => `${this.baseUrl}/api/v1/workspace/${workspace}/chat`,
        health: `${this.baseUrl}/api/health`,
        workspaces: `${this.baseUrl}/api/v1/workspaces`
      }
    };
  }

  // Update workspace mapping (for runtime configuration)
  updateWorkspaceMap(channelName, workspaceSlug) {
    this.workspaceMap[channelName] = workspaceSlug;
    logger.info(`Updated workspace mapping: ${channelName} -> ${workspaceSlug}`);
  }
}
