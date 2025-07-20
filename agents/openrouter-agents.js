const axios = require('axios');

class OpenRouterAgent {
    constructor(model, name, systemPrompt = '') {
        this.model = model;
        this.name = name;
        this.systemPrompt = systemPrompt;
        this.apiKey = process.env.OPENROUTER_API_KEY;
        this.baseUrl = 'https://openrouter.ai/api/v1/chat/completions';
    }

    async invoke(userMessage, temperature = 0.7) {
        try {
            const messages = [];
            
            if (this.systemPrompt) {
                messages.push({ role: 'system', content: this.systemPrompt });
            }
            
            messages.push({ role: 'user', content: userMessage });

            const response = await axios.post(this.baseUrl, {
                model: this.model,
                messages: messages,
                temperature: temperature,
                max_tokens: 1000
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': 'http://localhost:3000',
                    'X-Title': 'Multi-Agent Calculator System'
                }
            });

            return {
                agent: this.name,
                model: this.model,
                content: response.data.choices[0].message.content,
                usage: response.data.usage
            };
        } catch (error) {
            console.error(`Error with ${this.name}:`, error.response?.data || error.message);
            throw error;
        }
    }
}

class KimiAgent extends OpenRouterAgent {
    constructor() {
        super(
            'deepseek/deepseek-chat',
            'KimiAI',
            'You are Kimi, a helpful AI assistant specialized in analysis, research, and providing detailed explanations. You excel at breaking down complex problems and providing structured responses.'
        );
    }
}

class GeminiAgent extends OpenRouterAgent {
    constructor() {
        super(
            'google/gemini-pro-1.5',
            'GeminiPro',
            'You are Gemini Pro, an AI assistant specialized in creative problem-solving, code generation, and mathematical computations. You provide innovative solutions and can handle complex calculations.'
        );
    }
}

class MultiAgentOrchestrator {
    constructor() {
        this.agents = {
            kimi: new KimiAgent(),
            gemini: new GeminiAgent()
        };
    }

    async consultBoth(query) {
        console.log(`\n🤝 Consulting both agents for: "${query}"\n`);
        
        try {
            const [kimiResponse, geminiResponse] = await Promise.all([
                this.agents.kimi.invoke(query),
                this.agents.gemini.invoke(query)
            ]);

            return {
                query,
                responses: {
                    kimi: kimiResponse,
                    gemini: geminiResponse
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error consulting agents:', error);
            throw error;
        }
    }

    async collaborativeTask(task, kimiRole, geminiRole) {
        console.log(`\n🔄 Collaborative Task: "${task}"\n`);
        
        // Step 1: Kimi analyzes the problem
        const kimiAnalysis = await this.agents.kimi.invoke(
            `${kimiRole}: ${task}`
        );
        
        console.log(`📊 Kimi's Analysis:\n${kimiAnalysis.content}\n`);
        
        // Step 2: Gemini builds on Kimi's analysis
        const geminiSolution = await this.agents.gemini.invoke(
            `${geminiRole}: Based on this analysis: "${kimiAnalysis.content}", provide your solution for: ${task}`
        );
        
        console.log(`💡 Gemini's Solution:\n${geminiSolution.content}\n`);
        
        return {
            task,
            collaboration: {
                analysis: kimiAnalysis,
                solution: geminiSolution
            },
            timestamp: new Date().toISOString()
        };
    }

    async agentDebate(topic) {
        console.log(`\n🗣️ Agent Debate on: "${topic}"\n`);
        
        const kimiPosition = await this.agents.kimi.invoke(
            `Present your position on this topic: ${topic}. Be analytical and structured.`
        );
        
        console.log(`🔍 Kimi's Position:\n${kimiPosition.content}\n`);
        
        const geminiCounter = await this.agents.gemini.invoke(
            `Respond to this position: "${kimiPosition.content}" on the topic: ${topic}. Provide alternative perspectives or build upon it creatively.`
        );
        
        console.log(`🎯 Gemini's Response:\n${geminiCounter.content}\n`);
        
        return {
            topic,
            debate: {
                kimiPosition,
                geminiCounter
            },
            timestamp: new Date().toISOString()
        };
    }

    async singleAgent(agentName, query) {
        if (!this.agents[agentName]) {
            throw new Error(`Agent ${agentName} not found. Available: ${Object.keys(this.agents).join(', ')}`);
        }
        
        return await this.agents[agentName].invoke(query);
    }
}

module.exports = { MultiAgentOrchestrator, KimiAgent, GeminiAgent, OpenRouterAgent };