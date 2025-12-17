// src/utils/config.js - Simple Environment Configuration
import { logger } from './logger.js';

class ConfigValidator {
  constructor() {
    this.requiredVars = ['DISCORD_TOKEN'];
    this.optionalVars = ['ANYTHINGLLM_URL', 'ANYTHINGLLM_API_KEY', 'LOG_LEVEL'];
  }

  validate() {
    logger.info('🔧 Validating configuration...');

    const missing = this.requiredVars.filter(varName => !process.env[varName]);

    if (missing.length > 0) {
      logger.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
      logger.error('Please check your .env file.');
      process.exit(1);
    }

    this.logConfigSummary();
    logger.info('✅ Configuration validation passed');
  }

  logConfigSummary() {
    logger.info('📋 Configuration:');
    logger.info(`   AnythingLLM: ${process.env.ANYTHINGLLM_URL || 'http://localhost:3009'}`);
    logger.info(`   API Key: ${process.env.ANYTHINGLLM_API_KEY ? 'Configured' : 'Not configured'}`);
    logger.info(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`   Log Level: ${process.env.LOG_LEVEL || 'INFO'}`);
  }
}

export const configValidator = new ConfigValidator();

// Auto-validate on import
configValidator.validate();
