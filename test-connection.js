// test-connection.js - Quick test of AnythingLLM connection
import { config } from 'dotenv';
import { AnythingLLMService } from './src/services/AnythingLLMService.js';

config();

async function testConnection() {
  console.log('🧪 Testing AnythingLLM Connection...\n');

  const service = new AnythingLLMService();

  // Show config
  const cfg = service.getConfig();
  console.log('📋 Configuration:');
  console.log(`   Base URL: ${cfg.baseUrl}`);
  console.log(`   Has API Key: ${cfg.hasApiKey}`);
  console.log(`   Timeout: ${cfg.timeout}ms\n`);

  // Show workspace mappings
  console.log('🗺️  Workspace Mappings:');
  Object.entries(cfg.workspaceMap).forEach(([channel, workspace]) => {
    console.log(`   #${channel.padEnd(15)} → ${workspace}`);
  });
  console.log('');

  // Test connection
  console.log('🔌 Testing connection to AnythingLLM...');
  try {
    const isHealthy = await service.testConnection();
    if (isHealthy) {
      console.log('✅ Connection successful!\n');
    } else {
      console.log('❌ Connection failed (unhealthy response)\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('\n💡 Make sure AnythingLLM is running on', cfg.baseUrl);
    process.exit(1);
  }

  // List workspaces
  console.log('📦 Fetching available workspaces...');
  try {
    const workspaces = await service.listWorkspaces();
    if (workspaces.length > 0) {
      console.log(`✅ Found ${workspaces.length} workspace(s):`);
      workspaces.forEach(ws => {
        console.log(`   - ${ws.name} (${ws.slug})`);
      });
    } else {
      console.log('⚠️  No workspaces found. Create them in AnythingLLM first.');
    }
  } catch (error) {
    console.log('⚠️  Could not fetch workspaces:', error.message);
  }

  console.log('\n✨ Test complete! Ready to run the bot with `npm start`');
}

testConnection().catch(console.error);
