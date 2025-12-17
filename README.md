# Discord to AnythingLLM Bridge

A simple, clean Discord bot that routes channel messages to different AnythingLLM workspaces. Each Discord channel maps to a specific workspace, allowing you to have specialized AI assistants per channel.

## 🎯 Overview

This bot acts as a passthrough between Discord and AnythingLLM:
- Messages in Discord channels → Routed to AnythingLLM workspaces
- Workspace responses → Posted back to Discord
- Zero overhead, pure passthrough architecture
- No databases, no memory services, no complex scheduling

## 📋 Channel → Workspace Mapping

```javascript
#fitness         → fitness-coach workspace
#finance         → Finance workspace
#code            → Code workspace
#home-assistant  → home-ass workspace
#general         → General Q&A workspace
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- Discord Bot Token
- AnythingLLM instance running (or will be started via Docker Compose)

### 1. Setup Environment
```bash
cp .env.example .env
# Edit .env with your Discord token
```

### 2. Configure AnythingLLM Workspaces
Create workspaces in AnythingLLM matching your Discord channels:
- `fitness-coach` (or create one and update the mapping)
- `Finance`
- `Code`
- `home-ass`
- `General Q&A`

### 3. Run Locally
```bash
npm install
npm run dev
```

### 4. Run with Docker Compose (Recommended)
```bash
docker-compose up -d
```

This starts both:
- Discord bot (connects to AnythingLLM)
- AnythingLLM instance (if not already running)

## ⚙️ Configuration

### Environment Variables

```bash
# Required
DISCORD_TOKEN=your_discord_bot_token

# AnythingLLM Connection
ANYTHINGLLM_URL=http://localhost:3009        # Local
# ANYTHINGLLM_URL=http://anythingllm:3009   # Docker
ANYTHINGLLM_API_KEY=                         # Optional

# Optional
LOG_LEVEL=INFO
NODE_ENV=production
```

### Workspace Mapping

Edit [src/services/AnythingLLMService.js:13-19](src/services/AnythingLLMService.js#L13-L19) to customize:

```javascript
this.workspaceMap = {
  'fitness': 'fitness-coach',
  'finance': 'Finance',
  'code': 'Code',
  'home-assistant': 'home-ass',
  'general': 'General Q&A'
};
```

## 🏗️ Architecture

```
Discord Message
    ↓
Channel Detection (#fitness, #code, etc.)
    ↓
Workspace Mapping (fitness → fitness-coach)
    ↓
AnythingLLM API Call (POST /api/v1/workspace/{slug}/chat)
    ↓
Response Processing
    ↓
Discord Reply
```

### File Structure
```
src/
├── bot.js                          # Main Discord client
├── handlers/
│   └── messageHandler.js           # Message routing
├── services/
│   └── AnythingLLMService.js       # AnythingLLM API client
└── utils/
    └── logger.js                   # Logging
```

## 🔧 AnythingLLM Integration

### API Endpoints Used
- `POST /api/v1/workspace/{slug}/chat` - Send message to workspace
- `GET /api/health` - Health check
- `GET /api/v1/workspaces` - List workspaces (optional)

### Authentication
API key is optional. If AnythingLLM requires authentication:
1. Generate API key in AnythingLLM settings
2. Add to `.env`: `ANYTHINGLLM_API_KEY=your_key`

### Chat Modes
Currently uses `chat` mode (general knowledge + embeddings). Can be changed to `query` mode for strict fact-based responses.

## 🐳 Docker Deployment

### Docker Compose Setup
```yaml
services:
  discord-bot:
    # Routes Discord messages to AnythingLLM

  anythingllm:
    # Runs AnythingLLM instance
    # Accessible at localhost:3009
```

### Commands
```bash
# Start both services
docker-compose up -d

# View logs
docker-compose logs -f discord-bot

# Rebuild after code changes
docker-compose up -d --build

# Stop services
docker-compose down
```

## 📝 Usage Examples

### Basic Conversation
```
User in #fitness: "What's a good workout routine?"
Bot: [Response from fitness-coach workspace]
```

### Channel Auto-Detection
```
User in #code: "How do I reverse a string in Python?"
Bot: [Response from Code workspace]

User in #finance: "Should I invest in index funds?"
Bot: [Response from Finance workspace]
```

## 🔍 Troubleshooting

### Bot Not Responding
1. Check Discord token is valid
2. Verify bot has Message Content intent enabled in Discord Developer Portal
3. Check logs: `docker-compose logs discord-bot`

### AnythingLLM Connection Errors
1. Verify AnythingLLM is running: `curl http://localhost:3009/api/health`
2. Check workspace names match exactly (case-sensitive)
3. Verify API key if required

### Workspace Not Found
1. Log into AnythingLLM (http://localhost:3009)
2. Create missing workspaces
3. Or update mapping in `AnythingLLMService.js`

## 🛠️ Development

### Local Development
```bash
npm run dev  # Auto-restart on file changes
```

### Adding New Channels
1. Create workspace in AnythingLLM
2. Add mapping to `AnythingLLMService.js`
3. Create Discord channel
4. Restart bot

### Debugging
Set `LOG_LEVEL=DEBUG` in `.env` for verbose logging.

## 📦 Dependencies

- `discord.js` - Discord API wrapper
- `axios` - HTTP client for AnythingLLM API
- `dotenv` - Environment configuration

## 🔐 Security Notes

- Keep `.env` out of version control (already in `.gitignore`)
- Use API keys if running in untrusted networks
- Run as non-root user in Docker (configured)
- AnythingLLM storage persisted in Docker volume

## 🚦 Health Checks

The bot logs startup diagnostics:
```
🤖 Bot online
📡 Connected to X server(s)
📋 Channel mappings:
  #fitness → fitness-coach
  #code → Code
  ...
```

## 📄 License

MIT

## 🤝 Contributing

This is a personal project, but feel free to fork and modify for your needs.
