#!/usr/bin/env node

require('dotenv').config();
const { MultiAgentOrchestrator } = require('./openrouter-agents');

async function demonstrateAgents() {
    console.log('🚀 Multi-Agent System Demo with Kimi AI and Gemini Pro via OpenRouter\n');
    
    if (!process.env.OPENROUTER_API_KEY) {
        console.error('❌ OPENROUTER_API_KEY environment variable is required');
        console.log('Set it with: export OPENROUTER_API_KEY="your-key-here"');
        process.exit(1);
    }
    
    const orchestrator = new MultiAgentOrchestrator();
    
    try {
        // Example 1: Single agent query
        console.log('═══════════════════════════════════════');
        console.log('🔸 Example 1: Single Agent Query');
        console.log('═══════════════════════════════════════');
        
        const kimiResponse = await orchestrator.singleAgent('kimi', 
            'Explain the physics behind quantum entanglement in simple terms'
        );
        console.log(`🔍 Kimi's Response:\n${kimiResponse.content}\n`);
        
        // Example 2: Consulting both agents
        console.log('═══════════════════════════════════════');
        console.log('🔸 Example 2: Consulting Both Agents');
        console.log('═══════════════════════════════════════');
        
        const bothResponses = await orchestrator.consultBoth(
            'What are the best strategies for learning machine learning in 2024?'
        );
        
        console.log(`🔍 Kimi's Take:\n${bothResponses.responses.kimi.content}\n`);
        console.log(`💎 Gemini's Take:\n${bothResponses.responses.gemini.content}\n`);
        
        // Example 3: Collaborative task
        console.log('═══════════════════════════════════════');
        console.log('🔸 Example 3: Collaborative Problem Solving');
        console.log('═══════════════════════════════════════');
        
        await orchestrator.collaborativeTask(
            'Design a sustainable energy system for a small island community',
            'Analyze the technical requirements and constraints',
            'Provide creative engineering solutions and implementation strategies'
        );
        
        // Example 4: Agent debate
        console.log('═══════════════════════════════════════');
        console.log('🔸 Example 4: Agent Perspective Debate');
        console.log('═══════════════════════════════════════');
        
        await orchestrator.agentDebate(
            'Should artificial intelligence development be regulated by governments?'
        );
        
        console.log('✅ Demo completed successfully!');
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        if (error.response?.data) {
            console.error('API Error Details:', error.response.data);
        }
    }
}

// Calculator-specific agent examples
async function calculatorAgentExamples() {
    console.log('\n🧮 Calculator-Specific Agent Examples\n');
    
    const orchestrator = new MultiAgentOrchestrator();
    
    try {
        // Physics calculation collaboration
        await orchestrator.collaborativeTask(
            'Calculate the energy required to accelerate a 1000kg spacecraft from Earth orbit to Mars transfer velocity',
            'Break down the physics problem and identify the required formulas and constants',
            'Perform the mathematical calculations and provide the numerical result with units'
        );
        
        // Mathematical problem solving
        const mathProblem = await orchestrator.consultBoth(
            'Solve this calculus problem: Find the area under the curve y = x² + 3x - 2 from x = 0 to x = 5'
        );
        
        console.log('📊 Math Problem Solutions:');
        console.log(`Kimi: ${mathProblem.responses.kimi.content}\n`);
        console.log(`Gemini: ${mathProblem.responses.gemini.content}\n`);
        
    } catch (error) {
        console.error('Calculator examples failed:', error.message);
    }
}

// Run the demo
if (require.main === module) {
    demonstrateAgents()
        .then(() => calculatorAgentExamples())
        .then(() => {
            console.log('\n🎉 All examples completed!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Demo failed:', error);
            process.exit(1);
        });
}

module.exports = { demonstrateAgents, calculatorAgentExamples };