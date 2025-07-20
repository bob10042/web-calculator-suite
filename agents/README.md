# Multi-Agent System with Kimi AI and Gemini Pro

This project demonstrates a multi-agent system using Kimi AI and Gemini Pro through OpenRouter's API.

## Features

- **KimiAgent**: Specialized in analysis, research, and detailed explanations
- **GeminiAgent**: Focused on creative problem-solving and mathematical computations
- **MultiAgentOrchestrator**: Coordinates agent interactions and workflows

## Agent Interaction Patterns

1. **Single Agent Query**: Use one specific agent for targeted tasks
2. **Parallel Consultation**: Get responses from both agents simultaneously
3. **Collaborative Tasks**: Sequential workflow where agents build on each other's work
4. **Agent Debates**: Agents discuss topics from different perspectives

## Setup

1. Install dependencies:
```bash
cd /home/bob43/web_projects/agents
npm install
```

2. Configure your OpenRouter API key:
```bash
cp .env.example .env
# Edit .env and add your OpenRouter API key
```

3. Get an API key from [OpenRouter](https://openrouter.ai/keys)

## Usage

### Run the Demo
```bash
npm run demo
```

### Example Usage in Code
```javascript
const { MultiAgentOrchestrator } = require('./openrouter-agents');

const orchestrator = new MultiAgentOrchestrator();

// Single agent
const response = await orchestrator.singleAgent('kimi', 'Explain quantum physics');

// Both agents
const both = await orchestrator.consultBoth('Best programming practices?');

// Collaboration
await orchestrator.collaborativeTask(
    'Design a web app',
    'Analyze requirements',
    'Provide implementation solution'
);
```

## Models Used

- **Kimi AI**: `deepseek/deepseek-chat` - Analytical and structured responses
- **Gemini Pro**: `google/gemini-pro-1.5` - Creative and mathematical solutions

## Integration with Calculator Project

This agent system can enhance your calculator applications by:
- Providing physics explanations for calculations
- Generating alternative solution approaches
- Validating complex mathematical computations
- Creating educational content for physics examples